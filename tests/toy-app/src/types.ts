import type { MODES } from './constants';

export type TimerMode = (typeof MODES)[number];

export interface TimerSession {
  mode: TimerMode;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  startedAtMs?: number;
  targetEndMs?: number;
}

export interface CycleProgress {
  completedFocusInCycle: number;
}

export interface DailyFocusSummary {
  date: string;
  completedFocusCount: number;
}

export interface Clock {
  nowMs(): number;
}
