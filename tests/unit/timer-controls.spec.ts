import { describe, expect, it } from 'vitest';
import { ControlService } from '../toy-app/src/services/control-service';
import { TimerService } from '../toy-app/src/services/timer-service';

describe('ControlService', () => {
  it('start is idempotent while already running', () => {
    const timer = new TimerService({ nowMs: () => 1000 });
    const control = new ControlService(timer);

    control.start();
    const first = timer.getState().targetEndMs;

    control.start();
    const second = timer.getState().targetEndMs;

    expect(first).toBeDefined();
    expect(second).toBe(first);
  });

  it('pause preserves remaining time', () => {
    let now = 1_000;
    const timer = new TimerService({ nowMs: () => now });
    timer.setRemainingSeconds(10);
    const control = new ControlService(timer);

    control.start();
    now = 4_500;
    control.pause();

    expect(timer.getState().remainingSeconds).toBe(7);
    expect(timer.getState().isRunning).toBe(false);
  });

  it('reset stops and restores full duration of active mode', () => {
    const timer = new TimerService();
    timer.switchMode('shortBreak');
    timer.setRemainingSeconds(7);
    const control = new ControlService(timer);

    control.reset();

    expect(timer.getState().remainingSeconds).toBe(300);
    expect(timer.getState().isRunning).toBe(false);
  });
});
