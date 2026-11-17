// Mobile & Web Push Notification Helpers using Service Worker Registration

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestMobileNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Notification permission request failed:', err);
    return Notification.permission;
  }
}

export async function dispatchMobileNotification(
  title: string,
  body: string,
  options?: { tag?: string; url?: string }
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions: NotificationOptions & { vibrate?: number[] } = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: options?.tag || `lifecare-${Date.now()}`,
    vibrate: [200, 100, 200],
    data: { url: options?.url || 'home' },
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    }
  } catch (swErr) {
    console.warn('ServiceWorker showNotification fallback to window Notification:', swErr);
  }

  try {
    new Notification(title, notifOptions);
    return true;
  } catch (err) {
    console.warn('Browser Notification constructor failed (mobile browser requires SW):', err);
    return false;
  }
}
