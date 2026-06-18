"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean; link?: string }[]>([]);

  const fetchNotifCount = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setUser(data);
          fetch("/api/notifications?count=true")
            .then((r) => r.json())
            .then((n) => setNotifCount(n.count));
        } else {
          setUser(null);
          setNotifCount(0);
        }
      })
      .catch(() => { setUser(null); setNotifCount(0); });
  }, []);

  useEffect(() => {
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifCount]);

  const openNotifs = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    }
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setNotifCount((c) => Math.max(0, c - 1));
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D4A24C]/20 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between h-18">
        <Link href="/">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#5A432C]">
            NIDDLE
          </h1>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-[#D4A24C] transition-colors">
            Home
          </Link>
          <Link href="/send-package" className="hover:text-[#D4A24C] transition-colors">
            Send
          </Link>
          <Link href="/receive-package" className="hover:text-[#D4A24C] transition-colors">
            Receive
          </Link>
          <Link href="/track" className="hover:text-[#D4A24C] transition-colors">
            Track
          </Link>
          <Link href="/pricing" className="hover:text-[#D4A24C] transition-colors">
            Quote
          </Link>
          <Link href="/contact" className="hover:text-[#D4A24C] transition-colors">
            Contact
          </Link>

          {user && (
            <>
              <Link href="/profile" className="hover:text-[#D4A24C] transition-colors flex items-center gap-1">
                Profile
              </Link>
              <Link href="/admin" className="hover:text-[#D4A24C] transition-colors flex items-center gap-1">
                Dashboard
              </Link>
              <div className="relative">
                <button onClick={openNotifs} className="relative p-2 hover:bg-gray-100 rounded-xl transition">
                  <span className="text-lg">🔔</span>
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-bold text-sm">Notifications</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-400">No notifications</p>
                      ) : (
                        notifications.map((n) => (
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
            </>
          )}

          {user ? (
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                setUser(null);
                setNotifCount(0);
                window.location.href = "/";
              }}
              className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-md"
            >
              Logout
            </button>
          ) : (
            <Link href="/login">
              <button className="bg-[#5A432C] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#4a3520] transition shadow-md">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
