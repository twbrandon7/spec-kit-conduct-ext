import { describe, expect, it, vi } from 'vitest';
import { AudioAlertService } from '../toy-app/src/alerts';
import { NotificationService } from '../toy-app/src/notifications';
import { TimerService } from '../toy-app/src/services/timer-service';

describe('Edge cases', () => {
  it('returns false when notification permission is denied', async () => {
    const notify = new NotificationService({
      permission: 'denied',
      requestPermission: vi.fn(async () => 'denied'),
      create: vi.fn(),
    });

    await expect(notify.notifyCompletion('Done')).resolves.toBe(false);
  });

  it('returns false when audio playback fails', async () => {
    const audio = new AudioAlertService({
      play: vi.fn(async () => {
        throw new Error('no audio device');
      }),
    });

    await expect(audio.playCompletionChime()).resolves.toBe(false);
  });

  it('reset at 0:00 restores full active duration and stops running', () => {
    let now = 1_000;
    const service = new TimerService({ nowMs: () => now });

    service.setRemainingSeconds(1);
    service.start();

    now = 2_100;
    service.handleTick(now);

    expect(service.getState().remainingSeconds).toBe(0);

    service.reset();

    const state = service.getState();
    expect(state.remainingSeconds).toBe(state.durationSeconds);
    expect(state.isRunning).toBe(false);
  });
});
