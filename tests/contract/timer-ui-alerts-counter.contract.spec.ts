/**
 * Contract tests for completion alert and daily counter UI contract (T032, US3).
 * Verifies alert behavior and daily counter state conform to timer-ui-contract.md.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DailyCounterService } from '../toy-app/src/services/daily-counter-service.ts';
import { AlertService } from '../toy-app/src/services/alert-service.ts';
import { CompletionService } from '../toy-app/src/services/completion-service.ts';
import { createTimerSession } from '../toy-app/src/timer-model.ts';
import { createCycleProgress } from '../toy-app/src/cycle-model.ts';
import { DURATIONS } from '../toy-app/src/constants.ts';
import { getLocalDateString, saveDailySummary } from '../toy-app/src/daily-summary.ts';

describe('Alerts and daily counter contract', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Daily counter contract', () => {
    it('starts at 0 when no previous data', () => {
      const service = new DailyCounterService();
      expect(service.getCount()).toBe(0);
    });

    it('increments counter on increment() call', () => {
      const service = new DailyCounterService();
      service.increment();
      expect(service.getCount()).toBe(1);
    });

    it('accumulates multiple increments', () => {
      const service = new DailyCounterService();
      service.increment();
      service.increment();
      service.increment();
      expect(service.getCount()).toBe(3);
    });

    it('persists count across service instances', () => {
      const service1 = new DailyCounterService();
      service1.increment();
      service1.increment();

      const service2 = new DailyCounterService();
      expect(service2.getCount()).toBe(2);
    });

    it('resets to 0 on date rollover', () => {
      // Pre-seed with yesterday's data
      saveDailySummary({ date: '2000-01-01', completedFocusCount: 7 });

      const service = new DailyCounterService();
      expect(service.getCount()).toBe(0);
    });
  });

  describe('Alert service contract', () => {
    it('fires alert for focus completion without throwing', async () => {
      const service = new AlertService();
      // Should not throw even if audio/notification are unavailable
      await expect(service.fireCompletionAlert('focus')).resolves.not.toThrow();
    });

    it('fires alert for shortBreak completion without throwing', async () => {
      const service = new AlertService();
      await expect(service.fireCompletionAlert('shortBreak')).resolves.not.toThrow();
    });

    it('fires alert for longBreak completion without throwing', async () => {
      const service = new AlertService();
      await expect(service.fireCompletionAlert('longBreak')).resolves.not.toThrow();
    });
  });

  describe('Completion pipeline contract', () => {
    it('increments daily counter when focus session completes', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const focusSession = createTimerSession('focus');
      const cycle = createCycleProgress();

      await completionService.handleCompletion(focusSession, cycle);

      expect(dailyCounterService.getCount()).toBe(1);
    });

    it('does NOT increment daily counter when break session completes', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const breakSession = createTimerSession('shortBreak');
      const cycle = { completedFocusInCycle: 1 };

      await completionService.handleCompletion(breakSession, cycle);

      expect(dailyCounterService.getCount()).toBe(0);
    });

    it('returns next session at full duration after focus completion', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const focusSession = createTimerSession('focus');
      const cycle = createCycleProgress();

      const result = await completionService.handleCompletion(focusSession, cycle);

      expect(result.nextSession.mode).toBe('shortBreak');
      expect(result.nextSession.remainingSeconds).toBe(DURATIONS.shortBreak);
      expect(result.nextSession.isRunning).toBe(false);
    });

    it('returns next cycle progress after focus completion', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const focusSession = createTimerSession('focus');
      const cycle = createCycleProgress(); // 0

      const result = await completionService.handleCompletion(focusSession, cycle);

      expect(result.nextCycle.completedFocusInCycle).toBe(1);
    });

    it('calls fireCompletionAlert for each completion', async () => {
      const alertService = new AlertService();
      const alertSpy = vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      const focusSession = createTimerSession('focus');
      await completionService.handleCompletion(focusSession, createCycleProgress());

      expect(alertSpy).toHaveBeenCalledWith('focus');
    });

    it('daily counter reflects multiple focus completions', async () => {
      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      let cycle = createCycleProgress();
      for (let i = 0; i < 3; i++) {
        const result = await completionService.handleCompletion(
          createTimerSession('focus'),
          cycle,
        );
        cycle = result.nextCycle;
      }

      expect(dailyCounterService.getCount()).toBe(3);
    });

    it('date rollover resets count in daily counter service', async () => {
      // Pre-seed yesterday's data
      saveDailySummary({ date: '1999-12-31', completedFocusCount: 10 });

      const alertService = new AlertService();
      vi.spyOn(alertService, 'fireCompletionAlert').mockResolvedValue(undefined);
      const dailyCounterService = new DailyCounterService();
      const completionService = new CompletionService(alertService, dailyCounterService);

      // Should start fresh today
      expect(dailyCounterService.getCount()).toBe(0);

      const result = await completionService.handleCompletion(
        createTimerSession('focus'),
        createCycleProgress(),
      );

      expect(result.newDailyCount).toBe(1);
    });
  });
});
