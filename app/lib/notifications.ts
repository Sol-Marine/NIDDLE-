export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {});
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendLocalNotification(title: string, body: string, icon?: string, url?: string) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: icon || "/icon-192.png",
    badge: "/icon-192.png",
    tag: url || title,
    data: { url },
  });

  notification.onclick = () => {
    if (url) window.focus();
    notification.close();
  };
}
