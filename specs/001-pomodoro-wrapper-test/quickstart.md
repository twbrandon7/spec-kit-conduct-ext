# Quickstart: Pomodoro Wrapper Test App

## Goal
Run and validate the toy Pomodoro app implementation under `tests/` with:
- Focus/short-break/long-break transitions
- Start/Pause/Reset controls
- Completion alerts (audio + notification best-effort)
- Daily focus counter with date-scoped reset

## Suggested Test Project Layout
```text
tests/
├── toy-app/
│   ├── src/
│   │   ├── app.ts
│   │   ├── timer-model.ts
│   │   ├── cycle-model.ts
│   │   ├── daily-summary.ts
│   │   └── alerts.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── unit/
└── integration/
```

## 1. Create the toy app scaffold
From repository root:
```bash
mkdir -p tests/toy-app/src tests/unit tests/integration
cd tests/toy-app
npm init -y
npm i -D typescript vite vitest @playwright/test
npx tsc --init
```

## 2. Add npm scripts
In `tests/toy-app/package.json`, configure scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## 3. Implement feature behavior
Build the app so these behaviors hold:
- Initial state: Focus mode at `25:00`, not running.
- Start: begins countdown once; repeated clicks while running are ignored.
- Pause: stops progression without changing remaining time.
- Reset: sets active mode back to full duration and stops countdown.
- Completion at `0:00`:
  - play audio chime (best effort)
  - show system notification (best effort)
  - transition to next mode using cycle rules
- Daily counter:
  - increments only on completed focus sessions
  - persists in `localStorage`
  - resets when local date changes

## 4. Run locally
```bash
cd /workspaces/spec-kit-orchestration-ext/tests/toy-app
npm run dev
```

## 5. Verify requirements quickly
1. Complete one focus session and verify transition to short break.
2. Complete four focus sessions and verify the fourth transitions to long break.
3. Verify Start/Pause/Reset behavior in each mode.
4. Verify at least one alert path (audio or notification) is visible when timer completes.
5. Change local date context or simulate date rollover and verify daily counter resets.

## 6. Execute tests
```bash
cd /workspaces/spec-kit-orchestration-ext/tests/toy-app
npm run test:unit
npm run test:e2e
```
