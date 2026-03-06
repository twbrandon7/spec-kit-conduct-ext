import { describe, expect, it } from 'vitest';
import { CycleService } from '../toy-app/src/services/cycle-service';

describe('CycleService', () => {
  it('transitions focus completion to short break for first three focus sessions', () => {
    const cycle = new CycleService();

    expect(cycle.onModeCompleted('focus')).toBe('shortBreak');
    expect(cycle.completedFocusInCycle).toBe(1);

    expect(cycle.onModeCompleted('focus')).toBe('shortBreak');
    expect(cycle.completedFocusInCycle).toBe(2);

    expect(cycle.onModeCompleted('focus')).toBe('shortBreak');
    expect(cycle.completedFocusInCycle).toBe(3);
  });

  it('transitions fourth focus completion to long break and resets cycle progress', () => {
    const cycle = new CycleService();

    cycle.onModeCompleted('focus');
    cycle.onModeCompleted('focus');
    cycle.onModeCompleted('focus');

    expect(cycle.onModeCompleted('focus')).toBe('longBreak');
    expect(cycle.completedFocusInCycle).toBe(0);
  });

  it('returns to focus after short and long breaks', () => {
    const cycle = new CycleService();

    expect(cycle.onModeCompleted('shortBreak')).toBe('focus');
    expect(cycle.onModeCompleted('longBreak')).toBe('focus');
  });
});
