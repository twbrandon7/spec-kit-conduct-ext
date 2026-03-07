import { MODE_DURATIONS_SECONDS } from './constants';
import type { TimerMode, TimerSession } from './types';

export const createTimerSession = (mode: TimerMode = 'focus'): TimerSession => {
  const durationSeconds = MODE_DURATIONS_SECONDS[mode];
  return {
    mode,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isRunning: false,
  };
};

export const startTimerSession = (
  session: TimerSession,
  nowMs: number,
): TimerSession => {
  if (session.isRunning || session.remainingSeconds <= 0) {
    return session;
  }

  return {
    ...session,
    isRunning: true,
    startedAtMs: nowMs,
    targetEndMs: nowMs + session.remainingSeconds * 1000,
  };
};

export const pauseTimerSession = (
  session: TimerSession,
  nowMs: number,
): TimerSession => {
  if (!session.isRunning || !session.targetEndMs) {
    const { startedAtMs: _startedAtMs, targetEndMs: _targetEndMs, ...rest } = session;
    return { ...rest, isRunning: false };
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((session.targetEndMs - nowMs) / 1000),
  );

  const { startedAtMs: _startedAtMs, targetEndMs: _targetEndMs, ...rest } = session;
  return {
    ...rest,
    remainingSeconds,
    isRunning: false,
  };
};

export const resetTimerSession = (session: TimerSession): TimerSession => {
  const durationSeconds = MODE_DURATIONS_SECONDS[session.mode];
  const { startedAtMs: _startedAtMs, targetEndMs: _targetEndMs, ...rest } = session;
  return {
    ...rest,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isRunning: false,
  };
};

export const switchTimerMode = (
  _session: TimerSession,
  mode: TimerMode,
): TimerSession => createTimerSession(mode);

export const computeRemainingSeconds = (
  session: TimerSession,
  nowMs: number,
): number => {
  if (!session.isRunning || !session.targetEndMs) {
    return session.remainingSeconds;
  }

  return Math.max(0, Math.ceil((session.targetEndMs - nowMs) / 1000));
};
