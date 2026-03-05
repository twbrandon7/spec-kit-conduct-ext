/**
 * TimerView — active mode label and countdown display bindings.
 * Renders mode name and MM:SS time to DOM elements.
 */

import { MODE_LABELS } from '../constants.ts';
import { formatTime } from '../timer-model.ts';
import type { TimerSession } from '../types.ts';

export class TimerView {
  private modeLabelEl: HTMLElement;
  private timeDisplayEl: HTMLElement;

  constructor(modeLabelEl: HTMLElement, timeDisplayEl: HTMLElement) {
    this.modeLabelEl = modeLabelEl;
    this.timeDisplayEl = timeDisplayEl;
  }

  /**
   * Update both the mode label and time display from a session.
   */
  update(session: TimerSession): void {
    this.modeLabelEl.textContent = MODE_LABELS[session.mode];
    this.timeDisplayEl.textContent = formatTime(session.remainingSeconds);
  }

  /**
   * Update only the countdown time.
   */
  updateTime(remainingSeconds: number): void {
    this.timeDisplayEl.textContent = formatTime(remainingSeconds);
  }
}

/**
 * Factory that resolves DOM elements by ID and creates a TimerView.
 * Throws if required elements are not found in the document.
 */
export function createTimerView(
  modeLabelId = 'mode-label',
  timeDisplayId = 'time-display',
): TimerView {
  const modeLabelEl = document.getElementById(modeLabelId);
  const timeDisplayEl = document.getElementById(timeDisplayId);
  if (!modeLabelEl || !timeDisplayEl) {
    throw new Error(`TimerView: required DOM elements not found (#${modeLabelId}, #${timeDisplayId})`);
  }
  return new TimerView(modeLabelEl, timeDisplayEl);
}
