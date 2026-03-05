/**
 * ControlsView — control button component and event bindings.
 * Wires Start, Pause, and Reset buttons to provided callbacks.
 */

import type { TimerSession } from '../types.ts';

export type ControlCallback = () => void;

export class ControlsView {
  private startBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;

  onStart: ControlCallback | null = null;
  onPause: ControlCallback | null = null;
  onReset: ControlCallback | null = null;

  constructor(
    startBtn: HTMLButtonElement,
    pauseBtn: HTMLButtonElement,
    resetBtn: HTMLButtonElement,
  ) {
    this.startBtn = startBtn;
    this.pauseBtn = pauseBtn;
    this.resetBtn = resetBtn;

    this.startBtn.addEventListener('click', () => this.onStart?.());
    this.pauseBtn.addEventListener('click', () => this.onPause?.());
    this.resetBtn.addEventListener('click', () => this.onReset?.());
  }

  /**
   * Sync button disabled states with the current session running state.
   */
  updateState(session: TimerSession): void {
    this.startBtn.disabled = session.isRunning;
    this.pauseBtn.disabled = !session.isRunning;
  }
}

/**
 * Factory that resolves DOM elements by ID and creates a ControlsView.
 */
export function createControlsView(
  startBtnId = 'start-btn',
  pauseBtnId = 'pause-btn',
  resetBtnId = 'reset-btn',
): ControlsView {
  const startBtn = document.getElementById(startBtnId) as HTMLButtonElement | null;
  const pauseBtn = document.getElementById(pauseBtnId) as HTMLButtonElement | null;
  const resetBtn = document.getElementById(resetBtnId) as HTMLButtonElement | null;
  if (!startBtn || !pauseBtn || !resetBtn) {
    throw new Error(
      `ControlsView: required buttons not found (#${startBtnId}, #${pauseBtnId}, #${resetBtnId})`,
    );
  }
  return new ControlsView(startBtn, pauseBtn, resetBtn);
}
