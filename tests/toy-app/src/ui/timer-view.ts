import type { TimerMode } from '../types';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const formatSeconds = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

export class TimerView {
  readonly modeLabelEl: HTMLElement;
  readonly timeDisplayEl: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    this.root.innerHTML = `
      <section data-testid="pomodoro-app">
        <h1>Pomodoro Wrapper Test App</h1>
        <p>Mode: <strong data-testid="mode-label"></strong></p>
        <p data-testid="time-display"></p>
        <div data-testid="controls-slot"></div>
        <p>Daily Focus Sessions: <span data-testid="daily-counter">0</span></p>
      </section>
    `;

    this.modeLabelEl = this.require('[data-testid="mode-label"]');
    this.timeDisplayEl = this.require('[data-testid="time-display"]');
  }

  render(mode: TimerMode, remainingSeconds: number): void {
    this.modeLabelEl.textContent = MODE_LABELS[mode];
    this.timeDisplayEl.textContent = formatSeconds(remainingSeconds);
  }

  private require(selector: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(selector);
    if (!element) {
      throw new Error(`Missing UI element: ${selector}`);
    }
    return element;
  }
}
