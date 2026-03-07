import type { Clock } from './types';

export type TickListener = (nowMs: number) => void;

export class TimestampTicker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly clock: Clock;

  constructor(clock: Clock = { nowMs: () => Date.now() }) {
    this.clock = clock;
  }

  start(listener: TickListener): void {
    if (this.intervalId) {
      return;
    }

    listener(this.clock.nowMs());
    this.intervalId = setInterval(() => {
      listener(this.clock.nowMs());
    }, 1000);
  }

  stop(): void {
    if (!this.intervalId) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
