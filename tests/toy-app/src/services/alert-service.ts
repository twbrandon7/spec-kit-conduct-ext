/**
 * AlertService — completion alert coordinator.
 * Invokes audio chime and system notification best-effort on timer completion.
 * Failures in either alert path must never block mode transitions.
 */

import { playChime } from '../alerts.ts';
import { showNotification } from '../notifications.ts';
import { MODE_LABELS } from '../constants.ts';
import type { TimerMode } from '../types.ts';

const COMPLETION_MESSAGES: Record<TimerMode, { title: string; body: string }> = {
  focus: {
    title: '⏰ Focus session complete!',
    body: 'Great work! Time for a break.',
  },
  shortBreak: {
    title: '☕ Short break over',
    body: 'Ready to focus again?',
  },
  longBreak: {
    title: '🎉 Long break over',
    body: 'Recharged and ready to go!',
  },
};

export class AlertService {
  /**
   * Fire completion alert for the mode that just completed.
   * Audio and notification are each tried independently; failure in one
   * does not prevent the other from being attempted.
   */
  async fireCompletionAlert(completedMode: TimerMode): Promise<void> {
    const message = COMPLETION_MESSAGES[completedMode];
    // Run audio and notification in parallel, both best-effort
    await Promise.allSettled([
      playChime(),
      showNotification(message.title, `${MODE_LABELS[completedMode]} session ended. ${message.body}`),
    ]);
  }
}
