"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reference: string;
  description: string;
  status: string;
  created_at: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topping, setTopping] = useState(false);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => {
        if (data.wallet) setWallet(data.wallet);
        if (data.transactions) setTransactions(data.transactions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount <= 0) return;
    setTopping(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, type: "credit", description: "Wallet top-up" }),
      });
      if (res.ok) {
        const tx = await res.json();
        setWallet((prev) => prev ? { ...prev, balance: prev.balance + amount } : null);
        setTransactions((prev) => [tx, ...prev]);
        setTopUpAmount("");
      }
    } catch {
      // ignore
    } finally {
      setTopping(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Wallet</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#5A432C] mb-6">Your Balance</h1>

          <div className="bg-gradient-to-br from-[#5A432C] to-[#4a3520] rounded-3xl p-8 text-white shadow-xl mb-8">
            <p className="text-white/60 text-sm mb-1">Available Balance</p>
            <p className="text-4xl md:text-5xl font-extrabold">₦{(wallet?.balance ?? 0).toLocaleString()}</p>
            <p className="text-white/40 text-sm mt-2">{wallet?.currency || "NGN"}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Top Up Wallet</h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Amount"
                  min="100"
                  className="w-full border-2 border-gray-100 rounded-xl p-4 pl-10 text-sm focus:border-[#D4A24C] outline-none"
                />
              </div>
              <button
                onClick={topUp}
                disabled={topping || !topUpAmount}
                className="bg-[#D4A24C] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#c49540] transition disabled:opacity-50"
              >
                {topping ? "Processing..." : "Top Up"}
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(String(amt))}
                  className="flex-1 py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 hover:bg-[#D4A24C]/10 hover:text-[#5A432C] transition"
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-bold text-gray-900 mb-4">Transaction History</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">💳</span>
                <p className="text-gray-500 text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        tx.type === "credit" || tx.type === "topup"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}>
                        {tx.type === "credit" || tx.type === "topup" ? "↓" : "↑"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-400">{tx.reference} • {new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === "credit" || tx.type === "topup" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "credit" || tx.type === "topup" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                    </span>
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
