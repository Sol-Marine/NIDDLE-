"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { Store } from "../lib/db";

const STORE_CATEGORIES = ["All", "Food & Drinks", "Groceries", "Pharmacy", "Electronics", "Fashion", "Gifts", "Other"];

const CATEGORY_ICONS: Record<string, string> = {
  "Food & Drinks": "🍔",
  Groceries: "🛒",
  Pharmacy: "💊",
  Electronics: "📱",
  Fashion: "👕",
  Gifts: "🎁",
  Other: "🏪",
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => { setStores(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = stores.filter((s) => {
    const matchCategory = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Marketplace</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A432C] mb-4">Browse Stores</h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Shop from local stores and get same-day delivery across Lagos.
          </p>
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores..."
              className="w-full border-2 border-gray-200 rounded-2xl py-3 px-5 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all bg-white"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </section>

      <section className="pb-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-[#5A432C] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4A24C]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-3 text-sm">Loading stores...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🏪</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-500 text-sm">
                {stores.length === 0 ? "No stores have joined yet. Be the first!" : "Try a different search or category."}
              </p>
              {stores.length === 0 && (
                <Link href="/store/register" className="inline-block mt-4 bg-[#D4A24C] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#c49540] transition">
                  Register Your Store
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((store) => (
                <Link key={store.id} href={`/stores/${store.id}`}>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#D4A24C]/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className="h-40 bg-gradient-to-br from-[#D4A24C]/20 to-[#C2533D]/20 flex items-center justify-center">
                      <span className="text-6xl">{CATEGORY_ICONS[store.category] || "🏪"}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{store.name}</h3>
                          <span className="text-xs text-[#D4A24C] font-semibold bg-[#D4A24C]/10 px-2 py-0.5 rounded-full">{store.category}</span>
                        </div>
                        {store.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                            <span className="text-[#D4A24C]">★</span> {store.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{store.description || "No description"}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1 truncate">📍 {store.address}</span>
                        <span>{store.totalOrders} orders</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-[#5A432C] to-[#4a3520]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Own a store?</h2>
          <p className="text-white/70 mb-8">Join NIDDLE and reach thousands of customers across Lagos.</p>
          <Link href="/store/register" className="inline-block bg-[#D4A24C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
            Register Your Store →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
