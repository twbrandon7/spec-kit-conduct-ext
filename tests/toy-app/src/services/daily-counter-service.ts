/**
 * DailyCounterService — daily focus counter backed by localStorage date-keyed record.
 * Handles automatic date rollover on local date change.
 */

import {
  loadDailySummary,
  saveDailySummary,
  incrementFocusCount,
  ensureCurrentDate,
} from '../daily-summary.ts';
import type { DailyFocusSummary } from '../types.ts';

export class DailyCounterService {
  private summary: DailyFocusSummary;

  constructor() {
    this.summary = loadDailySummary();
  }

  /**
   * Get the current focus count for today.
   * Checks for date rollover before returning.
   */
  getCount(): number {
    this.checkDateRollover();
    return this.summary.completedFocusCount;
  }

  /**
   * Increment the daily focus count by 1 and persist.
   */
  increment(): void {
    this.checkDateRollover();
    this.summary = incrementFocusCount(this.summary);
    saveDailySummary(this.summary);
  }

  /**
   * Check for midnight rollover; reset count if the date has changed.
   */
  checkDateRollover(): void {
    const updated = ensureCurrentDate(this.summary);
    if (updated.completedFocusCount !== this.summary.completedFocusCount || updated.date !== this.summary.date) {
      this.summary = updated;
      saveDailySummary(this.summary);
    }
  }

  /**
   * Reload the summary from localStorage (useful after external mutations in tests).
   */
  reload(): void {
    this.summary = loadDailySummary();
  }
}
