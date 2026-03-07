import { createCycleProgress, onBreakCompleted, onFocusCompleted } from '../cycle-model';
import type { TimerMode } from '../types';

export class CycleService {
  private completed = createCycleProgress().completedFocusInCycle;

  get completedFocusInCycle(): number {
    return this.completed;
  }

  onModeCompleted(mode: TimerMode): TimerMode {
    if (mode === 'focus') {
      const outcome = onFocusCompleted({ completedFocusInCycle: this.completed });
      this.completed = outcome.nextCycle.completedFocusInCycle;
      return outcome.nextMode;
    }

    return onBreakCompleted().nextMode;
  }
}
