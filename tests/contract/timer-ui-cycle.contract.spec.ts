/**
 * Contract tests for mode/time UI state transitions (T019, US1).
 * Verifies that the application state conforms to the timer-ui-contract.md spec.
 */

import { describe, it, expect } from 'vitest';
import { createTimerSession, formatTime } from '../toy-app/src/timer-model.ts';
import { createCycleProgress, getNextModeAndCycle } from '../toy-app/src/cycle-model.ts';
import { DURATIONS, MODE_LABELS } from '../toy-app/src/constants.ts';

describe('Timer UI cycle contract', () => {
  describe('Initial state contract', () => {
    it('initial mode is focus', () => {
      const session = createTimerSession('focus');
      expect(session.mode).toBe('focus');
    });

    it('initial time display is 25:00', () => {
      const session = createTimerSession('focus');
      expect(formatTime(session.remainingSeconds)).toBe('25:00');
    });

    it('initial mode label is Focus', () => {
      const session = createTimerSession('focus');
      expect(MODE_LABELS[session.mode]).toBe('Focus');
    });

    it('timer is not running initially', () => {
      const session = createTimerSession('focus');
      expect(session.isRunning).toBe(false);
    });
  });

  describe('Mode duration contract', () => {
    it('focus session has 1500 second duration', () => {
      const session = createTimerSession('focus');
      expect(session.durationSeconds).toBe(DURATIONS.focus);
      expect(session.durationSeconds).toBe(1500);
    });

    it('short break session has 300 second duration', () => {
      const session = createTimerSession('shortBreak');
      expect(session.durationSeconds).toBe(DURATIONS.shortBreak);
      expect(session.durationSeconds).toBe(300);
    });

    it('long break session has 900 second duration', () => {
      const session = createTimerSession('longBreak');
      expect(session.durationSeconds).toBe(DURATIONS.longBreak);
      expect(session.durationSeconds).toBe(900);
    });
  });

  describe('Mode label contract', () => {
    it('focus mode label is "Focus"', () => {
      expect(MODE_LABELS['focus']).toBe('Focus');
    });

    it('shortBreak mode label is "Short Break"', () => {
      expect(MODE_LABELS['shortBreak']).toBe('Short Break');
    });

    it('longBreak mode label is "Long Break"', () => {
      expect(MODE_LABELS['longBreak']).toBe('Long Break');
    });
  });

  describe('Mode transition contract', () => {
    it('after focus completion (cycle 1–3), next mode is shortBreak at full duration', () => {
      const cycle = createCycleProgress();
      const { nextMode } = getNextModeAndCycle('focus', cycle);
      const nextSession = createTimerSession(nextMode);

      expect(nextSession.mode).toBe('shortBreak');
      expect(nextSession.remainingSeconds).toBe(DURATIONS.shortBreak);
      expect(nextSession.isRunning).toBe(false);
    });

    it('after 4th focus completion, next mode is longBreak at full duration', () => {
      const cycle = { completedFocusInCycle: 3 };
      const { nextMode } = getNextModeAndCycle('focus', cycle);
      const nextSession = createTimerSession(nextMode);

      expect(nextSession.mode).toBe('longBreak');
      expect(nextSession.remainingSeconds).toBe(DURATIONS.longBreak);
      expect(nextSession.isRunning).toBe(false);
    });

    it('after shortBreak completion, next mode is focus at full duration', () => {
      const cycle = { completedFocusInCycle: 1 };
      const { nextMode } = getNextModeAndCycle('shortBreak', cycle);
      const nextSession = createTimerSession(nextMode);

      expect(nextSession.mode).toBe('focus');
      expect(nextSession.remainingSeconds).toBe(DURATIONS.focus);
    });

    it('after longBreak completion, next mode is focus at full duration', () => {
      const cycle = { completedFocusInCycle: 0 };
      const { nextMode } = getNextModeAndCycle('longBreak', cycle);
      const nextSession = createTimerSession(nextMode);

      expect(nextSession.mode).toBe('focus');
      expect(nextSession.remainingSeconds).toBe(DURATIONS.focus);
    });
  });

  describe('Time display format contract', () => {
    it('formats full focus duration as 25:00', () => {
      expect(formatTime(1500)).toBe('25:00');
    });

    it('formats full short break as 05:00', () => {
      expect(formatTime(300)).toBe('05:00');
    });

    it('formats full long break as 15:00', () => {
      expect(formatTime(900)).toBe('15:00');
    });

    it('formats 0 as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('formats 61 seconds as 01:01', () => {
      expect(formatTime(61)).toBe('01:01');
    });

    it('formats 90 seconds as 01:30', () => {
      expect(formatTime(90)).toBe('01:30');
    });
  });

  describe('New session state after transition', () => {
    it('new session after transition is not running', () => {
      const cycle = createCycleProgress();
      const { nextMode } = getNextModeAndCycle('focus', cycle);
      const nextSession = createTimerSession(nextMode);
      expect(nextSession.isRunning).toBe(false);
    });

    it('new session remainingSeconds equals durationSeconds', () => {
      const cycle = createCycleProgress();
      const { nextMode } = getNextModeAndCycle('focus', cycle);
      const nextSession = createTimerSession(nextMode);
      expect(nextSession.remainingSeconds).toBe(nextSession.durationSeconds);
    });
  });
});
