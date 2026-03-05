/**
 * DailyCounterView — daily counter UI rendering and update bindings.
 */

export class DailyCounterView {
  private counterEl: HTMLElement;

  constructor(counterEl: HTMLElement) {
    this.counterEl = counterEl;
  }

  /**
   * Update the displayed count.
   */
  update(count: number): void {
    this.counterEl.textContent = String(count);
  }
}

/**
 * Factory that resolves a DOM element by ID and creates a DailyCounterView.
 */
export function createDailyCounterView(counterId = 'daily-counter'): DailyCounterView {
  const el = document.getElementById(counterId);
  if (!el) {
    throw new Error(`DailyCounterView: element #${counterId} not found`);
  }
  return new DailyCounterView(el);
}
