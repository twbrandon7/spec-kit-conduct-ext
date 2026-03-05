# Quickstart: Pomodoro Wrapper Test App

## Goal
Run and validate the toy Pomodoro app implementation under `tests/` with:
- Focus/short-break/long-break transitions
- Start/Pause/Reset controls
- Completion alerts (audio + notification best-effort)
- Daily focus counter with date-scoped reset

## Implementation Layout
```text
tests/
├── node_modules -> toy-app/node_modules   # symlink for cross-dir module resolution
├── toy-app/
│   ├── src/
│   │   ├── app.ts                         # bootstrap & wiring
│   │   ├── constants.ts                   # DURATIONS, TICK_INTERVAL_MS, keys
│   │   ├── types.ts                       # TimerSession, CycleProgress, DailyFocusSummary
│   │   ├── timer-model.ts                 # pure session state functions + formatTime
│   │   ├── cycle-model.ts                 # pure cycle transition logic
│   │   ├── daily-summary.ts               # localStorage adapter with date rollover
│   │   ├── ticker.ts                      # timestamp-based setInterval ticker
│   │   ├── notifications.ts               # Notification API best-effort wrapper
│   │   ├── alerts.ts                      # Web Audio API chime (graceful fallback)
│   │   └── services/
│   │       ├── timer-service.ts           # ticker orchestration, start/pause/reset
│   │       ├── control-service.ts         # start/pause/reset with precondition guards
│   │       ├── cycle-service.ts           # mode transition coordinator
│   │       ├── alert-service.ts           # audio + notification best-effort
│   │       ├── daily-counter-service.ts   # localStorage-backed daily counter
│   │       └── completion-service.ts      # completion pipeline (alerts + counter + transition)
│   │   └── ui/
│   │       ├── timer-view.ts              # mode label + countdown DOM bindings
│   │       ├── controls-view.ts           # Start/Pause/Reset button bindings
│   │       └── daily-counter-view.ts      # daily counter DOM binding
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── playwright.config.ts
├── unit/
│   ├── pomodoro-cycle.spec.ts             # cycle transition rules
│   ├── ticker-countdown.spec.ts           # timestamp-based countdown (fake timers)
│   ├── timer-controls.spec.ts             # start/pause/reset command semantics
│   ├── daily-focus-summary.spec.ts        # daily counter + date rollover
│   └── edge-cases.spec.ts                 # notification denied, audio failure, reset at 0
├── contract/
│   ├── timer-ui-cycle.contract.spec.ts    # mode/time UI state transitions
│   ├── timer-ui-controls.contract.spec.ts # Start/Pause/Reset UI command effects
│   └── timer-ui-alerts-counter.contract.spec.ts # alert + counter UI contract
└── integration/
    ├── pomodoro-cycle.e2e.spec.ts         # Playwright: full cycle progression
    ├── timer-controls.e2e.spec.ts         # Playwright: control interactions
    ├── alerts-counter.e2e.spec.ts         # Playwright: alerts fallback + counter
    └── full-flow-regression.e2e.spec.ts   # Playwright: full flow regression
```

## Key Architecture Decisions

### Module Resolution
A symlink `tests/node_modules → tests/toy-app/node_modules` is required so that
Vitest can resolve `vitest` and other packages when test files in `tests/unit/`
and `tests/contract/` import them. The symlink is created automatically at setup.

### Timer Accuracy
The `Ticker` class uses `Math.ceil((targetEndMs - Date.now()) / 1000)` to compute
remaining seconds, avoiding drift from event-loop delays or tab throttling.

### Best-Effort Alerts
`CompletionService` wraps `alertService.fireCompletionAlert()` in a try-catch and
discards rejected promises. Timer mode transitions are **never** blocked by alert failures.

## Run locally

### Install dependencies
```bash
cd tests/toy-app
npm install
# Ensure the cross-directory module resolution symlink exists
cd .. && ln -sf toy-app/node_modules node_modules 2>/dev/null || true
```

### Start the dev server
```bash
cd tests/toy-app
npm run dev
# App available at http://localhost:5173
```

### Execute unit + contract tests
```bash
cd tests/toy-app
npm run test:unit
```

### Execute browser integration tests (requires Chromium)
```bash
cd tests/toy-app
npx playwright install chromium
npm run test:e2e
```

## Verify requirements quickly
1. Open `http://localhost:5173` — initial state must show **Focus** at **25:00**.
2. Click **Start** — countdown decrements every second.
3. Click **Pause** — countdown freezes; remaining seconds are preserved.
4. Click **Reset** — display returns to **25:00**.
5. Complete four focus sessions (or shorten durations in constants.ts for testing) —
   the fourth completion must show **Long Break** at **15:00**.
6. Verify the daily counter increments only on focus completions.
7. Verify audio chime plays on completion (if browser supports Web Audio API).

## Test Results (implementation complete)

```
Test Files  8 passed (8)
     Tests  107 passed (107)
  Start at  2026-03-05
  Duration  ~5s
```

All 107 unit and contract tests pass across 8 test suites:
- `unit/pomodoro-cycle.spec.ts` — 9 tests
- `unit/ticker-countdown.spec.ts` — 7 tests
- `unit/timer-controls.spec.ts` — 13 tests
- `unit/daily-focus-summary.spec.ts` — 11 tests
- `unit/edge-cases.spec.ts` — 14 tests
- `contract/timer-ui-cycle.contract.spec.ts` — 22 tests
- `contract/timer-ui-controls.contract.spec.ts` — 16 tests
- `contract/timer-ui-alerts-counter.contract.spec.ts` — 15 tests
