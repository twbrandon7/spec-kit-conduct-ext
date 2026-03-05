/**
 * CycleProgress state model and long-break trigger logic.
 * All functions are pure - no side effects.
 */

import { FOCUS_SESSIONS_BEFORE_LONG_BREAK } from './constants.ts';
import type { CycleProgress, TimerMode } from './types.ts';

/**
 * Create a fresh cycle progress starting at zero.
 */
export function createCycleProgress(): CycleProgress {
  return { completedFocusInCycle: 0 };
}

/**
 * Determine the next mode and updated cycle progress after a mode completes.
 *
 * Transition rules:
 *  - focus completion: increment counter
 *    - if new count is 1-3 → shortBreak
 *    - if new count is 4   → longBreak, reset cycle to 0
 *  - shortBreak / longBreak completion → focus (cycle unchanged)
 */
export function getNextModeAndCycle(
  completedMode: TimerMode,
  cycle: CycleProgress,
): { nextMode: TimerMode; nextCycle: CycleProgress } {
  if (completedMode === 'focus') {
    const newCount = cycle.completedFocusInCycle + 1;
    if (newCount >= FOCUS_SESSIONS_BEFORE_LONG_BREAK) {
      // 4th focus session → trigger long break, then reset cycle
      return {
        nextMode: 'longBreak',
        nextCycle: { completedFocusInCycle: 0 },
      };
    }
    // 1st–3rd focus session → short break
    return {
      nextMode: 'shortBreak',
      nextCycle: { completedFocusInCycle: newCount },
    };
  }

  // Break completed → return to focus, cycle count unchanged
  return {
    nextMode: 'focus',
    nextCycle: cycle,
  };
}

/**
 * Returns true if the current cycle state warrants a long break next.
 */
export function isLongBreakDue(cycle: CycleProgress): boolean {
  return cycle.completedFocusInCycle >= FOCUS_SESSIONS_BEFORE_LONG_BREAK;
}
