/**
 * Browser Notification API service with permission-aware fallback.
 * Failures must never block timer transitions.
 */

/**
 * Request notification permission lazily.
 * Returns 'granted', 'denied', or 'default'.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in globalThis)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Show a system notification if permission is granted.
 * Best-effort: silently fails if permission is not granted or API unavailable.
 */
export async function showNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in globalThis)) return;
  try {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      new Notification(title, { body, icon: undefined });
    }
    // If denied or default, silently skip
  } catch {
    // Best-effort: any failure is swallowed
  }
}
