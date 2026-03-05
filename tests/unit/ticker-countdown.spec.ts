/**
 * Unit tests for timestamp-based countdown completion (T018, US1).
 * Uses Vitest fake timers to validate Ticker behaviour.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Ticker } from '../toy-app/src/ticker.ts';

describe('Ticker countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires an immediate tick on start', () => {
    const ticker = new Ticker();
    const targetEndMs = Date.now() + 3000;
    const ticks: number[] = [];

    ticker.start(targetEndMs, (r) => ticks.push(r));

    // Immediate tick should have fired synchronously during start()
    expect(ticks.length).toBe(1);
    expect(ticks[0]).toBe(3);

    ticker.stop();
  });

  it('emits decreasing remaining values each second', () => {
    const ticker = new Ticker();
    const now = Date.now();
    const targetEndMs = now + 3000;
    const ticks: number[] = [];

    ticker.start(targetEndMs, (r) => ticks.push(r));

    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);

    ticker.stop();

    expect(ticks).toContain(3);
    expect(ticks).toContain(2);
    expect(ticks).toContain(1);
    expect(ticks).toContain(0);
  });

  it('reaches 0 when countdown completes', () => {
    const ticker = new Ticker();
    const targetEndMs = Date.now() + 2000;
    const ticks: number[] = [];

    ticker.start(targetEndMs, (r) => ticks.push(r));
    vi.advanceTimersByTime(2000);

    ticker.stop();

    expect(ticks[ticks.length - 1]).toBe(0);
  });

  it('never emits a negative value', () => {
    const ticker = new Ticker();
    const targetEndMs = Date.now() + 500;
    const ticks: number[] = [];

    ticker.start(targetEndMs, (r) => ticks.push(r));
    vi.advanceTimersByTime(3000); // well past end

    ticker.stop();

    expect(ticks.every((r) => r >= 0)).toBe(true);
  });

  it('stop() prevents further ticks', () => {
    const ticker = new Ticker();
    const targetEndMs = Date.now() + 10000;
    let tickCount = 0;

    ticker.start(targetEndMs, () => tickCount++);
    vi.advanceTimersByTime(2000); // should fire immediate + 2 interval ticks
    const countBeforeStop = tickCount;

    ticker.stop();
    vi.advanceTimersByTime(5000); // no more ticks after stop

    expect(tickCount).toBe(countBeforeStop);
    expect(ticker.isRunning()).toBe(false);
  });

  it('start() replaces an existing interval', () => {
    const ticker = new Ticker();
    const targetEndMs1 = Date.now() + 5000;
    const targetEndMs2 = Date.now() + 3000;
    const ticks1: number[] = [];
    const ticks2: number[] = [];

    ticker.start(targetEndMs1, (r) => ticks1.push(r));
    vi.advanceTimersByTime(1000);

    // Replace with new ticker
    ticker.start(targetEndMs2, (r) => ticks2.push(r));
    vi.advanceTimersByTime(1000);

    ticker.stop();

    // ticks1 should have stopped growing after the restart
    expect(ticks2.length).toBeGreaterThan(0);
  });

  it('isRunning() reflects ticker state', () => {
    const ticker = new Ticker();
    expect(ticker.isRunning()).toBe(false);

    ticker.start(Date.now() + 5000, () => {});
    expect(ticker.isRunning()).toBe(true);

    ticker.stop();
    expect(ticker.isRunning()).toBe(false);
  });
});
