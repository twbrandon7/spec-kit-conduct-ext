/**
 * Unit tests for mode transition rules (T017, US1).
 * Tests the pure cycle-model.ts logic for short/long break determination.
 */

import { describe, it, expect } from 'vitest';
import {
  createCycleProgress,
  getNextModeAndCycle,
} from '../toy-app/src/cycle-model.ts';

describe('Pomodoro cycle transitions', () => {
  describe('focus → shortBreak (1st, 2nd, 3rd focus)', () => {
    it('1st focus completion transitions to shortBreak', () => {
      const cycle = createCycleProgress(); // completedFocusInCycle = 0
      const { nextMode, nextCycle } = getNextModeAndCycle('focus', cycle);
      expect(nextMode).toBe('shortBreak');
      expect(nextCycle.completedFocusInCycle).toBe(1);
    });

    it('2nd focus completion transitions to shortBreak', () => {
      const cycle = { completedFocusInCycle: 1 };
      const { nextMode, nextCycle } = getNextModeAndCycle('focus', cycle);
      expect(nextMode).toBe('shortBreak');
      expect(nextCycle.completedFocusInCycle).toBe(2);
    });

    it('3rd focus completion transitions to shortBreak', () => {
      const cycle = { completedFocusInCycle: 2 };
      const { nextMode, nextCycle } = getNextModeAndCycle('focus', cycle);
      expect(nextMode).toBe('shortBreak');
      expect(nextCycle.completedFocusInCycle).toBe(3);
    });
  });

  describe('focus → longBreak (4th focus)', () => {
    it('4th focus completion transitions to longBreak', () => {
      const cycle = { completedFocusInCycle: 3 };
      const { nextMode, nextCycle } = getNextModeAndCycle('focus', cycle);
      expect(nextMode).toBe('longBreak');
      expect(nextCycle.completedFocusInCycle).toBe(0);
    });

    it('resets cycle count to 0 after 4th focus', () => {
      const cycle = { completedFocusInCycle: 3 };
      const { nextCycle } = getNextModeAndCycle('focus', cycle);
      expect(nextCycle.completedFocusInCycle).toBe(0);
    });
  });

  describe('break → focus', () => {
    it('shortBreak completion transitions back to focus', () => {
      const cycle = { completedFocusInCycle: 1 };
      const { nextMode, nextCycle } = getNextModeAndCycle('shortBreak', cycle);
      expect(nextMode).toBe('focus');
      expect(nextCycle.completedFocusInCycle).toBe(1); // unchanged
    });

    it('longBreak completion transitions back to focus', () => {
      const cycle = { completedFocusInCycle: 0 };
      const { nextMode, nextCycle } = getNextModeAndCycle('longBreak', cycle);
      expect(nextMode).toBe('focus');
      expect(nextCycle.completedFocusInCycle).toBe(0); // unchanged
    });

    it('shortBreak does not change cycle count', () => {
      const cycle = { completedFocusInCycle: 3 };
      const { nextCycle } = getNextModeAndCycle('shortBreak', cycle);
      expect(nextCycle.completedFocusInCycle).toBe(3);
    });
  });

  describe('full 4-cycle sequence', () => {
    it('correctly cycles through 4 focus sessions with breaks', () => {
      let cycle = createCycleProgress();

      // Focus 1
      let result = getNextModeAndCycle('focus', cycle);
      expect(result.nextMode).toBe('shortBreak');
      cycle = result.nextCycle;

      // Short break 1
      result = getNextModeAndCycle('shortBreak', cycle);
      expect(result.nextMode).toBe('focus');
      cycle = result.nextCycle;

      // Focus 2
      result = getNextModeAndCycle('focus', cycle);
      expect(result.nextMode).toBe('shortBreak');
      cycle = result.nextCycle;

      // Short break 2
      result = getNextModeAndCycle('shortBreak', cycle);
      expect(result.nextMode).toBe('focus');
      cycle = result.nextCycle;

      // Focus 3
      result = getNextModeAndCycle('focus', cycle);
      expect(result.nextMode).toBe('shortBreak');
      cycle = result.nextCycle;

      // Short break 3
      result = getNextModeAndCycle('shortBreak', cycle);
      expect(result.nextMode).toBe('focus');
      cycle = result.nextCycle;

      // Focus 4 — triggers long break and resets
      result = getNextModeAndCycle('focus', cycle);
      expect(result.nextMode).toBe('longBreak');
      expect(result.nextCycle.completedFocusInCycle).toBe(0);
    });
  });
});
