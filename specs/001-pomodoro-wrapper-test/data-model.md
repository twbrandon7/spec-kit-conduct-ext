# Data Model: Pomodoro Wrapper Test App

## Overview
This feature uses a small client-side state model with three core entities:
- `TimerSession`: Active mode and countdown state.
- `CycleProgress`: Completed-focus count used to determine short vs long break.
- `DailyFocusSummary`: Date-scoped focus completion count persisted in `localStorage`.

## Entity: TimerSession

### Fields
- `mode: "focus" | "shortBreak" | "longBreak"`
- `durationSeconds: number`
- `remainingSeconds: number`
- `isRunning: boolean`
- `startedAtMs?: number` (epoch ms, set when running)
- `targetEndMs?: number` (epoch ms, set when running)

### Validation Rules
- `mode` MUST be one of `focus`, `shortBreak`, `longBreak` (FR-001).
- `durationSeconds` MUST match configured mode durations:
  - `focus = 1500`
  - `shortBreak = 300`
  - `longBreak = 900`
- `remainingSeconds` MUST be in range `0..durationSeconds`.
- `isRunning = false` implies no active countdown progression (FR-011).
- `isRunning = true` implies `targetEndMs` exists and is in the future or exactly now.

### State Transitions
- `idle -> running`: Start clicked while not running.
- `running -> paused`: Pause clicked; keep `remainingSeconds` unchanged.
- `running|paused -> idle`: Reset clicked; set `remainingSeconds = durationSeconds`, `isRunning = false`.
- `running -> completed`: `remainingSeconds` reaches `0`; trigger alerts and mode switch.

## Entity: CycleProgress

### Fields
- `completedFocusInCycle: number` (0..4)

### Validation Rules
- MUST remain in range `0..4`.
- Increment ONLY when a focus session completes at `0:00` (FR-008).
- On value `4`, next mode MUST be `longBreak`; then reset to `0` after long-break transition is scheduled (FR-004).

### State Transitions
- On focus completion:
  - if value `1..3`: next mode `shortBreak`
  - if value `4`: next mode `longBreak`, then cycle counter resets to `0`
- Non-focus mode completion does not increment this value.

## Entity: DailyFocusSummary

### Fields
- `date: string` (`YYYY-MM-DD`, local calendar date)
- `completedFocusCount: number` (>= 0)

### Persistence Shape
```json
{
  "date": "2026-03-05",
  "completedFocusCount": 3
}
```

### Validation Rules
- `date` MUST be local-date formatted `YYYY-MM-DD`.
- `completedFocusCount` MUST be an integer `>= 0`.
- Increment ONLY on completed focus sessions (FR-008).
- Reset to `0` when local date changes (FR-010).

### State Transitions
- App load or timer interaction checks local date:
  - same date: keep count
  - new date: set `completedFocusCount = 0`, update `date`

## Relationships
- `TimerSession.mode` determines `durationSeconds` and reset target.
- `CycleProgress.completedFocusInCycle` determines the next `TimerSession.mode` after focus completion.
- `DailyFocusSummary.completedFocusCount` increments when `TimerSession.mode == focus` reaches 0.

## Derived/Computed Values
- Display time text: `MM:SS` from `remainingSeconds` (FR-007).
- Next mode at completion:
  - focus -> short break (normally)
  - focus -> long break (every 4th focus completion)
  - short break/long break -> focus
- Daily counter display: from `DailyFocusSummary.completedFocusCount` (FR-009).
