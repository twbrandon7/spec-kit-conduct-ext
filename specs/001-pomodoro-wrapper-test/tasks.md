# Tasks: Pomodoro Wrapper Test App

**Input**: Design documents from `/specs/001-pomodoro-wrapper-test/`
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Test tasks are included because testing is explicitly requested in the feature docs (Vitest + Playwright, plus quickstart scenarios).

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling under `tests/toy-app/`

- [ ] T001 Create toy app directory structure in `tests/toy-app/`
- [ ] T002 Initialize npm project and scripts in `tests/toy-app/package.json`
- [ ] T003 [P] Configure TypeScript compiler in `tests/toy-app/tsconfig.json`
- [ ] T004 [P] Configure Vite dev/build setup in `tests/toy-app/vite.config.ts`
- [ ] T005 [P] Configure Vitest in `tests/toy-app/vitest.config.ts`
- [ ] T006 [P] Configure Playwright for browser integration tests in `tests/toy-app/playwright.config.ts`
- [ ] T007 [P] Create base HTML shell and app mount points in `tests/toy-app/index.html`
- [ ] T008 [P] Add starter entrypoint and bootstrapping wire-up in `tests/toy-app/src/app.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core timer domain and shared services that block all user stories

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [ ] T009 Define shared timer constants and mode durations in `tests/toy-app/src/constants.ts`
- [ ] T010 [P] Define shared TypeScript domain types for session/cycle/daily summary in `tests/toy-app/src/types.ts`
- [ ] T011 Implement `TimerSession` state model and transition guards in `tests/toy-app/src/timer-model.ts`
- [ ] T012 Implement `CycleProgress` state model and long-break trigger logic in `tests/toy-app/src/cycle-model.ts`
- [ ] T013 Implement `DailyFocusSummary` storage adapter with date rollover handling in `tests/toy-app/src/daily-summary.ts`
- [ ] T014 Implement timestamp-based ticker utility to avoid drift in `tests/toy-app/src/ticker.ts`
- [ ] T015 [P] Implement notification service with permission-aware fallback in `tests/toy-app/src/notifications.ts`
- [ ] T016 [P] Implement audio chime service with graceful error handling in `tests/toy-app/src/alerts.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Run A Standard Pomodoro Cycle (Priority: P1) 🎯 MVP

**Goal**: Deliver reliable focus/short-break/long-break transitions with correct cycle behavior.

**Independent Test**: Start from Focus at `25:00`, run completions, and verify short break after normal focus completions and long break after the fourth focus completion.

### Tests for User Story 1

- [ ] T017 [P] [US1] Add unit tests for mode transition rules in `tests/unit/pomodoro-cycle.spec.ts`
- [ ] T018 [P] [US1] Add unit tests for timestamp-based countdown completion in `tests/unit/ticker-countdown.spec.ts`
- [ ] T019 [P] [US1] Add contract test for mode/time UI state transitions in `tests/contract/timer-ui-cycle.contract.spec.ts`
- [ ] T020 [P] [US1] Add Playwright integration flow for full cycle progression in `tests/integration/pomodoro-cycle.e2e.spec.ts`

### Implementation for User Story 1

- [ ] T021 [US1] Implement cycle transition coordinator using timer + cycle models in `tests/toy-app/src/services/cycle-service.ts`
- [ ] T022 [US1] Implement timer tick orchestration and completion dispatch in `tests/toy-app/src/services/timer-service.ts`
- [ ] T023 [US1] Render active mode label and countdown display bindings in `tests/toy-app/src/ui/timer-view.ts`
- [ ] T024 [US1] Wire app bootstrap to initialize Focus `25:00` and expose transition state in `tests/toy-app/src/app.ts`

**Checkpoint**: User Story 1 is independently functional and testable

---

## Phase 4: User Story 2 - Control The Active Timer (Priority: P2)

**Goal**: Provide responsive Start, Pause, and Reset controls with deterministic behavior.

**Independent Test**: Use only control buttons to verify start, pause preservation, reset-to-full-duration, and idempotent start behavior.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add unit tests for start/pause/reset command semantics in `tests/unit/timer-controls.spec.ts`
- [ ] T026 [P] [US2] Add contract test for Start/Pause/Reset UI command effects in `tests/contract/timer-ui-controls.contract.spec.ts`
- [ ] T027 [P] [US2] Add Playwright integration test for control interactions in `tests/integration/timer-controls.e2e.spec.ts`

### Implementation for User Story 2

