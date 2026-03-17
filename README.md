# spec-kit-orchestration-ext

Orchestration wrapper for [Spec Kit](https://github.com/github/spec-kit) that executes each spec-kit phase with sub-agents to stabilize behavior and reduce context pollution in the main agent.

## Commands

| Command | What it does |
|---------|-------------|
| `speckit.orchestration.run` | Run one phase (`specify`, `plan`, `tasks`, or `implement`) through step-by-step sub-agent orchestration |

## Installation

Install from the latest release (requires a [tagged release](https://github.com/twbrandon7/spec-kit-orchestration-ext/releases) to exist):

```sh
specify extension add --from https://github.com/twbrandon7/spec-kit-orchestration-ext/archive/refs/tags/v1.0.0.zip
```

Or for local development:

```sh
specify extension add --dev /path/to/spec-kit-orchestration-ext
```

## Usage

### Phase-by-Phase Execution

Run one phase at a time. Each invocation delegates that phase's steps to sub-agents and keeps the main agent context clean.

```
/speckit.orchestration.run <phase> <feature name or requirements>
```

Supported phase values:

```
constitution
specify
plan
tasks
implement
```

Run each phase separately:

```
/speckit.orchestration.run specify Build a pomodoro app
/speckit.orchestration.run plan
/speckit.orchestration.run tasks
/speckit.orchestration.run implement
```

The command does not run all phases in one invocation. You should review outputs between phases and then trigger the next phase explicitly.

## Framework Configuration

If you want to explicitly specify the AI coding tool for orchestration, set `framework` in `.specify/extensions.yml`:

```yaml
installed:
	- orchestration

settings:
	orchestration:
		framework: "copilot"
```

`load.sh` returns that value in its JSON output as `framework`. Supported values match the agent identifiers used by the loader: `copilot`, `claude`, `gemini`, `cursor-agent`, `qwen`, `opencode`, `codex`, `windsurf`, `kilocode`, `auggie`, `roo`, `codebuddy`, `amp`, `shai`, `kiro-cli`, `bob`, `qodercli`, `tabnine`, `kimi`, `generic`.

## Requirements

- Spec Kit `>=0.1.0`

## License

MIT
