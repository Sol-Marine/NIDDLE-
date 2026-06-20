"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/app/lib/constants";

interface Stats {
  totalDeliveries: number;
  activeDeliveries: number;
  deliveredToday: number;
  pendingRequests: number;
}

interface Delivery {
  id: string;
  senderName: string;
  senderPhone?: string;
  recipientName: string;
  recipientPhone?: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  status: string;
  riderName?: string;
  createdAt: string;
}

interface ReceiveRequest {
  id: string;
  fullName: string;
  phone: string;
  packageType: string;
  deliveryAddress: string;
  status: string;
  negotiatedPrice?: number;
  createdAt: string;
}

interface Rider {
  id: number;
  name: string;
  rating: number;
  rides: number;
  badge: string;
  active: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "deliveries" | "requests" | "riders">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [requests, setRequests] = useState<ReceiveRequest[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.id || data.role !== "admin") { router.push("/login"); return; }
        setUser(data);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin")
      .then((r) => r.json())
      .then(setStats);
    fetch("/api/admin?type=deliveries")
      .then((r) => r.json())
      .then(setDeliveries);
    fetch("/api/admin?type=requests")
      .then((r) => r.json())
      .then(setRequests);
    fetch("/api/admin?type=riders")
      .then((r) => r.json())
      .then(setRiders)
      .finally(() => setLoading(false));
  }, [user]);

  const advanceStatus = async (id: string, currentStatus: string) => {
    const next = STATUS_OPTIONS[currentStatus];
    if (!next || next.length === 0) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next[0] }),
    });
    if (res.ok) {
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: next[0] } : d)),
      );
    }
  };

  const assignRider = async (id: string, riderName: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, riderName }),
    });
    if (res.ok) {
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, riderName } : d)),
      );
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-3xl font-extrabold text-[#5A432C]">{stats.totalDeliveries}</p>
              <p className="text-sm text-gray-500">Total Deliveries</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-3xl font-extrabold text-[#D4A24C]">{stats.activeDeliveries}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-3xl font-extrabold text-green-600">{stats.deliveredToday}</p>
              <p className="text-sm text-gray-500">Delivered Today</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-3xl font-extrabold text-orange-600">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
          {(["overview", "deliveries", "requests", "riders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "bg-[#5A432C] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t === "overview" && "📊 Overview"}
              {t === "deliveries" && "📦 Deliveries"}
              {t === "requests" && "📬 Requests"}
              {t === "riders" && "🚴 Riders"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-4">Recent Deliveries</h2>
            <div className="space-y-3">
              {deliveries.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-semibold">{d.id}</p>
                    <p className="text-sm text-gray-500">{d.packageType} · {d.pickupAddress} → {d.deliveryAddress}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600"}`}>
                    {d.status.replace(/-/g, " ")}
                  </span>
                </div>
              ))}
              {deliveries.length === 0 && <p className="text-gray-400 text-sm">No deliveries yet</p>}
            </div>
          </div>
        )}

        {tab === "deliveries" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Sender</th>
                    <th className="p-4 font-semibold">Recipient</th>
                    <th className="p-4 font-semibold">Route</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Rider</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-mono text-xs">{d.id}</td>
                      <td className="p-4">{d.senderName}</td>
                      <td className="p-4">{d.recipientName}</td>
                      <td className="p-4 text-xs">{d.pickupAddress} → {d.deliveryAddress}</td>
                      <td className="p-4">{d.packageType}</td>
                      <td className="p-4">
                        {d.riderName && d.riderName !== "Auto-assigned" ? (
                          d.riderName
                        ) : (
                          <select
                            onChange={(e) => assignRider(d.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg p-1"
                          >
                            <option value="">Assign rider</option>
                            {riders.filter((r) => r.active).map((r) => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[d.status] || "bg-gray-100"}`}>
                          {d.status.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        {STATUS_OPTIONS[d.status] ? (
                          <button
                            onClick={() => advanceStatus(d.id, d.status)}
                            className="bg-[#5A432C] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#4a3520] transition"
                          >
                            {STATUS_OPTIONS[d.status][0].replace(/-/g, " ")}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {deliveries.length === 0 && <p className="p-8 text-center text-gray-400">No deliveries yet</p>}
          </div>
        )}

        {tab === "requests" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Package</th>
                    <th className="p-4 font-semibold">Address</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-mono text-xs">{r.id}</td>
                      <td className="p-4">{r.fullName}</td>
                      <td className="p-4">{r.phone}</td>
                      <td className="p-4">{r.packageType || "—"}</td>
                      <td className="p-4 text-xs">{r.deliveryAddress || "—"}</td>
                      <td className="p-4">{r.negotiatedPrice ? `₦${r.negotiatedPrice.toLocaleString()}` : "—"}</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          r.status === "quoted" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {requests.length === 0 && <p className="p-8 text-center text-gray-400">No requests yet</p>}
          </div>
        )}

        {tab === "riders" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riders.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-3xl mb-4">
                  🚴
                </div>
                <h3 className="font-bold text-lg">{r.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">★ {r.rating}</span>
                  <span>{r.rides} rides</span>
                </div>
                <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${
                  r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {r.active ? "Active" : "Inactive"}
                  {r.badge !== "Top Rider" && r.badge !== "Fast" && r.badge !== "Eco" ? "" : ` · ${r.badge}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
