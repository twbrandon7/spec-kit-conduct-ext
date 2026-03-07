# UI Contract: Pomodoro Timer Behavior

## Contract Type
Application UI interaction contract (user-to-app interface) for the toy web app.

## Scope
Defines required visible state and control behavior for:
- Mode display (`Focus`, `Short Break`, `Long Break`)
- Remaining time display (`MM:SS`)
- Controls (`Start`, `Pause`, `Reset`)
- Completion alerts (audio + notification best-effort)
- Daily focus counter

## UI Elements
- `modeLabel`: text showing active mode name.
- `timeDisplay`: text showing remaining countdown time as `MM:SS`.
- `startButton`: starts countdown when not running.
- `pauseButton`: pauses countdown when running.
- `resetButton`: resets active mode to full duration and stops timer.
- `dailyCounter`: integer showing completed focus sessions for local date.

## Commands and Effects

### Command: Start
- Precondition: timer is not running.
- Effect:
  - `isRunning = true`
  - countdown progression begins
- Idempotency rule:
  - If already running, command has no effect on speed or duplicate intervals.

### Command: Pause
- Precondition: timer is running.
- Effect:
  - `isRunning = false`
  - `remainingSeconds` preserved.

### Command: Reset
- Precondition: none.
- Effect:
  - `isRunning = false`
  - `remainingSeconds = durationSeconds(activeMode)`

## Completion Event Contract
When `remainingSeconds` reaches `0` in any mode, the app MUST:
1. Attempt audio chime playback.
2. Attempt system notification to prompt mode switch.
3. Transition mode according to rules below.

Failure handling:
- If audio fails, mode transition still occurs.
- If notification permission denied/unavailable, mode transition still occurs.

## Mode Transition Rules
- `focus` completion:
  - increments `completedFocusInCycle` and daily counter
  - if focus-in-cycle is 1..3: next mode is `shortBreak`
  - if focus-in-cycle is 4: next mode is `longBreak`, then cycle count resets to 0
- `shortBreak` completion: next mode is `focus`
- `longBreak` completion: next mode is `focus`

After each transition:
- timer is ready at full duration of the new mode
- app may auto-start or await Start based on implementation choice, but must keep visible state accurate

## Daily Counter Contract
Storage key: implementation-defined `localStorage` key for daily summary.

Stored payload shape:
```json
{
  "date": "YYYY-MM-DD",
  "completedFocusCount": 0
}
```

Rules:
- Increment `completedFocusCount` only when `focus` mode completes.
- On local date change, reset counter to `0` for the new date.
- `dailyCounter` UI must always reflect the current local date record.

## Non-Functional Expectations
- Timer display updates at user-visible one-second cadence.
- Transition at `0:00` must be reliable (no skipped state).
- Control actions must be responsive and deterministic.
