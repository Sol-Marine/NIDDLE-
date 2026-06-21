"use client";

import { useState, useEffect, useCallback } from "react";
import { requestNotificationPermission, sendLocalNotification } from "../lib/notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();
      if (!me.id) return;

      const [notifs, count] = await Promise.all([
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/notifications?count=true").then((r) => r.json()),
      ]);

      const prev = notifications;
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(count?.count ?? 0);

      if (pushEnabled && prev.length > 0) {
        const newNotifs = (Array.isArray(notifs) ? notifs : []).filter(
          (n: Notification) => !prev.some((p) => p.id === n.id) && !n.read
        );
        newNotifs.forEach((n: Notification) => {
          sendLocalNotification(n.title, n.message, undefined, n.link);
        });
      }
    } catch {
      // ignore
    }
  }, [notifications, pushEnabled]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const enablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushEnabled(granted);
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 hover:bg-gray-100 rounded-xl transition"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-sm">Notifications</p>
            {!pushEnabled && (
              <button
                onClick={enablePush}
                className="text-[10px] text-[#D4A24C] font-semibold hover:underline"
              >
                Enable push
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No notifications</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${n.read ? "" : "bg-[#FFF8F0]"}`}
                  onClick={() => markRead(n.id)}
                >
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
