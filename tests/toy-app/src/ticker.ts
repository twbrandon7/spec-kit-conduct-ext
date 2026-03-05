/**
 * Timestamp-based ticker utility.
 * Uses targetEndMs - Date.now() math to avoid drift from event-loop delays or tab throttling.
 */

import { TICK_INTERVAL_MS } from './constants.ts';

type TickCallback = (remainingSeconds: number) => void;

export class Ticker {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Start ticking toward targetEndMs.
   * Fires an immediate tick, then every TICK_INTERVAL_MS.
   * Calls onTick with the remaining seconds (clamped to >= 0).
   * Does NOT auto-stop at 0 — caller is responsible for stopping when done.
   */
  start(targetEndMs: number, onTick: TickCallback): void {
    this.stop();

    const tick = (): void => {
      const remaining = Math.max(0, Math.ceil((targetEndMs - Date.now()) / 1000));
      onTick(remaining);
    };

    // Immediate update so UI doesn't lag by one interval
    tick();
    this.intervalId = setInterval(tick, TICK_INTERVAL_MS);
  }

  /**
   * Stop ticking. Safe to call when not running.
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Returns true if a countdown is currently active.
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
