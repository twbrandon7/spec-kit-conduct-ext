# Phase 0 Research: Pomodoro Wrapper Test App

## Scope
Resolve all `NEEDS CLARIFICATION` items from Technical Context in `plan.md`:
- Language/version
- Primary dependencies/framework
- Persistence mechanism for daily counter
- Testing/tooling

Also capture best-practice integration patterns for:
- Browser notifications and audio alerts
- Timer accuracy and mode-transition reliability

## Research Findings

### 1) Language and Runtime
Decision: Use TypeScript (ES2022 target) running in the browser.

Rationale: TypeScript reduces state-machine and timer-transition mistakes by making mode/state contracts explicit while remaining simple to run as plain browser JavaScript after compile. The toy app has small scope but several state transitions (focus/short/long break, pause/reset, day rollover) where typed models improve reliability.

Alternatives considered:
- Plain JavaScript: simpler setup, but weaker guardrails for transition/state bugs.
- Framework-specific TS (React/Vue/etc.): unnecessary complexity for a toy orchestration-validation app.

### 2) Dependencies and Framework Strategy
Decision: Use no UI framework and minimal dependencies; rely on Web APIs (`setInterval`, Notifications API, HTMLAudioElement/Web Audio) plus a light TypeScript + test toolchain.

Rationale: The repository currently has no app scaffold under `tests/`, and constitution emphasizes workflow fidelity over framework exploration. Vanilla DOM keeps implementation transparent for orchestration testing and avoids boilerplate.

Alternatives considered:
- React + Vite: good DX, but adds dependency and build complexity not required for feature scope.
- Svelte/Vue: similarly capable, but unnecessary abstraction for this test app.

### 3) Persistence Mechanism
Decision: Persist daily focus summary in `localStorage` as `{ date: YYYY-MM-DD, completedFocusCount: number }` and reset when local date changes.

Rationale: `localStorage` is sufficient for a single-user toy app, requires no backend, and supports the requirement to preserve count while app remains available locally. A date-keyed payload enables deterministic reset logic at load and on each tick/interaction boundary.

Alternatives considered:
- In-memory only: fails persistence across refresh/reopen.
- IndexedDB: robust but overkill for one small counter object.
- Cookies: less suitable semantics and unnecessary request coupling.

### 4) Testing and Tooling
Decision: Use Vitest for unit tests and Playwright for browser integration checks, both rooted under `tests/`.

Rationale: Vitest provides fast deterministic tests with fake timers for countdown/transition logic; Playwright validates real browser behavior for controls, notification fallback behavior, and visible timer state. This pairing covers both algorithmic correctness and user-facing flow.

Alternatives considered:
- Jest + jsdom only: strong unit testing, weaker confidence for browser-specific notification/audio interactions.
- Cypress e2e only: good UI checks, but less efficient for deep timer-state unit coverage.
- Manual-only testing: insufficient traceability for quality gates.

### 5) Notification Integration Pattern
Decision: Treat system notifications as best-effort: request permission lazily, show notification only when permitted, and always continue timer/mode transitions regardless of permission result.

Rationale: Requirements and edge cases explicitly require behavior continuity when notifications are blocked. Decoupling transition logic from notification success avoids regressions.

Alternatives considered:
- Blocking start until notification permission granted: violates UX and requirement assumptions.
- Failing timer completion when notification fails: violates edge-case requirements.

### 6) Audio Alert Integration Pattern
Decision: Preload a short chime asset and call `audio.play()` on completion with graceful error handling; if playback fails, continue with mode transition and notification path.

Rationale: Browser autoplay or device limitations can prevent playback; requirement allows fallback as long as at least one user-visible alert path remains available.

Alternatives considered:
- Web Audio synthesized tone only: possible but more code and browser policy edge handling.
- Hard fail on audio errors: violates resilience constraints.

### 7) Timer Accuracy and Transition Reliability
Decision: Use a monotonic timestamp-based countdown (`targetEndMs - now`) updated every second for UI, rather than decrementing by fixed 1000 ms steps.

Rationale: Timestamp-based calculation resists tab throttling and event-loop drift, improving correctness at 0:00 boundaries and reducing skipped/late transitions.

Alternatives considered:
- Naive decrement-per-tick (`remaining--`): simple but drift-prone.
- `requestAnimationFrame` loop: unnecessary granularity for 1-second display updates.

## Clarification Resolution Summary
- `Language/Version`: Resolved to TypeScript (ES2022, browser runtime).
- `Primary Dependencies`: Resolved to vanilla DOM/Web APIs + minimal TS/test tooling (no UI framework).
- `Storage`: Resolved to `localStorage` with date-keyed daily counter object.
- `Testing`: Resolved to Vitest (unit/fake timers) + Playwright (integration/browser behavior).

All `NEEDS CLARIFICATION` items from Technical Context are resolved in this document.

---

## Implementation Notes (Post-Build)

### Architecture Decisions Made During Implementation

#### 1. Module Resolution for Cross-Directory Tests
**Problem**: Vitest runs from `tests/toy-app/` but test files live in `tests/unit/` and
`tests/contract/`. Vite's module resolver starts from the importing file's directory when
resolving bare imports (e.g., `vitest`), so it can't find packages in `tests/toy-app/node_modules`.

**Solution**: Create a symlink `tests/node_modules → tests/toy-app/node_modules`. Node.js
module resolution traverses parent directories, finding the symlink at the `tests/` level.
This is a standard monorepo pattern and requires no changes to import paths in test files.

**Vitest config**: `root` is set to `../` (tests/) so test discovery works with relative
`include` patterns, while `server.fs.allow` is set to the repo root to allow Vite to serve
any file in the project.

#### 2. Best-Effort Alert Isolation
**Problem**: `void this.alertService.fireCompletionAlert(...)` discards async rejection
but does NOT catch synchronous throws (which occur before the Promise is created).

**Solution**: `CompletionService` wraps the alert call in a try-catch block AND discards
rejected promises via `.catch(() => {})`. This handles both sync throws and async rejections.

#### 3. Timestamp-Based Ticker
The `Ticker` class computes `remaining = Math.ceil((targetEndMs - Date.now()) / 1000)` on
every interval. Using `Math.ceil` (not `Math.round` or `Math.floor`) ensures the display
shows the correct "time left" rather than prematurely hitting 0.

#### 4. Fake Timers in Ticker Tests
Vitest's `vi.useFakeTimers()` fakes both `setInterval`/`clearInterval` AND `Date.now()`.
This means `vi.advanceTimersByTime(1000)` advances both the interval callbacks AND the
system clock, making timestamp-based tick math testable without real waits.

#### 5. CompletionService Pipeline Ordering
Focus completion pipeline order:
1. Alert fire (best-effort, void — async)
2. Daily counter increment (synchronous, before returning)
3. Cycle transition to next session
This ordering ensures the counter is updated and returned synchronously in the result,
while alerts run in the background without blocking transitions.

### Test Coverage Summary
- **Unit tests (5 files, 54 tests)**: Pure model logic, ticker, controls, daily summary, edge cases
- **Contract tests (3 files, 53 tests)**: UI behavior contracts, state invariants, command effects
- **Integration tests (4 files)**: Playwright e2e tests for full browser behavior
- **Total unit+contract**: 107 tests, all passing
