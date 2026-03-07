export interface NotificationApi {
  permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
  create(title: string, options?: NotificationOptions): void;
}

const browserNotificationApi = (): NotificationApi | null => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return {
    get permission() {
      return Notification.permission;
    },
    requestPermission: () => Notification.requestPermission(),
    create: (title: string, options?: NotificationOptions) => {
      // Notifications are best-effort and must not block app flow.
      new Notification(title, options);
    },
  };
};

export class NotificationService {
  constructor(private readonly api: NotificationApi | null = browserNotificationApi()) {}

  async notifyCompletion(message: string): Promise<boolean> {
    if (!this.api) {
      return false;
    }

    let permission = this.api.permission;
    if (permission === 'default') {
      permission = await this.api.requestPermission();
    }

    if (permission !== 'granted') {
      return false;
    }

    try {
      this.api.create('Pomodoro Complete', { body: message });
      return true;
    } catch {
      return false;
    }
  }
}
