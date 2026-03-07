import { LONG_BREAK_FREQUENCY } from './constants';
import type { CycleProgress, TimerMode } from './types';

export const createCycleProgress = (): CycleProgress => ({
  completedFocusInCycle: 0,
});

export interface FocusCompletionOutcome {
  nextMode: TimerMode;
  nextCycle: CycleProgress;
}

export const onFocusCompleted = (
  cycle: CycleProgress,
): FocusCompletionOutcome => {
  const nextCount = cycle.completedFocusInCycle + 1;
  if (nextCount >= LONG_BREAK_FREQUENCY) {
    return {
      nextMode: 'longBreak',
      nextCycle: { completedFocusInCycle: 0 },
    };
  }

  return {
    nextMode: 'shortBreak',
    nextCycle: { completedFocusInCycle: nextCount },
  };
};

export const onBreakCompleted = (): FocusCompletionOutcome => ({
  nextMode: 'focus',
  nextCycle: createCycleProgress(),
});
