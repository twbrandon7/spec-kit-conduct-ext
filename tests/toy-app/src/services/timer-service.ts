/**
 * TimerService — tick orchestration and completion dispatch.
 * Owns the Ticker instance and manages the running timer session state.
 */

import { Ticker } from '../ticker.ts';
import { startSession, pauseSession, resetSession } from '../timer-model.ts';
import type { TimerSession } from '../types.ts';

export class TimerService {
  private ticker: Ticker;
  private _lastRemaining = 0;

  /** Called every tick with the current remaining seconds. */
  onTick: ((remaining: number) => void) | null = null;

  /** Called when the countdown reaches zero. */
  onComplete: (() => void) | null = null;

  constructor(ticker?: Ticker) {
    this.ticker = ticker ?? new Ticker();
  }

  /** Most recently observed remaining seconds (useful for pause). */
  get lastRemaining(): number {
    return this._lastRemaining;
  }

  /**
   * Start the countdown for the given session.
   * If already running, returns the session unchanged (idempotent).
   */
  start(session: TimerSession): TimerSession {
    if (session.isRunning) return session;

    const now = Date.now();
    const updated = startSession(session, now);
    this._lastRemaining = session.remainingSeconds;

    this.ticker.start(updated.targetEndMs!, (remaining) => {
      this._lastRemaining = remaining;
      this.onTick?.(remaining);
      if (remaining === 0) {
        this.ticker.stop();
        this.onComplete?.();
      }
    });

    return updated;
  }

  /**
   * Pause the countdown, preserving current remaining time.
   */
  pause(session: TimerSession): TimerSession {
    this.ticker.stop();
    const remaining = this._lastRemaining > 0 ? this._lastRemaining : session.remainingSeconds;
    return pauseSession(session, remaining);
  }

  /**
   * Reset the session to its full duration and stop the ticker.
   */
  reset(session: TimerSession): TimerSession {
    this.ticker.stop();
    this._lastRemaining = 0;
    return resetSession(session);
  }

  /**
   * Stop the ticker without changing session state.
   */
  stop(): void {
    this.ticker.stop();
  }

  /**
   * Replace the active session after a mode transition (e.g. completion).
   * Resets internal tracking state.
   */
  setSession(session: TimerSession): void {
    this._lastRemaining = session.remainingSeconds;
  }
}
