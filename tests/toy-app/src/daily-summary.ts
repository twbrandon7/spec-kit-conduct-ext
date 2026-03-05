/**
 * DailyFocusSummary storage adapter with date rollover handling.
 * Persists focus count in localStorage under a date-keyed record.
 */

import { DAILY_SUMMARY_KEY } from './constants.ts';
import type { DailyFocusSummary } from './types.ts';

/**
 * Get the current local date as YYYY-MM-DD.
 */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load the daily summary from localStorage.
 * If no record exists, or the stored date is different from today, returns a fresh summary for today.
 */
export function loadDailySummary(): DailyFocusSummary {
  const today = getLocalDateString();
  try {
    const raw = localStorage.getItem(DAILY_SUMMARY_KEY);
    if (raw != null) {
      const parsed = JSON.parse(raw) as DailyFocusSummary;
      if (parsed.date === today && typeof parsed.completedFocusCount === 'number') {
        return parsed;
      }
    }
  } catch {
    // Malformed storage – fall through to fresh record
  }
  return { date: today, completedFocusCount: 0 };
}

/**
 * Persist the daily summary to localStorage.
 */
export function saveDailySummary(summary: DailyFocusSummary): void {
  try {
    localStorage.setItem(DAILY_SUMMARY_KEY, JSON.stringify(summary));
  } catch {
    // Best-effort: storage may be unavailable in some environments
  }
}

/**
 * Increment the focus count for today.
 * Handles date rollover automatically.
 */
export function incrementFocusCount(summary: DailyFocusSummary): DailyFocusSummary {
  const today = getLocalDateString();
  if (summary.date !== today) {
    // Date has rolled over – start fresh
    return { date: today, completedFocusCount: 1 };
  }
  return { ...summary, completedFocusCount: summary.completedFocusCount + 1 };
}

/**
 * Ensure the summary is for the current date; reset count if the date has changed.
 */
export function ensureCurrentDate(summary: DailyFocusSummary): DailyFocusSummary {
  const today = getLocalDateString();
  if (summary.date !== today) {
    return { date: today, completedFocusCount: 0 };
  }
  return summary;
}
