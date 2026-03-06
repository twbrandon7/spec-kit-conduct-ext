import { describe, expect, it } from 'vitest';
import { createApp } from '../toy-app/src/app';

describe('UI contract: mode/time transitions', () => {
  it('renders focus mode and 25:00 on initialization', () => {
    const host = document.createElement('div');
    const app = createApp(host);

    expect(host.querySelector('[data-testid="mode-label"]')?.textContent).toBe('Focus');
    expect(host.querySelector('[data-testid="time-display"]')?.textContent).toBe('25:00');

    app.destroy();
  });

  it('updates mode after focus completion', async () => {
    const host = document.createElement('div');
    const app = createApp(host, {
      durations: { focus: 1, shortBreak: 1, longBreak: 1 },
      autoStartNext: false,
    });

    app.start();
    app.tickAt(Date.now() + 2_000);

    expect(host.querySelector('[data-testid="mode-label"]')?.textContent).toBe('Short Break');
    expect(host.querySelector('[data-testid="time-display"]')?.textContent).toBe('00:01');

    app.destroy();
  });
});
