// Shared timer constants and mode durations

export const DURATIONS = {
  focus: 1500,      // 25 minutes in seconds
  shortBreak: 300,  // 5 minutes in seconds
  longBreak: 900,   // 15 minutes in seconds
} as const;

/** Number of focus sessions that trigger a long break */
export const FOCUS_SESSIONS_BEFORE_LONG_BREAK = 4;

/** Ticker poll interval in milliseconds */
export const TICK_INTERVAL_MS = 1000;

/** localStorage key for daily focus summary */
export const DAILY_SUMMARY_KEY = 'pomodoro-daily-summary';

/** Display names for each timer mode */
export const MODE_LABELS = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
} as const;
