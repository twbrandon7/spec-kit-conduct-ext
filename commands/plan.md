---
description: Orchestrate the planning phase of spec-driven development (specify → plan → tasks).
handoffs:
  - label: Run full workflow
    agent: speckit.orchestration.run
    prompt: Run the full workflow including implementation
  - label: Implement tasks
    agent: speckit.implement
    prompt: Implement the tasks generated during the planning phase
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding (if not empty). If a feature name or requirements description is provided, use it as context for the planning phase.

## Goal

Orchestrate the planning phase of the Spec Kit workflow, taking a feature from requirements through to a ready-to-implement task list. Stop before implementation to allow human review of all planning artifacts.

## Workflow Phases

```
specify → plan → tasks
```

## Execution Steps

### 1. Pre-flight Check

Before starting, verify the working environment:

- Ask for the feature name or requirements description if not provided in `$ARGUMENTS`

Display the workflow that will be executed:

```
Phase 1: /speckit.specify  → Generate spec.md from requirements
Phase 2: /speckit.plan     → Generate plan.md from spec.md
Phase 3: /speckit.tasks    → Generate tasks.md from plan.md
```

Ask the user to confirm before proceeding.

### 2. Phase 1 — Specify

Run `/speckit.specify` with the feature name or requirements from `$ARGUMENTS`.

After completion:
- Confirm `spec.md` was created in the feature directory
- Display a summary of the requirements captured in `spec.md`
- Ask the user to review and confirm the spec before continuing to the next phase

**Human Gate**: Wait for explicit approval (`y`, `yes`) before proceeding. Default is NO.

### 3. Phase 2 — Plan

Run `/speckit.plan` for the feature created in Phase 1.

After completion:
- Confirm `plan.md` was created in the feature directory
- Display a summary of the architecture and implementation approach from `plan.md`
- Ask the user to review and confirm the plan before continuing

**Human Gate**: Wait for explicit approval (`y`, `yes`) before proceeding. Default is NO.

### 4. Phase 3 — Tasks

Run `/speckit.tasks` for the feature to generate the implementation task list.

After completion:
- Confirm `tasks.md` was created in the feature directory
- Display the number of tasks generated and a brief summary of the implementation plan

### 5. Planning Summary

Display a final summary of the completed planning phase:

```
✅ Planning Phase Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:      <feature name>
Directory:    <feature directory>

Artifacts generated:
  ✓ spec.md   — Requirements specification
  ✓ plan.md   — Architecture and implementation plan
  ✓ tasks.md  — Implementation task list (<N> tasks ready)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Suggest running `/speckit.implement` or `/speckit.orchestration.run` to proceed with implementation.
