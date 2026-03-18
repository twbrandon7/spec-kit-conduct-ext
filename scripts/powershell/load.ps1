#!/usr/bin/env pwsh
<#
.SYNOPSIS
Resolve the installed Spec Kit command file for the active coding agent.

.DESCRIPTION
This script resolves the installed Spec Kit command file based on the requested phase
and the detected active coding agent. It returns JSON with the resolved file path and
optional framework metadata from .specify/extensions.yml.

.PARAMETER Phase
The spec-kit phase name (e.g., 'specify', 'plan', 'implement').

.EXAMPLE
.\load.ps1 specify
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Phase
)

$ErrorActionPreference = 'Stop'

function JsonEscape {
    param([string]$Value)
    $Value = $Value -replace '\\', '\\'
    $Value = $Value -replace '"', '\"'
    $Value = $Value -replace "`n", '\n'
    $Value = $Value -replace "`r", '\r'
    $Value = $Value -replace "`t", '\t'
    return $Value
}

function NormalizeAgent {
    param([string]$Agent)
    switch ($Agent) {
        'cursor' { return 'cursor-agent' }
        'kiro' { return 'kiro-cli' }
        { $_ -eq 'github-copilot' -or $_ -eq 'github_copilot' } { return 'copilot' }
        default { return $Agent }
    }
}

function ResolveAgentPath {
    param(
        [string]$RepoRoot,
        [string]$Agent,
        [string]$Phase
    )
    
    switch ($Agent) {
        'copilot' { return "$RepoRoot/.github/agents/speckit.$Phase.agent.md" }
        'claude' { return "$RepoRoot/.claude/commands/speckit.$Phase.md" }
        'gemini' { return "$RepoRoot/.gemini/commands/speckit.$Phase.toml" }
        'cursor-agent' { return "$RepoRoot/.cursor/commands/speckit.$Phase.md" }
        'qwen' { return "$RepoRoot/.qwen/commands/speckit.$Phase.md" }
        'opencode' { return "$RepoRoot/.opencode/command/speckit.$Phase.md" }
        'codex' { return "$RepoRoot/.codex/commands/speckit.$Phase.md" }
        'windsurf' { return "$RepoRoot/.windsurf/workflows/speckit.$Phase.md" }
        'kilocode' { return "$RepoRoot/.kilocode/rules/speckit.$Phase.md" }
        'auggie' { return "$RepoRoot/.augment/rules/speckit.$Phase.md" }
        'roo' { return "$RepoRoot/.roo/rules/speckit.$Phase.md" }
        'codebuddy' { return "$RepoRoot/.codebuddy/commands/speckit.$Phase.md" }
        'amp' { return "$RepoRoot/.agents/commands/speckit.$Phase.md" }
        'shai' { return "$RepoRoot/.shai/commands/speckit.$Phase.md" }
        'kiro-cli' { return "$RepoRoot/.kiro/prompts/speckit.$Phase.md" }
        'bob' { return "$RepoRoot/.bob/commands/speckit.$Phase.md" }
        'qodercli' { return "$RepoRoot/.qoder/commands/speckit.$Phase.md" }
        'tabnine' { return "$RepoRoot/.tabnine/agent/commands/speckit.$Phase.toml" }
        'kimi' { return "$RepoRoot/.kimi/skills/speckit.$Phase.md" }
        'generic' {
            if ($env:SPECIFY_AI_COMMANDS_DIR) {
                return "$RepoRoot/$($env:SPECIFY_AI_COMMANDS_DIR)/speckit.$Phase.md"
            }
            return $null
        }
        default { return $null }
    }
}

