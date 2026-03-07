import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../toy-app/src/app';

describe('UI contract: alerts + daily counter', () => {
  it('increments daily counter on focus completion', () => {
    const host = document.createElement('div');
    const app = createApp(host, {
      durations: { focus: 1, shortBreak: 1, longBreak: 1 },
      autoStartNext: false,
    });

    app.start();
    app.tickAt(Date.now() + 1_500);

    expect(host.querySelector('[data-testid="daily-counter"]')?.textContent).toBe('1');

    app.destroy();
  });

  it('continues mode transition even when alerts fail', () => {
    const host = document.createElement('div');
    const app = createApp(host, {
      durations: { focus: 1, shortBreak: 1, longBreak: 1 },
      audioAlertOverride: { playCompletionChime: vi.fn(async () => false) },
      notificationOverride: { notifyCompletion: vi.fn(async () => false) },
      autoStartNext: false,
    });

    app.start();
    app.tickAt(Date.now() + 1_500);

    expect(host.querySelector('[data-testid="mode-label"]')?.textContent).toBe('Short Break');

    app.destroy();
  });
});
