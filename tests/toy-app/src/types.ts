// Shared TypeScript domain types

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

/**
 * Represents the active timer state and countdown progress.
 */
export interface TimerSession {
  mode: TimerMode;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAtMs?: number;
  targetEndMs?: number;
}

/**
 * Tracks how many focus sessions have been completed in the current cycle (0-4).
 * When this reaches FOCUS_SESSIONS_BEFORE_LONG_BREAK, a long break is triggered.
 */
export interface CycleProgress {
  completedFocusInCycle: number;
}

/**
 * Date-scoped daily focus completion counter, persisted in localStorage.
 */
export interface DailyFocusSummary {
  date: string;             // YYYY-MM-DD local date
  completedFocusCount: number;
}
