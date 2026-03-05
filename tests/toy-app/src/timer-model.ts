/**
 * TimerSession state model and transition guards.
 * All functions are pure - they return new session objects without mutation.
 */

import { DURATIONS } from './constants.ts';
import type { TimerMode, TimerSession } from './types.ts';

/**
 * Create a new idle timer session for the given mode at full duration.
 */
export function createTimerSession(mode: TimerMode): TimerSession {
  const durationSeconds = DURATIONS[mode];
  return {
    mode,
    durationSeconds,
    remainingSeconds: durationSeconds,
    isRunning: false,
  };
}

/**
 * Transition an idle/paused session to running.
 * Returns unchanged session if already running (idempotent guard).
 */
export function startSession(session: TimerSession, now: number): TimerSession {
  if (session.isRunning) return session;
  const targetEndMs = now + session.remainingSeconds * 1000;
  return {
    ...session,
    isRunning: true,
    startedAtMs: now,
    targetEndMs,
  };
}

/**
 * Transition a running session to paused, preserving the current remaining time.
 */
export function pauseSession(session: TimerSession, remainingSeconds: number): TimerSession {
  return {
    ...session,
    isRunning: false,
    remainingSeconds,
    startedAtMs: undefined,
    targetEndMs: undefined,
  };
}

/**
 * Reset a session to its full duration and stop countdown.
 * Safe to call from any state (running, paused, idle).
 */
export function resetSession(session: TimerSession): TimerSession {
  return {
    ...session,
    isRunning: false,
    remainingSeconds: session.durationSeconds,
    startedAtMs: undefined,
    targetEndMs: undefined,
  };
}

/**
 * Compute current remaining seconds using the target end timestamp.
 * Falls back to stored remainingSeconds if session is not running.
 */
export function computeRemaining(session: TimerSession, now: number): number {
  if (!session.isRunning || session.targetEndMs == null) {
    return session.remainingSeconds;
  }
  return Math.max(0, Math.ceil((session.targetEndMs - now) / 1000));
}

/**
 * Format remaining seconds as MM:SS for display.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
