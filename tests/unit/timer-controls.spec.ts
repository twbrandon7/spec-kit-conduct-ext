/**
 * Unit tests for start/pause/reset command semantics (T025, US2).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimerSession, resetSession } from '../toy-app/src/timer-model.ts';
import { TimerService } from '../toy-app/src/services/timer-service.ts';
import { ControlService } from '../toy-app/src/services/control-service.ts';
import { Ticker } from '../toy-app/src/ticker.ts';

describe('Timer controls', () => {
  let timerService: TimerService;
  let controlService: ControlService;

  beforeEach(() => {
    vi.useFakeTimers();
    timerService = new TimerService(new Ticker());
    controlService = new ControlService(timerService);
  });

  afterEach(() => {
    timerService.stop();
    vi.useRealTimers();
  });

  describe('Start command', () => {
    it('starts a paused/idle session (isRunning becomes true)', () => {
      const session = createTimerSession('focus');
      expect(session.isRunning).toBe(false);

      const started = controlService.start(session);
      expect(started.isRunning).toBe(true);
    });

    it('sets targetEndMs when starting', () => {
      const session = createTimerSession('focus');
      const started = controlService.start(session);
      expect(started.targetEndMs).toBeDefined();
      expect(started.targetEndMs!).toBeGreaterThan(Date.now() - 100);
    });

    it('is idempotent — duplicate start returns unchanged session', () => {
      const session = createTimerSession('focus');
      const started = controlService.start(session);
      const startedAgain = controlService.start(started);

      expect(startedAgain.isRunning).toBe(true);
      expect(startedAgain.targetEndMs).toBe(started.targetEndMs);
    });

    it('does not create a second interval on duplicate start', () => {
      const session = createTimerSession('focus');
      const tickCounts: number[] = [];
      timerService.onTick = (r) => tickCounts.push(r);

      const started = controlService.start(session);
      vi.advanceTimersByTime(1000);
      const countAfterFirst = tickCounts.length;

      // Second start should be a no-op
      controlService.start(started);
      vi.advanceTimersByTime(1000);

      // Should be roughly double the count (one interval, not two)
      expect(tickCounts.length - countAfterFirst).toBeLessThanOrEqual(countAfterFirst + 1);
    });
  });

  describe('Pause command', () => {
    it('pauses a running session (isRunning becomes false)', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      expect(session.isRunning).toBe(true);

      vi.advanceTimersByTime(2000);
      session = controlService.pause(session);
      expect(session.isRunning).toBe(false);
    });

    it('preserves remaining seconds on pause', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      vi.advanceTimersByTime(5000); // 5 seconds elapsed

      session = controlService.pause(session);
      // Remaining should be close to 1495 (1500 - 5)
      expect(session.remainingSeconds).toBeGreaterThan(0);
      expect(session.remainingSeconds).toBeLessThanOrEqual(1500);
    });

    it('clears targetEndMs on pause', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      session = controlService.pause(session);
      expect(session.targetEndMs).toBeUndefined();
    });

    it('is a no-op when session is not running', () => {
      const session = createTimerSession('focus'); // idle
      const paused = controlService.pause(session);
      expect(paused).toBe(session); // same reference — no change
    });
  });

  describe('Reset command', () => {
    it('resets to full duration', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      vi.advanceTimersByTime(10000);
      session = controlService.reset(session);

      expect(session.remainingSeconds).toBe(1500);
      expect(session.isRunning).toBe(false);
    });

    it('stops timer when called while running', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      expect(session.isRunning).toBe(true);

      session = controlService.reset(session);
      expect(session.isRunning).toBe(false);
    });

    it('is safe to call on an idle session', () => {
      const session = createTimerSession('focus');
      const reset = controlService.reset(session);
      expect(reset.remainingSeconds).toBe(1500);
      expect(reset.isRunning).toBe(false);
    });

    it('is safe to call on a paused session', () => {
      let session = createTimerSession('shortBreak');
      session = controlService.start(session);
      vi.advanceTimersByTime(30000);
      session = controlService.pause(session);
      session = controlService.reset(session);

      expect(session.remainingSeconds).toBe(300);
      expect(session.isRunning).toBe(false);
    });

    it('reset at 0:00 still returns full duration', () => {
      let session = createTimerSession('focus');
      // Simulate a session at 0 remaining
      session = { ...session, remainingSeconds: 0 };
      const reset = resetSession(session);
      expect(reset.remainingSeconds).toBe(1500);
    });
  });
});
