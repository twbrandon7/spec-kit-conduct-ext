export class DailyCounterView {
  private readonly counterElement: HTMLElement;

  constructor(root: HTMLElement) {
    const element = root.querySelector<HTMLElement>('[data-testid="daily-counter"]');
    if (!element) {
      throw new Error('Missing daily counter element');
    }

    this.counterElement = element;
  }

  render(count: number): void {
    this.counterElement.textContent = String(Math.max(0, count));
  }
}
