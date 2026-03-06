export const MODE_DURATIONS_SECONDS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
} as const;

export const MODES = ['focus', 'shortBreak', 'longBreak'] as const;
export const LONG_BREAK_FREQUENCY = 4;

export const DAILY_SUMMARY_STORAGE_KEY = 'pomodoro.dailySummary';