function ExtractFramework {
    param([string]$ConfigFile)
    
    if (-not (Test-Path $ConfigFile)) {
        return ''
    }
    
    $content = Get-Content -Path $ConfigFile -Raw
    $lines = $content -split "`n"
    
    $inSettings = $false
    $inOrchestration = $false
    $settingsIndent = -1
    $orchestrationIndent = -1
    
    foreach ($line in $lines) {
        # Skip comments and empty lines
        if ($line -match '^\s*#' -or $line -match '^\s*$') {
            continue
        }
        
        $indent = if ($line -match '^\s+') { ($line | Select-String '^\s+').Matches[0].Length } else { 0 }
        
        # Check if we're exiting settings block
        if ($inSettings -and $indent -le $settingsIndent -and $line -notmatch '^\s*settings:\s*$') {
            $inSettings = $false
            $inOrchestration = $false
        }
        
        # Check if we're entering settings block
        if ($line -match '^\s*settings:\s*$') {
            $inSettings = $true
            $settingsIndent = $indent
            continue
        }
        
        # Check if we're entering orchestration block within settings
        if ($inSettings -and $line -match '^\s*orchestration:\s*$') {
            $inOrchestration = $true
            $orchestrationIndent = $indent
            continue
        }
        
        # Extract framework from orchestration section
        if ($inOrchestration -and $line -match '^\s*framework:\s*') {
            $framework = $line -replace '^\s*framework:\s*', ''
            $framework = $framework -replace '^["\']|["\']$', ''
            return $framework.Trim()
        }
        
        # Extract framework from top-level settings section
        if ($inSettings -and -not $inOrchestration -and $line -match '^\s*framework:\s*') {
            $framework = $line -replace '^\s*framework:\s*', ''
            $framework = $framework -replace '^["\']|["\']$', ''
            return $framework.Trim()
        }
    }
    
    return ''
}

function GetRepoRoot {
    $current = Get-Location
    while ($current.Path -ne $current.Parent.Path) {
        if (Test-Path (Join-Path $current.Path '.git')) {
            return $current.Path
        }
        $current = $current.Parent
    }
    throw "Not in a git repository"
}

try {
    # Validate phase format
    if ($Phase -notmatch '^[a-z0-9-]+$') {
        Write-Error "Invalid phase '$Phase'. Expected lowercase letters, numbers, or hyphens."
        exit 1
    }
    
    $repoRoot = GetRepoRoot
    $configFile = Join-Path $repoRoot '.specify/extensions.yml'
    $framework = ExtractFramework -ConfigFile $configFile
    
    # Determine ordered list of agents to check
    $orderedAgents = @()
    $preferredAgent = NormalizeAgent -Agent ($env:ORCHESTRATION_AGENT, $env:SPECIFY_AI -join '')
    
    if ($preferredAgent) {
        $orderedAgents += $preferredAgent
    }
    
    $allAgents = @(
        'copilot', 'claude', 'gemini', 'cursor-agent', 'qwen', 'opencode', 'codex',
        'windsurf', 'kilocode', 'auggie', 'roo', 'codebuddy', 'amp', 'shai', 'kiro-cli',
        'bob', 'qodercli', 'tabnine', 'kimi', 'generic'
    )
    
    foreach ($agent in $allAgents) {
        if ($agent -ne $preferredAgent) {
            $orderedAgents += $agent
        }
    }
    
    # Resolve the agent path
    $resolvedAgent = ''
    $resolvedPath = ''
    
    foreach ($agent in $orderedAgents) {
        $candidatePath = ResolveAgentPath -RepoRoot $repoRoot -Agent $agent -Phase $Phase
        if ($candidatePath -and (Test-Path $candidatePath)) {
            $resolvedAgent = $agent
            $resolvedPath = $candidatePath
            break
        }
    }
    
    if (-not $resolvedPath) {
        Write-Error "Unable to resolve an installed command file for phase '$Phase'. Checked repo root: $repoRoot"
        if ($preferredAgent) {
            Write-Error "Preferred agent override: $preferredAgent"
        }
        exit 1
    }
    
    # Extract file extension
    $extension = [System.IO.Path]::GetExtension($resolvedPath).TrimStart('.')
    
    # Output JSON (formatted for consistency with Bash version)
    $output = @{
        phase = $Phase
        agent = $resolvedAgent
        resolved_path = $resolvedPath
        format = $extension
        config_path = $configFile
        framework = $framework
    } | ConvertTo-Json
    
    Write-Output $output
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
