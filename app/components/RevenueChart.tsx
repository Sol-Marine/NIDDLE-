"use client";

import { useState, useEffect } from "react";

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopStore {
  name: string;
  revenue: number;
  orders: number;
}

interface Stats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topStores: TopStore[];
  dailyRevenue: RevenueData[];
}

export default function RevenueChart() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin?type=stats&period=${period}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-2xl font-extrabold text-green-600">₦{stats.todayRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">This Week</p>
          <p className="text-2xl font-extrabold text-[#D4A24C]">₦{stats.weekRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-2xl font-extrabold text-[#5A432C]">₦{stats.monthRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Avg Order</p>
          <p className="text-2xl font-extrabold text-gray-900">₦{stats.avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900">Revenue Over Time</h3>
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? "bg-[#5A432C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p === "week" ? "7 Days" : p === "month" ? "30 Days" : "12 Months"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-1 h-48">
          {stats.dailyRevenue.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex justify-center">
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  ₦{d.revenue.toLocaleString()} · {d.orders} orders
                </div>
              </div>
              <div
                className="w-full bg-gradient-to-t from-[#D4A24C] to-[#c49540] rounded-t-lg transition-all hover:from-[#c49540] hover:to-[#D4A24C]"
                style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
              />
              <span className="text-[10px] text-gray-400 truncate w-full text-center">
                {new Date(d.date).toLocaleDateString("en-NG", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Top Performing Stores</h3>
        {stats.topStores.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No store data yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.topStores.map((store, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <span className="text-lg font-bold text-gray-400 w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                  <p className="text-xs text-gray-500">{store.orders} orders</p>
                </div>
                <span className="text-sm font-bold text-[#5A432C]">₦{store.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
