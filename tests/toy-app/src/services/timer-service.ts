import {
  computeRemainingSeconds,
  createTimerSession,
  pauseTimerSession,
  resetTimerSession,
  startTimerSession,
  switchTimerMode,
} from '../timer-model';
import type { Clock, TimerMode, TimerSession } from '../types';

export class TimerService {
  private state: TimerSession = createTimerSession('focus');
  private readonly clock: Clock;
  private tickListeners = new Set<(state: TimerSession) => void>();
  private completedListeners = new Set<(mode: TimerMode) => void>();

  constructor(clock: Clock = { nowMs: () => Date.now() }) {
    this.clock = clock;
  }

  getState(): TimerSession {
    return { ...this.state };
  }

  onTick(listener: (state: TimerSession) => void): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  onCompleted(listener: (mode: TimerMode) => void): () => void {
    this.completedListeners.add(listener);
    return () => this.completedListeners.delete(listener);
  }

  switchMode(mode: TimerMode): void {
    this.state = switchTimerMode(this.state, mode);
    this.emitTick();
  }

  setRemainingSeconds(seconds: number): void {
    const { startedAtMs: _startedAtMs, targetEndMs: _targetEndMs, ...rest } = this.state;
    this.state = {
      ...rest,
      remainingSeconds: Math.max(0, Math.min(seconds, this.state.durationSeconds)),
      isRunning: false,
    };
    this.emitTick();
  }

  start(): void {
    this.state = startTimerSession(this.state, this.clock.nowMs());
    this.emitTick();
  }

  pause(): void {
    this.state = pauseTimerSession(this.state, this.clock.nowMs());
    this.emitTick();
  }

  reset(): void {
    this.state = resetTimerSession(this.state);
    this.emitTick();
  }

  handleTick(nowMs: number = this.clock.nowMs()): void {
    const remainingSeconds = computeRemainingSeconds(this.state, nowMs);
    const modeAtTick = this.state.mode;
    const wasRunning = this.state.isRunning;

    this.state = {
      ...this.state,
      remainingSeconds,
    };

    if (wasRunning && remainingSeconds === 0) {
      this.state = pauseTimerSession(this.state, nowMs);
      this.emitTick();
      this.completedListeners.forEach((listener) => listener(modeAtTick));
      return;
    }

    this.emitTick();
  }

  private emitTick(): void {
    const snapshot = this.getState();
    this.tickListeners.forEach((listener) => listener(snapshot));
  }
}
