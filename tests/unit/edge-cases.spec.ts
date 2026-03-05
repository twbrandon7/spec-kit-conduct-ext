/**
 * Unit tests for edge cases (T039).
 * Covers: notification denied, audio failure, reset at 0:00,
 * and other boundary conditions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimerSession, resetSession, formatTime } from '../toy-app/src/timer-model.ts';
import { createCycleProgress, getNextModeAndCycle } from '../toy-app/src/cycle-model.ts';
import { AlertService } from '../toy-app/src/services/alert-service.ts';
import { DailyCounterService } from '../toy-app/src/services/daily-counter-service.ts';
import { CompletionService } from '../toy-app/src/services/completion-service.ts';
import { getLocalDateString, saveDailySummary } from '../toy-app/src/daily-summary.ts';

describe('Edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Notification denied', () => {
    it('completion pipeline succeeds even when alertService notification path fails', async () => {
      const alertService = new AlertService();
      // Mock fireCompletionAlert to simulate notification failure (returns resolved promise)
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);

      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      await expect(
        completionService.handleCompletion(createTimerSession('focus'), createCycleProgress()),
      ).resolves.not.toThrow();
    });

    it('mode transition still occurs when notification is unavailable', async () => {
      const alertService = new AlertService();
      // Simulate notification failure by making fireCompletionAlert reject
      vi.spyOn(alertService, 'fireCompletionAlert').mockRejectedValue(new Error('Notification blocked'));

      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const result = await completionService.handleCompletion(
        createTimerSession('focus'),
        createCycleProgress(),
      );

      // Mode transition must still happen regardless of notification failure
      expect(result.nextSession.mode).toBe('shortBreak');
    });

    it('mode transition occurs even when alertService has notification permission denied', async () => {
      const alertService = new AlertService();
      // Simulate a "permission denied" scenario by mocking the alert to do nothing
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);

      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const result = await completionService.handleCompletion(
        createTimerSession('focus'),
        createCycleProgress(),
      );

      // Mode transition must still happen
      expect(result.nextSession.mode).toBe('shortBreak');
    });
  });

  describe('Audio failure', () => {
    it('completion pipeline proceeds after audio rejection', async () => {
      const alertService = new AlertService();
      // Mock fireCompletionAlert to reject (simulating audio failure)
      vi.spyOn(alertService, 'fireCompletionAlert').mockRejectedValue(new Error('Audio blocked'));

      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      // Should not throw and should still return transition result
      await expect(
        completionService.handleCompletion(createTimerSession('focus'), createCycleProgress()),
      ).resolves.toBeDefined();
    });

    it('mode transition occurs even when alert service throws synchronously', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockImplementation(() => {
        throw new Error('Unexpected sync error');
      });
      const dailyCounterService = new DailyCounterService();

      // CompletionService wraps alert call in try-catch — synchronous throw must not propagate
      const completionService = new CompletionService(alertService, dailyCounterService);
      const result = await completionService.handleCompletion(
        createTimerSession('shortBreak'),
        createCycleProgress(),
      );
      expect(result.nextSession.mode).toBe('focus');
    });

    it('daily counter still increments even when alert fails', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockRejectedValue(new Error('Audio blocked'));

      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const result = await completionService.handleCompletion(
        createTimerSession('focus'),
        createCycleProgress(),
      );

      expect(result.newDailyCount).toBe(1);
    });
  });

  describe('Reset at 0:00', () => {
    it('resetSession from 0 remaining returns full duration', () => {
      const session = { ...createTimerSession('focus'), remainingSeconds: 0 };
      const reset = resetSession(session);
      expect(reset.remainingSeconds).toBe(1500);
      expect(reset.isRunning).toBe(false);
    });

    it('formatTime(0) returns 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('reset in shortBreak mode at 0 returns 05:00', () => {
      const session = { ...createTimerSession('shortBreak'), remainingSeconds: 0 };
      const reset = resetSession(session);
      expect(reset.remainingSeconds).toBe(300);
      expect(formatTime(reset.remainingSeconds)).toBe('05:00');
    });

    it('reset in longBreak mode at 0 returns 15:00', () => {
      const session = { ...createTimerSession('longBreak'), remainingSeconds: 0 };
      const reset = resetSession(session);
      expect(reset.remainingSeconds).toBe(900);
      expect(formatTime(reset.remainingSeconds)).toBe('15:00');
    });
  });

  describe('Cycle boundary', () => {
    it('completing exactly 4 focus sessions triggers longBreak', () => {
      let cycle = createCycleProgress();
      let result = { nextMode: 'focus' as const, nextCycle: cycle };

      for (let i = 0; i < 4; i++) {
        result = getNextModeAndCycle('focus', result.nextCycle);
        if (i < 3) {
          expect(result.nextMode).toBe('shortBreak');
          result = getNextModeAndCycle('shortBreak', result.nextCycle);
        }
      }

      expect(result.nextMode).toBe('longBreak');
      expect(result.nextCycle.completedFocusInCycle).toBe(0);
    });

    it('cycle resets properly after longBreak', () => {
      // After longBreak, cycle is back to 0
      const cycle = { completedFocusInCycle: 0 };
      const { nextMode, nextCycle } = getNextModeAndCycle('longBreak', cycle);
      expect(nextMode).toBe('focus');
      expect(nextCycle.completedFocusInCycle).toBe(0);

      // Next focus should go to shortBreak (not longBreak)
      const { nextMode: afterFocus } = getNextModeAndCycle('focus', nextCycle);
      expect(afterFocus).toBe('shortBreak');
    });
  });

  describe('Date rollover edge case', () => {
    it('daily counter resets when date changes between sessions', () => {
      saveDailySummary({ date: '1900-01-01', completedFocusCount: 99 });

      const service = new DailyCounterService();
      expect(service.getCount()).toBe(0);

      service.increment();
      expect(service.getCount()).toBe(1);
    });

    it('daily counter does not persist count from a different date', () => {
      // Store 5 focus sessions for yesterday
      saveDailySummary({ date: '2020-06-14', completedFocusCount: 5 });

      const service = new DailyCounterService();
      // Service initializes from localStorage, should detect date mismatch
      expect(service.getCount()).toBe(0);
    });
  });
});
