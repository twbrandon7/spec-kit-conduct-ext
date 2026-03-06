import { MODE_DURATIONS_SECONDS } from './constants';
import { AudioAlertService } from './alerts';
import { NotificationService } from './notifications';
import { AlertService } from './services/alert-service';
import { CycleService } from './services/cycle-service';
import { CompletionService } from './services/completion-service';
import { ControlService } from './services/control-service';
import { DailyCounterService } from './services/daily-counter-service';
import { TimerService } from './services/timer-service';
import { TimestampTicker } from './ticker';
import type { Clock } from './types';
import { ControlsView } from './ui/controls-view';
import { DailyCounterView } from './ui/daily-counter-view';
import { TimerView } from './ui/timer-view';

declare global {
  interface Window {
    __POMODORO_TEST_DURATIONS__?: Partial<typeof MODE_DURATIONS_SECONDS>;
  }
}

interface AppOptions {
  durations?: Partial<typeof MODE_DURATIONS_SECONDS>;
  autoStartNext?: boolean;
  clock?: Clock;
  audioAlertOverride?: Pick<AudioAlertService, 'playCompletionChime'>;
  notificationOverride?: Pick<NotificationService, 'notifyCompletion'>;
}

const resolveDurations = (
  options?: Partial<typeof MODE_DURATIONS_SECONDS>,
): typeof MODE_DURATIONS_SECONDS => ({
  ...MODE_DURATIONS_SECONDS,
  ...(window.__POMODORO_TEST_DURATIONS__ ?? {}),
  ...(options ?? {}),
});

export const createApp = (host: HTMLElement, options: AppOptions = {}) => {
  const durations = resolveDurations(options.durations);
  const clock = options.clock ?? { nowMs: () => Date.now() };
  const timerService = new TimerService(clock);
  const controlService = new ControlService(timerService);
  const cycleService = new CycleService();
  const alertService = new AlertService(
    options.audioAlertOverride ?? new AudioAlertService(),
    options.notificationOverride ?? new NotificationService(),
  );
  const dailyCounterService = new DailyCounterService();
  const completionService = new CompletionService(
    alertService,
    dailyCounterService,
  );
  const ticker = new TimestampTicker(clock);
  const timerView = new TimerView(host);
  const dailyCounterView = new DailyCounterView(host);

  const applyCurrentDuration = () => {
    const state = timerService.getState();
    timerService.setRemainingSeconds(durations[state.mode]);
  };

  const controlsSlot = host.querySelector<HTMLElement>('[data-testid="controls-slot"]');
  if (!controlsSlot) {
    throw new Error('Missing controls slot');
  }

  new ControlsView(controlsSlot, {
    onStart: () => {
      controlService.start();
      ticker.start((nowMs) => timerService.handleTick(nowMs));
    },
    onPause: () => {
      controlService.pause();
      ticker.stop();
    },
    onReset: () => {
      ticker.stop();
      controlService.reset();
      applyCurrentDuration();
    },
  });

  timerService.onTick((state) => {
    timerView.render(state.mode, state.remainingSeconds);
  });

  timerService.onCompleted((mode) => {
    ticker.stop();
    dailyCounterView.render(completionService.handleModeCompletion(mode));

    const nextMode = cycleService.onModeCompleted(mode);
    timerService.switchMode(nextMode);
    applyCurrentDuration();

    if (options.autoStartNext) {
      timerService.start();
      ticker.start((nowMs) => timerService.handleTick(nowMs));
    }
  });

  timerService.switchMode('focus');
  applyCurrentDuration();
  dailyCounterView.render(completionService.getCurrentDailyCount());

  return {
    start() {
      controlService.start();
    },
    pause() {
      controlService.pause();
    },
    reset() {
      controlService.reset();
      applyCurrentDuration();
    },
    tickAt(nowMs: number) {
      timerService.handleTick(nowMs);
    },
    getState() {
      return timerService.getState();
    },
    destroy() {
      ticker.stop();
      host.innerHTML = '';
    },
  };
};

const root = document.getElementById('app');
if (root) {
  createApp(root);
}
