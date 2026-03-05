<!--
Sync Impact Report
- Version change: template-unversioned -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Orchestration-First Scope
	- Template Principle 2 -> II. Tests-Sandbox Source Placement (NON-NEGOTIABLE)
	- Template Principle 3 -> III. Spec-Driven Workflow Fidelity
	- Template Principle 4 -> IV. Traceable Quality Gates
	- Template Principle 5 -> V. Template and Guidance Synchronization
- Added sections:
	- Repository Boundaries
	- Delivery Workflow
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ reviewed: .specify/templates/spec-template.md
	- ⚠ pending review source absent: .specify/templates/commands/*.md
	- ✅ updated guidance file: .github/agents/speckit.tasks.agent.md
- Follow-up TODOs:
	- None
-->

# spec-kit-orchestration-ext Constitution

## Core Principles

### I. Orchestration-First Scope
This repository MUST prioritize orchestration extension behavior for Spec Kit workflows.
Production extension logic, command metadata, and orchestration instructions MUST remain
separate from demo application code used for flow validation. Rationale: this keeps
extension reliability independent from sample feature code.

### II. Tests-Sandbox Source Placement (NON-NEGOTIABLE)
Any toy application source code used to validate spec-driven development flow MUST be
stored under `tests/`. New feature implementations generated for demonstration MUST use
paths rooted in `tests/` (for example `tests/toy-app/...`) and MUST NOT create a root
`src/` tree for toy app code. Rationale: toy app code is test scaffolding, not the
product delivered by this repository.

### III. Spec-Driven Workflow Fidelity
Changes MUST preserve the end-to-end sequence `specify -> plan -> tasks -> implement`
and MUST keep artifacts internally consistent (`spec.md`, `plan.md`, `tasks.md`, and
implementation outputs). Rationale: orchestration value depends on deterministic,
repeatable phase handoffs.

### IV. Traceable Quality Gates
Every planning and implementation change MUST include explicit Constitution Check
coverage, file-path traceability in tasks, and verifiable validation steps for both
orchestration behavior and toy app behavior. Rationale: quality controls are enforceable
only when checks are concrete and auditable.

### V. Template and Guidance Synchronization
When governance or path conventions change, maintainers MUST update affected templates
and agent guidance in the same change set. No principle may be declared without
corresponding template or guidance alignment. Rationale: stale templates produce
systematic drift and non-compliant outputs.

## Repository Boundaries

- Extension and orchestration assets live in repository-level config and command paths
	such as `commands/`, `extension.yml`, and `.specify/`.
- Toy app and flow-validation source code lives under `tests/`.
- Feature specs and planning artifacts live under `specs/`.
- Introducing alternative source roots for toy app code requires a constitution
	amendment before use.

## Delivery Workflow

- All generated plans MUST include a Constitution Check item verifying source placement
	under `tests/`.
- All generated tasks MUST include concrete file paths and keep toy app implementation
	paths under `tests/`.
- Pull requests that change templates or orchestration guidance MUST include a brief sync
	note describing which files were checked or updated.

## Governance

This constitution is the highest-priority project policy for workflow and repository
structure decisions.

- Amendment process: changes require (1) explicit update to this file, (2) a sync impact
	note at the top of this file, and (3) updates to affected templates or guidance files
	in the same pull request.
- Versioning policy: semantic versioning applies to this constitution.
	- MAJOR: incompatible governance or principle removal/redefinition.
	- MINOR: new principle/section or materially expanded mandates.
	- PATCH: clarifications, wording improvements, and non-semantic edits.
- Compliance review: each planning and implementation cycle MUST verify constitution
	conformance during review, and non-conformant outputs MUST be corrected before merge.

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
