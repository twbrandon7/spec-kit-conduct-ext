/**
 * ControlService — control command handlers with duplicate-start guard.
 * Validates preconditions before delegating to TimerService.
 */

import type { TimerService } from './timer-service.ts';
import type { TimerSession } from '../types.ts';

export class ControlService {
  constructor(private timerService: TimerService) {}

  /**
   * Start the timer.
   * Idempotent: if the session is already running, returns it unchanged.
   */
  start(session: TimerSession): TimerSession {
    if (session.isRunning) return session;
    return this.timerService.start(session);
  }

  /**
   * Pause the timer.
   * No-op if the session is not running.
   */
  pause(session: TimerSession): TimerSession {
    if (!session.isRunning) return session;
    return this.timerService.pause(session);
  }

  /**
   * Reset the timer to its full duration and stop counting.
   * Safe to call from any state.
   */
  reset(session: TimerSession): TimerSession {
    return this.timerService.reset(session);
  }
}
