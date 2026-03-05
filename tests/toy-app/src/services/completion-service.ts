/**
 * CompletionService — timer completion pipeline.
 * On focus completion: fires alerts and increments the daily counter.
 * On any completion: triggers mode transition via cycle service.
 */

import { handleModeCompletion } from './cycle-service.ts';
import type { AlertService } from './alert-service.ts';
import type { DailyCounterService } from './daily-counter-service.ts';
import type { CycleProgress, TimerSession } from '../types.ts';

export interface CompletionResult {
  nextSession: TimerSession;
  nextCycle: CycleProgress;
  newDailyCount: number;
}

export class CompletionService {
  constructor(
    private alertService: AlertService,
    private dailyCounterService: DailyCounterService,
  ) {}

  /**
   * Handle a timer completion event.
   * 1. Fire alert best-effort (audio + notification).
   * 2. Increment daily counter if the completed mode was focus.
   * 3. Compute next session and cycle.
   * Returns the new session, cycle, and updated daily count.
   */
  async handleCompletion(
    completedSession: TimerSession,
    cycle: CycleProgress,
  ): Promise<CompletionResult> {
    // Fire alerts — best-effort, never throws (handles both sync throws and rejected promises)
    try {
      const alertResult = this.alertService.fireCompletionAlert(completedSession.mode);
      if (alertResult instanceof Promise) {
        void alertResult.catch(() => {});
      }
    } catch {
      // Synchronous error from alertService is swallowed
    }

    // Increment daily counter for focus completions only
    if (completedSession.mode === 'focus') {
      this.dailyCounterService.increment();
    }

    // Compute next mode transition
    const { nextSession, nextCycle } = handleModeCompletion(completedSession.mode, cycle);
    const newDailyCount = this.dailyCounterService.getCount();

    return { nextSession, nextCycle, newDailyCount };
  }
}
