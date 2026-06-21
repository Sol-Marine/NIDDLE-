"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean; link?: string }[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D4A24C]/20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-18">
          <Link href="/">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#5A432C]">
              NIDDLE
            </h1>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#D4A24C] transition-colors">Home</Link>
            <Link href="/send-package" className="hover:text-[#D4A24C] transition-colors">Send</Link>
            <Link href="/receive-package" className="hover:text-[#D4A24C] transition-colors">Receive</Link>
            <Link href="/track" className="hover:text-[#D4A24C] transition-colors">Track</Link>
            <Link href="/pricing" className="hover:text-[#D4A24C] transition-colors">Quote</Link>
            <Link href="/contact" className="hover:text-[#D4A24C] transition-colors">Contact</Link>
            <Link href="/stores" className="hover:text-[#D4A24C] transition-colors">Stores</Link>
            <Link href="/rider/dashboard" className="hover:text-[#D4A24C] transition-colors">Ride</Link>

            {user && (
              <>
                {user.role === "store" ? (
                  <Link href="/store/dashboard" className="hover:text-[#D4A24C] transition-colors">Dashboard</Link>
                ) : user.role === "admin" || user.role === "staff" ? (
                  <Link href="/admin" className="hover:text-[#D4A24C] transition-colors">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/profile" className="hover:text-[#D4A24C] transition-colors">Profile</Link>
                    <Link href="/my-orders" className="hover:text-[#D4A24C] transition-colors">My Orders</Link>
                    <Link href="/wallet" className="hover:text-[#D4A24C] transition-colors">Wallet</Link>
                  </>
                )}
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`h-0.5 bg-[#5A432C] rounded transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 bg-[#5A432C] rounded transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-[#5A432C] rounded transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 pt-20 space-y-1 overflow-y-auto animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { href: "/", label: "Home" },
              { href: "/send-package", label: "Send Package" },
              { href: "/receive-package", label: "Receive Package" },
              { href: "/track", label: "Track Delivery" },
              { href: "/pricing", label: "Get a Quote" },
              { href: "/contact", label: "Contact Us" },
              { href: "/stores", label: "Browse Stores" },
              { href: "/rider/dashboard", label: "Rider Portal" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="border-t border-gray-100 my-3" />
                {user.role === "store" ? (
                  <Link href="/store/dashboard" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition">
                    Store Dashboard
                  </Link>
                ) : user.role === "admin" || user.role === "staff" ? (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition">
                      Profile
                    </Link>
                    <Link href="/my-orders" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition">
                      My Orders
                    </Link>
                    <Link href="/wallet" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-sm font-medium text-gray-700 hover:bg-[#FFF8F0] hover:text-[#D4A24C] rounded-xl transition">
                      Wallet
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="border-t border-gray-100 my-3" />

            {user ? (
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setUser(null);
                  setNotifCount(0);
                  setMobileOpen(false);
                  window.location.href = "/";
                }}
                className="w-full py-3 px-4 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition text-left"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-3 px-4 bg-[#5A432C] text-white rounded-xl text-sm font-semibold hover:bg-[#4a3520] transition text-left">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
