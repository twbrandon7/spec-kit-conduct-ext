import { describe, expect, it, vi } from 'vitest';
import { TimerService } from '../toy-app/src/services/timer-service';
import { MODE_DURATIONS_SECONDS } from '../toy-app/src/constants';

describe('TimerService countdown', () => {
  it('uses target timestamp countdown and completes at zero', () => {
    const now = vi.fn(() => 10_000);
    const service = new TimerService({ nowMs: now });

    service.switchMode('focus');
    service.setRemainingSeconds(3);

    let completed = false;
    service.onCompleted(() => {
      completed = true;
    });

    service.start();
    expect(service.getState().remainingSeconds).toBe(3);

    now.mockReturnValue(11_001);
    service.handleTick();
    expect(service.getState().remainingSeconds).toBe(2);
    expect(completed).toBe(false);

    now.mockReturnValue(13_001);
    service.handleTick();
    expect(service.getState().remainingSeconds).toBe(0);
    expect(completed).toBe(true);
  });

  it('resets active mode to full duration', () => {
    const service = new TimerService();
    service.switchMode('shortBreak');
    service.setRemainingSeconds(10);

    service.reset();

    expect(service.getState().remainingSeconds).toBe(
      MODE_DURATIONS_SECONDS.shortBreak,
    );
    expect(service.getState().isRunning).toBe(false);
  });
});
