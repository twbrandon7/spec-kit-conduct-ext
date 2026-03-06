import { AlertService } from './alert-service';
import { DailyCounterService } from './daily-counter-service';
import type { TimerMode } from '../types';

export class CompletionService {
  constructor(
    private readonly alerts = new AlertService(),
    private readonly dailyCounter = new DailyCounterService(),
  ) {}

  getCurrentDailyCount(): number {
    return this.dailyCounter.refreshForToday();
  }

  handleModeCompletion(mode: TimerMode): number {
    if (mode === 'focus') {
      this.dailyCounter.incrementOnFocusCompletion();
    }

    void this.alerts.notifyModeCompletion(mode);
    return this.dailyCounter.getCount();
  }
}
