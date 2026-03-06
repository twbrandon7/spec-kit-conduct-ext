import { describe, expect, it } from 'vitest';
import { createApp } from '../toy-app/src/app';

describe('UI contract: controls', () => {
  it('Start begins countdown and Pause freezes it', () => {
    let now = 1_000;
    const host = document.createElement('div');
    const app = createApp(host, {
      durations: { focus: 10, shortBreak: 1, longBreak: 1 },
      clock: { nowMs: () => now },
    });

    const start = host.querySelector<HTMLButtonElement>('button[data-testid="start-button"]');
    const pause = host.querySelector<HTMLButtonElement>('button[data-testid="pause-button"]');

    if (!start || !pause) {
      throw new Error('Control buttons are missing');
    }

    start.click();
    now = 3_100;
    app.tickAt(now);
    const afterRun = host.querySelector('[data-testid="time-display"]')?.textContent;

    pause.click();
    now = 6_100;
    app.tickAt(now);
    const afterPause = host.querySelector('[data-testid="time-display"]')?.textContent;

    expect(afterRun).toBe('00:08');
    expect(afterPause).toBe('00:08');

    app.destroy();
  });

  it('Reset restores the active mode full duration', () => {
    const host = document.createElement('div');
    const app = createApp(host, {
      durations: { focus: 10, shortBreak: 1, longBreak: 1 },
    });

    app.start();
    app.tickAt(Date.now() + 3_000);

    const reset = host.querySelector<HTMLButtonElement>('button[data-testid="reset-button"]');
    if (!reset) {
      throw new Error('Reset button is missing');
    }

    reset.click();

    expect(host.querySelector('[data-testid="time-display"]')?.textContent).toBe('00:10');

    app.destroy();
  });
});
