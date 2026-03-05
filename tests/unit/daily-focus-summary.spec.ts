/**
 * Unit tests for daily counter increment and date reset logic (T031, US3).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadDailySummary,
  saveDailySummary,
  incrementFocusCount,
  ensureCurrentDate,
  getLocalDateString,
} from '../toy-app/src/daily-summary.ts';
import { DAILY_SUMMARY_KEY } from '../toy-app/src/constants.ts';

describe('DailyFocusSummary', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('loadDailySummary', () => {
    it('returns a fresh summary with count=0 when nothing is stored', () => {
      const summary = loadDailySummary();
      expect(summary.completedFocusCount).toBe(0);
      expect(summary.date).toBe(getLocalDateString());
    });

    it('returns the stored summary for today', () => {
      const today = getLocalDateString();
      saveDailySummary({ date: today, completedFocusCount: 3 });

      const loaded = loadDailySummary();
      expect(loaded.completedFocusCount).toBe(3);
      expect(loaded.date).toBe(today);
    });

    it('returns fresh summary if stored date is different (date rollover)', () => {
      const yesterday = '2000-01-01';
      saveDailySummary({ date: yesterday, completedFocusCount: 5 });

      const loaded = loadDailySummary();
      expect(loaded.completedFocusCount).toBe(0);
      expect(loaded.date).toBe(getLocalDateString());
    });

    it('returns fresh summary on malformed localStorage data', () => {
      localStorage.setItem(DAILY_SUMMARY_KEY, 'not-valid-json{{{');
      const loaded = loadDailySummary();
      expect(loaded.completedFocusCount).toBe(0);
    });
  });

  describe('saveDailySummary', () => {
    it('persists summary to localStorage', () => {
      const today = getLocalDateString();
      saveDailySummary({ date: today, completedFocusCount: 7 });

      const raw = localStorage.getItem(DAILY_SUMMARY_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.completedFocusCount).toBe(7);
      expect(parsed.date).toBe(today);
    });
  });

  describe('incrementFocusCount', () => {
    it('increments count by 1 for the current date', () => {
      const today = getLocalDateString();
      const summary = { date: today, completedFocusCount: 2 };
      const result = incrementFocusCount(summary);
      expect(result.completedFocusCount).toBe(3);
      expect(result.date).toBe(today);
    });

    it('resets to 1 when date has rolled over', () => {
      const yesterday = '2000-01-01';
      const summary = { date: yesterday, completedFocusCount: 10 };
      const result = incrementFocusCount(summary);
      expect(result.completedFocusCount).toBe(1);
      expect(result.date).toBe(getLocalDateString());
    });

    it('does not mutate the original summary object', () => {
      const today = getLocalDateString();
      const original = { date: today, completedFocusCount: 5 };
      incrementFocusCount(original);
      expect(original.completedFocusCount).toBe(5);
    });
  });

  describe('ensureCurrentDate', () => {
    it('returns same summary when date matches today', () => {
      const today = getLocalDateString();
      const summary = { date: today, completedFocusCount: 4 };
      const result = ensureCurrentDate(summary);
      expect(result.completedFocusCount).toBe(4);
      expect(result.date).toBe(today);
    });

    it('resets count to 0 when date has changed', () => {
      const summary = { date: '2000-01-01', completedFocusCount: 8 };
      const result = ensureCurrentDate(summary);
      expect(result.completedFocusCount).toBe(0);
      expect(result.date).toBe(getLocalDateString());
    });
  });

  describe('multiple increments', () => {
    it('accumulates focus count correctly across multiple increments', () => {
      const today = getLocalDateString();
      let summary = { date: today, completedFocusCount: 0 };

      for (let i = 0; i < 4; i++) {
        summary = incrementFocusCount(summary);
        saveDailySummary(summary);
      }

      const loaded = loadDailySummary();
      expect(loaded.completedFocusCount).toBe(4);
    });
  });
});
