import { describe, expect, it } from 'vitest';
import { DailySummaryAdapter } from '../toy-app/src/daily-summary';

describe('DailySummaryAdapter', () => {
  it('increments completed focus count on same date', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };

    const adapter = new DailySummaryAdapter(storage, () => new Date('2026-03-06T10:00:00'));

    expect(adapter.ensureToday().completedFocusCount).toBe(0);
    expect(adapter.incrementFocusCompletion().completedFocusCount).toBe(1);
    expect(adapter.incrementFocusCompletion().completedFocusCount).toBe(2);
  });

  it('resets count on local date rollover', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };

    let now = new Date('2026-03-06T23:59:00');
    const adapter = new DailySummaryAdapter(storage, () => now);

    adapter.incrementFocusCompletion();
    expect(adapter.ensureToday().completedFocusCount).toBe(1);

    now = new Date('2026-03-07T00:01:00');
    expect(adapter.ensureToday().completedFocusCount).toBe(0);
  });
});
