"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface EarningsSummary {
  totalEarnings: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalDeliveries: number;
  avgPerDelivery: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function RiderEarningsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [rider, setRider] = useState<{ id: number; name: string } | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "today" | "week" | "month">("all");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.id || data.role !== "rider") {
          router.push("/login");
          return;
        }
        setUser(data);
        fetch("/api/riders")
          .then((r) => r.json())
          .then((riders) => {
            const myRider = riders.find((r: { name: string }) => r.name === data.name);
            if (myRider) setRider(myRider);
          });
      })
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!rider) return;
    setLoading(true);
    fetch(`/api/wallet?userId=${rider.id}`)
      .then((r) => r.json())
      .then((data) => {
        const txs = data.transactions || [];
        const total = txs.filter((t: Transaction) => t.type === "earnings").reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const today = new Date().toDateString();
        const todayTotal = txs.filter((t: Transaction) => t.type === "earnings" && new Date(t.created_at).toDateString() === today).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekTotal = txs.filter((t: Transaction) => t.type === "earnings" && new Date(t.created_at).getTime() > weekAgo).reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthTotal = txs.filter((t: Transaction) => t.type === "earnings" && new Date(t.created_at) >= monthStart).reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        setSummary({
          totalEarnings: total,
          todayEarnings: todayTotal,
          thisWeekEarnings: weekTotal,
          thisMonthEarnings: monthTotal,
          totalDeliveries: txs.filter((t: Transaction) => t.type === "earnings").length,
          avgPerDelivery: txs.filter((t: Transaction) => t.type === "earnings").length > 0 ? total / txs.filter((t: Transaction) => t.type === "earnings").length : 0,
        });
        setTransactions(txs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rider]);

  const filteredTx = transactions.filter((t) => {
    if (period === "today") return new Date(t.created_at).toDateString() === new Date().toDateString();
    if (period === "week") return Date.now() - new Date(t.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
    if (period === "month") {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return new Date(t.created_at) >= monthStart;
    }
    return true;
  });

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

      <section className="pt-28 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#5A432C]">My Earnings</h1>
          <p className="text-gray-600 mt-2">Track your earnings and payment history</p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-2xl font-extrabold text-green-600">₦{summary?.todayEarnings.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-2xl font-extrabold text-[#D4A24C]">₦{summary?.thisWeekEarnings.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-2xl font-extrabold text-[#5A432C]">₦{summary?.thisMonthEarnings.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">All Time</p>
              <p className="text-2xl font-extrabold text-gray-900">₦{summary?.totalEarnings.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalDeliveries || 0}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">Avg per Delivery</p>
              <p className="text-2xl font-bold text-gray-900">₦{Math.round(summary?.avgPerDelivery || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Transaction History</h3>
              <div className="flex gap-2">
                {(["all", "today", "week", "month"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      period === p ? "bg-[#5A432C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p === "all" ? "All" : p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>
            </div>

            {filteredTx.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredTx.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.description || "Earnings"}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">+₦{tx.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
