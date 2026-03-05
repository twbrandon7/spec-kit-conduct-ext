/**
 * app.ts — Main bootstrap and wiring for the Pomodoro toy app.
 * Initializes all services, UI views, and event handlers.
 */

import { createTimerSession } from './timer-model.ts';
import { createCycleProgress } from './cycle-model.ts';
import { TimerService } from './services/timer-service.ts';
import { ControlService } from './services/control-service.ts';
import { AlertService } from './services/alert-service.ts';
import { DailyCounterService } from './services/daily-counter-service.ts';
import { CompletionService } from './services/completion-service.ts';
import { TimerView, createTimerView } from './ui/timer-view.ts';
import { ControlsView, createControlsView } from './ui/controls-view.ts';
import { DailyCounterView, createDailyCounterView } from './ui/daily-counter-view.ts';
import type { CycleProgress, TimerSession } from './types.ts';

// ---------------------------------------------------------------------------
// App state (mutable)
// ---------------------------------------------------------------------------
let session: TimerSession = createTimerSession('focus');
let cycle: CycleProgress = createCycleProgress();

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
const timerService = new TimerService();
const controlService = new ControlService(timerService);
const alertService = new AlertService();
const dailyCounterService = new DailyCounterService();
const completionService = new CompletionService(alertService, dailyCounterService);

// ---------------------------------------------------------------------------
// Bootstrap DOM views
// ---------------------------------------------------------------------------
let timerView: TimerView;
let controlsView: ControlsView;
let dailyCounterView: DailyCounterView;

function initViews(): void {
  timerView = createTimerView();
  controlsView = createControlsView();
  dailyCounterView = createDailyCounterView();

  // Initial render
  timerView.update(session);
  controlsView.updateState(session);
  dailyCounterView.update(dailyCounterService.getCount());
}

// ---------------------------------------------------------------------------
// Timer event wiring
// ---------------------------------------------------------------------------
timerService.onTick = (remaining: number) => {
  session = { ...session, remainingSeconds: remaining };
  timerView?.updateTime(remaining);
};

timerService.onComplete = () => {
  const completedSession = session;
  completionService.handleCompletion(completedSession, cycle).then((result) => {
    session = result.nextSession;
    cycle = result.nextCycle;
    timerService.setSession(session);

    timerView?.update(session);
    controlsView?.updateState(session);
    dailyCounterView?.update(result.newDailyCount);
  });
};

// ---------------------------------------------------------------------------
// Control event wiring
// ---------------------------------------------------------------------------
function wireControls(cv: ControlsView): void {
  cv.onStart = () => {
    session = controlService.start(session);
    timerView?.update(session);
    controlsView?.updateState(session);
  };

  cv.onPause = () => {
    session = controlService.pause(session);
    timerView?.update(session);
    controlsView?.updateState(session);
  };

  cv.onReset = () => {
    session = controlService.reset(session);
    timerView?.update(session);
    controlsView?.updateState(session);
  };
}

// ---------------------------------------------------------------------------
// Midnight rollover check — run on init and attach a periodic check
// ---------------------------------------------------------------------------
function checkMidnightRollover(): void {
  dailyCounterService.checkDateRollover();
  dailyCounterView?.update(dailyCounterService.getCount());
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
function init(): void {
  initViews();
  wireControls(controlsView);
  checkMidnightRollover();

  // Check for date rollover every minute
  setInterval(checkMidnightRollover, 60_000);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export state accessors for integration testing
export { session, cycle, timerService, controlService, dailyCounterService };
