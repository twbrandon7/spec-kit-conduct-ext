# spec-kit-orchestration-ext

Orchestration wrapper for [Spec Kit](https://github.com/github/spec-kit) that runs the full spec-driven development workflow end-to-end.

## Commands

| Command | What it does |
|---------|-------------|
| `speckit.orchestration.run` | Run the full workflow: specify → plan → tasks → implement |
| `speckit.orchestration.plan` | Orchestrate the planning phase: specify → plan → tasks |

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

### Full Workflow

Run the entire spec-driven development workflow end-to-end:

```
/speckit.orchestration.run <feature name or requirements>
```

This runs all four phases in sequence, pausing for human review between each phase:

```
Phase 1: /speckit.specify  → Generate spec.md from requirements
Phase 2: /speckit.plan     → Generate plan.md from spec.md
Phase 3: /speckit.tasks    → Generate tasks.md from plan.md
Phase 4: /speckit.implement → Implement tasks from tasks.md
```

### Planning Phase Only

Orchestrate just the planning phase, stopping before implementation:

```
/speckit.orchestration.plan <feature name or requirements>
```

This runs the first three phases and produces a ready-to-implement task list:

```
Phase 1: /speckit.specify  → Generate spec.md from requirements
Phase 2: /speckit.plan     → Generate plan.md from spec.md
Phase 3: /speckit.tasks    → Generate tasks.md from plan.md
```

## Requirements

- Spec Kit `>=0.1.0`

## License

MIT
