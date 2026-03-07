import { DailySummaryAdapter } from '../daily-summary';

export class DailyCounterService {
  constructor(private readonly summary = new DailySummaryAdapter()) {}

  getCount(): number {
    return this.summary.ensureToday().completedFocusCount;
  }

  incrementOnFocusCompletion(): number {
    return this.summary.incrementFocusCompletion().completedFocusCount;
  }

  refreshForToday(): number {
    return this.summary.ensureToday().completedFocusCount;
  }
}
