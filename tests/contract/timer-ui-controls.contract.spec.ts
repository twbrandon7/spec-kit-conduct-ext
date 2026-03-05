/**
 * Contract tests for Start/Pause/Reset UI command effects (T026, US2).
 * Verifies commands conform to the timer-ui-contract.md specification.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTimerSession,
  startSession,
  pauseSession,
  resetSession,
} from '../toy-app/src/timer-model.ts';
import { ControlService } from '../toy-app/src/services/control-service.ts';
import { TimerService } from '../toy-app/src/services/timer-service.ts';
import { Ticker } from '../toy-app/src/ticker.ts';

describe('Timer UI controls contract', () => {
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

  describe('Start command contract', () => {
    it('precondition: timer must not be running', () => {
      const session = createTimerSession('focus');
      expect(session.isRunning).toBe(false);
    });

    it('effect: isRunning becomes true after Start', () => {
      const session = createTimerSession('focus');
      const started = controlService.start(session);
      expect(started.isRunning).toBe(true);
    });

    it('effect: countdown progression begins (tick fires)', () => {
      const session = createTimerSession('focus');
      let tickFired = false;
      timerService.onTick = () => { tickFired = true; };

      controlService.start(session);
      vi.advanceTimersByTime(1000);

      expect(tickFired).toBe(true);
    });

    it('idempotency: if already running, Start has no duplicate effect', () => {
      const session = createTimerSession('focus');
      const started = controlService.start(session);

      let tickCount = 0;
      timerService.onTick = () => tickCount++;

      // Second start should be no-op
      const startedAgain = controlService.start(started);
      expect(startedAgain.isRunning).toBe(true);
      expect(startedAgain.targetEndMs).toBe(started.targetEndMs);
    });
  });

  describe('Pause command contract', () => {
    it('precondition: timer must be running', () => {
      const session = createTimerSession('focus');
      // Pause on non-running session returns session unchanged
      const result = controlService.pause(session);
      expect(result).toBe(session);
    });

    it('effect: isRunning becomes false after Pause', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      vi.advanceTimersByTime(2000);

      session = controlService.pause(session);
      expect(session.isRunning).toBe(false);
    });

    it('effect: remainingSeconds is preserved on Pause', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      vi.advanceTimersByTime(5000);

      const remaining = timerService.lastRemaining;
      session = controlService.pause(session);

      expect(session.remainingSeconds).toBe(remaining);
      expect(session.remainingSeconds).toBeGreaterThan(0);
    });

    it('effect: no further ticks after Pause', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);

      let tickCount = 0;
      timerService.onTick = () => tickCount++;
      vi.advanceTimersByTime(1000);
      const countBeforePause = tickCount;

      controlService.pause(session);
      vi.advanceTimersByTime(5000);

      expect(tickCount).toBe(countBeforePause);
    });
  });

  describe('Reset command contract', () => {
    it('precondition: none — safe from any state', () => {
      // Reset should work from idle, running, and paused states
      const idleSession = createTimerSession('focus');
      expect(() => controlService.reset(idleSession)).not.toThrow();
    });

    it('effect: isRunning is false after Reset', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      session = controlService.reset(session);
      expect(session.isRunning).toBe(false);
    });

    it('effect: remainingSeconds equals durationSeconds after Reset', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      vi.advanceTimersByTime(10000);
      session = controlService.reset(session);
      expect(session.remainingSeconds).toBe(session.durationSeconds);
    });

    it('effect: Reset works correctly in shortBreak mode', () => {
      let session = createTimerSession('shortBreak');
      session = controlService.start(session);
      vi.advanceTimersByTime(60000);
      session = controlService.reset(session);
      expect(session.remainingSeconds).toBe(300);
      expect(session.isRunning).toBe(false);
    });

    it('effect: targetEndMs is cleared after Reset', () => {
      let session = createTimerSession('focus');
      session = controlService.start(session);
      session = controlService.reset(session);
      expect(session.targetEndMs).toBeUndefined();
    });
  });

  describe('Pure model contract', () => {
    it('startSession pure function does not affect non-running session', () => {
      const session = createTimerSession('focus');
      const now = Date.now();
      const started = startSession(session, now);
      expect(started).not.toBe(session); // new object
      expect(started.isRunning).toBe(true);
    });

    it('pauseSession pure function preserves remaining', () => {
      const session = createTimerSession('focus');
      const paused = pauseSession(session, 1200);
      expect(paused.remainingSeconds).toBe(1200);
      expect(paused.isRunning).toBe(false);
    });

    it('resetSession pure function restores full duration', () => {
      const session = { ...createTimerSession('focus'), remainingSeconds: 42, isRunning: true };
      const reset = resetSession(session);
      expect(reset.remainingSeconds).toBe(1500);
      expect(reset.isRunning).toBe(false);
    });
  });
});
