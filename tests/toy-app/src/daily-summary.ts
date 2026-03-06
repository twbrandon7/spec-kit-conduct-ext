import { DAILY_SUMMARY_STORAGE_KEY } from './constants';
import type { DailyFocusSummary } from './types';

export interface DailySummaryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sanitize = (
  value: unknown,
  fallbackDate: string,
): DailyFocusSummary => {
  if (!value || typeof value !== 'object') {
    return { date: fallbackDate, completedFocusCount: 0 };
  }

  const maybe = value as Partial<DailyFocusSummary>;
  const count = Number.isInteger(maybe.completedFocusCount)
    ? Math.max(0, maybe.completedFocusCount as number)
    : 0;

  return {
    date: typeof maybe.date === 'string' ? maybe.date : fallbackDate,
    completedFocusCount: count,
  };
};

export class DailySummaryAdapter {
  private readonly storage: DailySummaryStorage;
  private readonly now: () => Date;

  constructor(
    storage: DailySummaryStorage = window.localStorage,
    now: () => Date = () => new Date(),
  ) {
    this.storage = storage;
    this.now = now;
  }

  read(): DailyFocusSummary {
    const today = toLocalDateString(this.now());
    const raw = this.storage.getItem(DAILY_SUMMARY_STORAGE_KEY);
    if (!raw) {
      return this.write({ date: today, completedFocusCount: 0 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.write({ date: today, completedFocusCount: 0 });
    }

    const summary = sanitize(parsed, today);
    if (summary.date !== today) {
      return this.write({ date: today, completedFocusCount: 0 });
    }

    return summary;
  }

  incrementFocusCompletion(): DailyFocusSummary {
    const current = this.read();
    return this.write({
      date: current.date,
      completedFocusCount: current.completedFocusCount + 1,
    });
  }

  ensureToday(): DailyFocusSummary {
    return this.read();
  }

  private write(summary: DailyFocusSummary): DailyFocusSummary {
    this.storage.setItem(DAILY_SUMMARY_STORAGE_KEY, JSON.stringify(summary));
    return summary;
  }
}
