"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface RiderSession {
  id: string;
  rider_id: number;
  start_time: string;
  end_time: string | null;
  status: string;
  city: string;
  created_at: string;
}

interface RiderScore {
  rider_id: number;
  acceptance_rate: number;
  cancellation_rate: number;
  avg_delivery_time: number;
  total_deliveries: number;
  rating: number;
  batch: number;
}

interface RiderOrder {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: { name: string; price: number; qty: number }[];
  total_price: number;
  delivery_fee: number;
  rider_status: string;
  status: string;
  created_at: string;
  store?: { name: string; address: string; phone: string };
}

const RIDERS = [
  { id: 1, name: "Chidi O." },
  { id: 2, name: "Amara K." },
  { id: 3, name: "Femi A." },
  { id: 4, name: "Zainab B." },
];

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  "heading-to-store": "bg-yellow-100 text-yellow-700",
  "at-store": "bg-orange-100 text-orange-700",
  "picked-up": "bg-purple-100 text-purple-700",
  "in-transit": "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  assigned: "New Order",
  accepted: "Accepted",
  "heading-to-store": "Heading to Store",
  "at-store": "At Store",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  delivered: "Delivered",
};

export default function RiderDashboard() {
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [session, setSession] = useState<RiderSession | null>(null);
  const [score, setScore] = useState<RiderScore | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<RiderOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<RiderOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "active" | "history" | "score" | "sessions">("orders");

  const loadOrders = useCallback(async () => {
    if (!selectedRider) return;
    try {
      const [assigned, active, completed] = await Promise.all([
        fetch(`/api/rider/orders?riderId=${selectedRider}&status=assigned`).then((r) => r.json()),
        fetch(`/api/rider/orders?riderId=${selectedRider}&status=accepted`).then((r) => r.json()),
        fetch(`/api/rider/orders?riderId=${selectedRider}&status=delivered`).then((r) => r.json()),
      ]);
      setAssignedOrders(Array.isArray(assigned) ? assigned : []);
      setActiveOrders(Array.isArray(active) ? active : []);
      setCompletedOrders(Array.isArray(completed) ? completed : []);
    } catch {
      // ignore
    }
  }, [selectedRider]);

  useEffect(() => {
    if (!selectedRider) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/rider/sessions?riderId=${selectedRider}`).then((r) => r.json()),
      fetch(`/api/rider/score?riderId=${selectedRider}`).then((r) => r.json()),
    ]).then(([sessions, scoreData]) => {
      const activeSession = Array.isArray(sessions)
        ? sessions.find((s: RiderSession) => s.status === "active" || s.status === "booked")
        : null;
      setSession(activeSession || null);
      setScore(scoreData);
      setLoading(false);
    });
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [selectedRider, loadOrders]);

  const bookSession = async (startTime: string) => {
    if (!selectedRider) return;
    const res = await fetch("/api/rider/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId: selectedRider, startTime, city: "Lagos" }),
    });
    const data = await res.json();
    if (data.id) setSession(data);
  };

  const checkIn = async () => {
    if (!session || !selectedRider) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch("/api/rider/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            status: "active",
            riderId: selectedRider,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        setSession({ ...session, status: "active" });
      },
      () => {
        alert("Location access needed to go online");
      }
    );
  };

  const checkOut = async () => {
    if (!session || !selectedRider) return;
    await fetch("/api/rider/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id, status: "completed", riderId: selectedRider }),
    });
    setSession(null);
  };

  const acceptOrder = async (orderId: string) => {
    if (!selectedRider) return;
    await fetch(`/api/rider/orders/${orderId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId: selectedRider, riderName: RIDERS.find((r) => r.id === selectedRider)?.name }),
    });
    loadOrders();
  };

  const rejectOrder = async (orderId: string) => {
    if (!selectedRider) return;
    await fetch(`/api/rider/orders/${orderId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId: selectedRider }),
    });
    loadOrders();
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!selectedRider) return;
    await fetch(`/api/rider/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, riderId: selectedRider }),
    });
    loadOrders();
  };

  const nextStatus: Record<string, string> = {
    accepted: "heading-to-store",
    "heading-to-store": "at-store",
    "at-store": "picked-up",
    "picked-up": "in-transit",
    "in-transit": "delivered",
  };

  if (!selectedRider) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Rider Portal</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#5A432C] mb-4">Select Your Profile</h1>
            <p className="text-gray-500 text-sm mb-8">Choose your rider profile to access the dashboard.</p>
            <div className="grid grid-cols-2 gap-4">
              {RIDERS.map((rider) => (
                <button
                  key={rider.id}
                  onClick={() => setSelectedRider(rider.id)}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-[#D4A24C] hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-2xl mx-auto mb-3">
                    🚴
                  </div>
                  <p className="font-bold text-gray-900">{rider.name}</p>
                  <p className="text-xs text-gray-500">Tap to start</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-xl">🚴</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{RIDERS.find((r) => r.id === selectedRider)?.name}</h1>
                  <p className="text-sm text-gray-500">Batch {score?.batch ?? 12} • {score?.total_deliveries ?? 0} deliveries</p>
                </div>
              </div>
              <button onClick={() => setSelectedRider(null)} className="text-sm text-gray-400 hover:text-gray-600">Switch</button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-[#D4A24C]/10 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#5A432C]">{assignedOrders.length}</p>
                <p className="text-xs text-gray-500">New</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{activeOrders.length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-700">{score?.acceptance_rate ?? 100}%</p>
                <p className="text-xs text-gray-500">Accept</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-700">₦{score ? (score.total_deliveries * 1400).toLocaleString() : "0"}</p>
                <p className="text-xs text-gray-500">Earnings</p>
              </div>
            </div>

            {session ? (
              <div className={`rounded-xl p-4 ${session.status === "active" ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold text-sm ${session.status === "active" ? "text-green-700" : "text-yellow-700"}`}>
                      {session.status === "active" ? "You are ONLINE" : `Session booked for ${new Date(session.start_time).toLocaleString()}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{session.city}</p>
                  </div>
                  <button
                    onClick={session.status === "active" ? checkOut : checkIn}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      session.status === "active"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {session.status === "active" ? "Go Offline" : "Check In"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Book a Session</p>
                <div className="flex gap-2">
                  {["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM"].map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        const now = new Date();
                        now.setHours(parseInt(time), 0, 0, 0);
                        bookSession(now.toISOString());
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:border-[#D4A24C] hover:text-[#5A432C] transition"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: "orders", label: `New (${assignedOrders.length})` },
              { key: "active", label: `Active (${activeOrders.length})` },
              { key: "history", label: "History" },
              { key: "score", label: "Score" },
              { key: "sessions", label: "Sessions" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  tab === t.key ? "bg-[#5A432C] text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-md">
                  <span className="text-5xl mb-3 block">📭</span>
                  <p className="text-gray-500">No new orders. Stay online to receive requests.</p>
                </div>
              ) : (
                assignedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.rider_status] || "bg-gray-100"}`}>
                          {STATUS_LABELS[order.rider_status] || order.rider_status}
                        </span>
                        <span className="text-xs text-gray-400">₦{order.delivery_fee.toLocaleString()} fee</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="mb-3">
                      <p className="font-bold text-gray-900 text-sm">{order.store?.name ?? "Store"}</p>
                      <p className="text-xs text-gray-500">📍 {order.store?.address}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Deliver to:</p>
                      <p className="text-sm font-semibold text-gray-900">{order.customer_name} — {order.delivery_address}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => rejectOrder(order.id)}
                        className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex-1 py-3 rounded-xl bg-[#5A432C] text-white font-semibold text-sm hover:bg-[#4a3520] transition"
                      >
                        Accept →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "active" && (
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-md">
                  <span className="text-5xl mb-3 block">🚴</span>
                  <p className="text-gray-500">No active deliveries.</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.rider_status] || "bg-gray-100"}`}>
                        {STATUS_LABELS[order.rider_status] || order.rider_status}
                      </span>
                      <span className="text-xs text-gray-400">{order.customer_phone}</span>
                    </div>
                    <div className="mb-3">
                      <p className="font-bold text-gray-900 text-sm">{order.store?.name}</p>
                      <p className="text-xs text-gray-500">📍 {order.store?.address}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Deliver to:</p>
                      <p className="text-sm font-semibold text-gray-900">{order.delivery_address}</p>
                    </div>
                    <div className="mb-3 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Items:</p>
                      {(order.items as { name: string; qty: number }[]).map((item, i) => (
                        <p key={i} className="text-sm text-gray-700">{item.name} x{item.qty}</p>
                      ))}
                    </div>
                    {nextStatus[order.rider_status] && (
                      <button
                        onClick={() => updateStatus(order.id, nextStatus[order.rider_status])}
                        className="w-full py-3 rounded-xl bg-[#D4A24C] text-white font-semibold text-sm hover:bg-[#c49540] transition"
                      >
                        {order.rider_status === "accepted" && "📍 Heading to Store"}
                        {order.rider_status === "heading-to-store" && "🏪 Arrived at Store"}
                        {order.rider_status === "at-store" && "📦 Picked Up"}
                        {order.rider_status === "picked-up" && "🚚 Start Delivery"}
                        {order.rider_status === "in-transit" && "✅ Delivered"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              {completedOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl shadow-md">
                  <span className="text-5xl mb-3 block">📋</span>
                  <p className="text-gray-500">No completed deliveries yet.</p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{order.store?.name}</p>
                        <p className="text-xs text-gray-500">{order.customer_name} — {order.delivery_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+₦{order.delivery_fee.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "score" && score && (
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-4">Performance Score</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#D4A24C]/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#5A432C]">{score.batch}</p>
                  <p className="text-xs text-gray-500">Batch (1=best)</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">⭐ {score.rating}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">{score.acceptance_rate}%</p>
                  <p className="text-xs text-gray-500">Acceptance</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-700">{score.total_deliveries}</p>
                  <p className="text-xs text-gray-500">Deliveries</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Your batch determines when you can book sessions. Batch 1 gets first access, Batch 12 gets last.</p>
                <p className="mt-2">Improve your batch by maintaining high acceptance rate, low cancellations, and fast delivery times.</p>
              </div>
              <a href="/rider/earnings" className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all">
                💰 View Earnings
              </a>
            </div>
          )}

          {tab === "sessions" && (
            <SessionHistory riderId={selectedRider} />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function SessionHistory({ riderId }: { riderId: number }) {
  const [sessions, setSessions] = useState<RiderSession[]>([]);

  useEffect(() => {
    fetch(`/api/rider/sessions?riderId=${riderId}`)
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
  }, [riderId]);

  return (
    <div className="space-y-3">
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-md">
          <span className="text-5xl mb-3 block">📅</span>
          <p className="text-gray-500">No sessions yet. Book one to start receiving orders.</p>
        </div>
      ) : (
        sessions.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{new Date(s.start_time).toLocaleDateString()} • {s.city}</p>
              <p className="text-xs text-gray-500">{new Date(s.start_time).toLocaleTimeString()} — {s.end_time ? new Date(s.end_time).toLocaleTimeString() : " ongoing"}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              s.status === "active" ? "bg-green-100 text-green-700" :
              s.status === "completed" ? "bg-blue-100 text-blue-700" :
              s.status === "booked" ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {s.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
