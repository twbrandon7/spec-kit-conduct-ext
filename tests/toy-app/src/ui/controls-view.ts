export interface ControlsHandlers {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export class ControlsView {
  constructor(private readonly host: HTMLElement, handlers: ControlsHandlers) {
    this.host.innerHTML = `
      <button type="button" data-testid="start-button">Start</button>
      <button type="button" data-testid="pause-button">Pause</button>
      <button type="button" data-testid="reset-button">Reset</button>
    `;

    this.require('[data-testid="start-button"]').addEventListener('click', handlers.onStart);
    this.require('[data-testid="pause-button"]').addEventListener('click', handlers.onPause);
    this.require('[data-testid="reset-button"]').addEventListener('click', handlers.onReset);
  }

  private require(selector: string): HTMLButtonElement {
    const button = this.host.querySelector<HTMLButtonElement>(selector);
    if (!button) {
      throw new Error(`Missing control button: ${selector}`);
    }
    return button;
  }
}
