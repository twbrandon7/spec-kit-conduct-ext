/**
 * CycleService — cycle transition coordinator.
 * Combines timer-model and cycle-model to compute the next session and cycle
 * after a mode completes.
 */

import { createTimerSession } from '../timer-model.ts';
import { getNextModeAndCycle } from '../cycle-model.ts';
import type { CycleProgress, TimerMode, TimerSession } from '../types.ts';

export interface CycleTransitionResult {
  nextSession: TimerSession;
  nextCycle: CycleProgress;
}

/**
 * Compute the next timer session and cycle progress after the given mode completes.
 */
export function handleModeCompletion(
  completedMode: TimerMode,
  cycle: CycleProgress,
): CycleTransitionResult {
  const { nextMode, nextCycle } = getNextModeAndCycle(completedMode, cycle);
  const nextSession = createTimerSession(nextMode);
  return { nextSession, nextCycle };
}
