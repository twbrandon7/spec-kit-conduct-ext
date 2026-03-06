import { AudioAlertService } from '../alerts';
import { NotificationService } from '../notifications';
import type { TimerMode } from '../types';

export interface AudioAlertPort {
  playCompletionChime(): Promise<boolean>;
}

export interface NotificationPort {
  notifyCompletion(message: string): Promise<boolean>;
}

const modeMessage = (mode: TimerMode): string => {
  if (mode === 'focus') {
    return 'Focus session complete. Time for a break.';
  }

  return 'Break complete. Back to focus.';
};

export class AlertService {
  constructor(
    private readonly audio: AudioAlertPort = new AudioAlertService(),
    private readonly notifications: NotificationPort = new NotificationService(),
  ) {}

  async notifyModeCompletion(mode: TimerMode): Promise<void> {
    const message = modeMessage(mode);
    await Promise.allSettled([
      this.audio.playCompletionChime(),
      this.notifications.notifyCompletion(message),
    ]);
  }
}