- [ ] T028 [US2] Implement control command handlers with duplicate-start guard in `tests/toy-app/src/services/control-service.ts`
- [ ] T029 [US2] Implement control button component and event bindings in `tests/toy-app/src/ui/controls-view.ts`
- [ ] T030 [US2] Integrate control service with timer service and UI state updates in `tests/toy-app/src/app.ts`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Receive Completion Alerts And Track Progress (Priority: P3)

**Goal**: Trigger completion alerts and maintain a local-date daily focus completion counter.

**Independent Test**: Complete focus sessions and validate audio/notification behavior plus daily counter increment/reset on date rollover.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add unit tests for daily counter increment and date reset logic in `tests/unit/daily-focus-summary.spec.ts`
- [ ] T032 [P] [US3] Add contract test for completion alert and daily counter UI contract in `tests/contract/timer-ui-alerts-counter.contract.spec.ts`
- [ ] T033 [P] [US3] Add Playwright integration test for alerts fallback and daily counter updates in `tests/integration/alerts-counter.e2e.spec.ts`

### Implementation for User Story 3

- [ ] T034 [US3] Implement completion alert coordinator to invoke audio and notifications best-effort in `tests/toy-app/src/services/alert-service.ts`
- [ ] T035 [US3] Implement daily counter service backed by `localStorage` date-keyed record in `tests/toy-app/src/services/daily-counter-service.ts`
- [ ] T036 [US3] Render daily counter UI and update bindings in `tests/toy-app/src/ui/daily-counter-view.ts`
- [ ] T037 [US3] Integrate completion pipeline to increment counters and dispatch alerts on focus completion in `tests/toy-app/src/services/completion-service.ts`
- [ ] T038 [US3] Wire alert/counter services into app lifecycle and midnight rollover checks in `tests/toy-app/src/app.ts`

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repository-wide quality, docs, and final validation

- [ ] T039 [P] Add unit test coverage for edge cases (notification denied, audio failure, reset at `0:00`) in `tests/unit/edge-cases.spec.ts`
- [ ] T040 [P] Add integration regression for focus-cycle + controls + counter continuity in `tests/integration/full-flow-regression.e2e.spec.ts`
- [ ] T041 Update quickstart execution notes and verification checklist in `specs/001-pomodoro-wrapper-test/quickstart.md`
- [ ] T042 Add implementation notes and architecture decisions to feature docs in `specs/001-pomodoro-wrapper-test/research.md`
- [ ] T043 Run full validation scripts and capture outcomes in `specs/001-pomodoro-wrapper-test/checklists/requirements.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; starts immediately
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; first MVP slice
- **Phase 4 (US2)**: Depends on Phase 2 and integrates with US1 timer flow
- **Phase 5 (US3)**: Depends on Phase 2 and completion events from US1
- **Phase 6 (Polish)**: Depends on completion of selected user stories

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other stories
- **US2 (P2)**: Starts after Foundational; uses shared timer model and can be validated independently
- **US3 (P3)**: Starts after Foundational; uses completion events and can be validated independently

### Completion Order

Setup -> Foundational -> US1 -> US2 -> US3 -> Polish

---

## Parallel Execution Examples

### User Story 1

```bash
Task T017 tests/unit/pomodoro-cycle.spec.ts
Task T018 tests/unit/ticker-countdown.spec.ts
Task T019 tests/contract/timer-ui-cycle.contract.spec.ts
Task T020 tests/integration/pomodoro-cycle.e2e.spec.ts
```

### User Story 2

```bash
Task T025 tests/unit/timer-controls.spec.ts
Task T026 tests/contract/timer-ui-controls.contract.spec.ts
Task T027 tests/integration/timer-controls.e2e.spec.ts
```

### User Story 3

```bash
Task T031 tests/unit/daily-focus-summary.spec.ts
Task T032 tests/contract/timer-ui-alerts-counter.contract.spec.ts
Task T033 tests/integration/alerts-counter.e2e.spec.ts
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate US1 independently against cycle acceptance criteria

### Incremental Delivery

1. Deliver US1 as MVP and verify independently
2. Add US2 controls without regressing US1 cycle behavior
3. Add US3 alerts/counter and verify date rollover behavior
4. Execute polish/regression tasks before final sign-off

### Parallel Team Strategy

1. Pair on Setup + Foundational tasks first
2. After Foundational completion, split by story:
3. Engineer A: US1
4. Engineer B: US2
5. Engineer C: US3
6. Rejoin for Phase 6 cross-cutting validation

---

## Notes

- `[P]` tasks touch separate files and have no blocking dependency on incomplete tasks
- Story labels map each implementation/test task to exactly one user story
- Each user story phase includes explicit independent test criteria
- Checklist format is strictly enforced for every task line
