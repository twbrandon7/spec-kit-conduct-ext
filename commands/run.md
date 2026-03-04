---
description: Run the full spec-driven development workflow end-to-end (specify → plan → tasks → implement).
handoffs:
  - label: Run cleanup
    agent: speckit.cleanup.run
    prompt: Run cleanup to review implementation changes and identify tech debt
  - label: Run retrospective
    agent: speckit.retrospective.analyze
    prompt: Run retrospective to analyze spec adherence and implementation drift
---

## User Input

```text
$ARGUMENTS
```

Consider user input before proceeding (if not empty). If a feature name or requirements description is provided, use it as context for the workflow.

## Goal

Orchestrate the complete Spec Kit workflow from requirements to implementation in a single end-to-end run. Execute each phase in sequence, pausing for human review at key decision points.

## Workflow Phases

```
specify → plan → tasks → implement
```

## Execution Steps

### 1. Pre-flight Check

Before starting, verify the working environment:

- Confirm the user wants to run the full workflow
- Ask for the feature name or requirements description if not provided in `$ARGUMENTS`
- Confirm all required spec-kit commands are available

Display the workflow that will be executed:

```
Phase 1: /speckit.specify  → Generate spec.md from requirements
Phase 2: /speckit.plan     → Generate plan.md from spec.md
Phase 3: /speckit.tasks    → Generate tasks.md from plan.md
Phase 4: /speckit.implement → Implement tasks from tasks.md
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
- Display the number of tasks generated and a brief summary
- Ask the user to review and confirm the task list before implementation

**Human Gate**: Wait for explicit approval (`y`, `yes`) before proceeding. Default is NO.

### 5. Phase 4 — Implement

Run `/speckit.implement` to execute the tasks from `tasks.md`.

After completion:
- Confirm all tasks are marked as complete in `tasks.md`
- Display a summary of files created or modified during implementation

### 6. Completion Summary

Display a final summary of the completed workflow:

```
✅ Orchestration Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:      <feature name>
Directory:    <feature directory>

Artifacts generated:
  ✓ spec.md       — Requirements specification
  ✓ plan.md       — Architecture and implementation plan
  ✓ tasks.md      — Implementation task list (all tasks complete)

Implementation:
  ✓ All tasks implemented successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Suggest running post-implementation extensions (cleanup, retrospective) if available.
