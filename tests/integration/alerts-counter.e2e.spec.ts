import { expect, test } from '../toy-app/node_modules/@playwright/test';

test('completion updates daily counter with notification fallback path', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __POMODORO_TEST_DURATIONS__?: Record<string, number> }).__POMODORO_TEST_DURATIONS__ = {
      focus: 1,
      shortBreak: 1,
      longBreak: 1,
    };

    class DeniedNotification {
      static permission: NotificationPermission = 'denied';
      static requestPermission = async (): Promise<NotificationPermission> => 'denied';
      constructor(_title: string, _opts?: NotificationOptions) {}
    }

    (window as unknown as { Notification: typeof Notification }).Notification = DeniedNotification as unknown as typeof Notification;
  });

  await page.goto('/');

  await page.getByTestId('start-button').click();

  await expect(page.getByTestId('mode-label')).toHaveText('Short Break');
  await expect(page.getByTestId('daily-counter')).toHaveText('1');
});
