"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface StoreOrder {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryFee?: number;
  status: string;
  createdAt: string;
  specialInstructions?: string;
  preferredTime?: string;
}

interface Store {
  id: string;
  name: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-purple-100 text-purple-700 border-purple-200",
  "picked-up": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "in-transit": "bg-cyan-100 text-cyan-700 border-cyan-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email?: string; phone?: string; role?: string } | null>(null);
  const [orders, setOrders] = useState<(StoreOrder & { storeName: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.id) {
          router.push("/login");
          return;
        }
        setUser(data);
        fetchAllOrders(data);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const fetchAllOrders = async (currentUser: { id: string; name: string; email?: string; phone?: string }) => {
    try {
      const storesRes = await fetch("/api/stores");
      const stores: Store[] = await storesRes.json();

      const allOrders: (StoreOrder & { storeName: string })[] = [];

      await Promise.all(
        stores.map(async (store) => {
          try {
            const ordersRes = await fetch(`/api/stores/${store.id}/orders`);
            const storeOrders: StoreOrder[] = await ordersRes.json();
            if (Array.isArray(storeOrders)) {
              storeOrders.forEach((order) => {
                const matches =
                  (currentUser.phone && order.customerPhone === currentUser.phone) ||
                  (currentUser.email && order.customerEmail === currentUser.email) ||
                  (!currentUser.phone && !currentUser.email && order.customerName === currentUser.name);
                if (matches) {
                  allOrders.push({ ...order, storeName: store.name });
                }
              });
            }
          } catch {
            // skip failed stores
          }
        })
      );

      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF8F0]">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-8 h-8 border-4 border-[#D4A24C] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0]">
      <Navbar />

      <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#5A432C]">My Orders</h1>
          <p className="text-gray-500 mt-2 text-sm">Track and review all your store orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-[#5A432C] mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
              You haven&apos;t placed any store orders. Browse stores and place your first order!
            </p>
            <Link
              href="/stores"
              className="inline-block bg-[#5A432C] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#4a3520] transition shadow-md"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600 border-gray-200";
              const grandTotal = order.totalPrice + (order.deliveryFee || 0);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-5 md:px-8 py-4 md:py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center text-lg shrink-0">
                        🏪
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#5A432C] truncate">{order.storeName}</p>
                        <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyle}`}>
                        {order.status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 md:px-8 py-4">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {item.name} <span className="text-gray-400">× {item.qty}</span>
                          </span>
                          <span className="font-semibold text-[#5A432C]">₦{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery address */}
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 mb-4 bg-gray-50 rounded-xl p-3">
                        <span className="mt-0.5 shrink-0">📍</span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-400">
                        {order.preferredTime && <span>Preferred time: {order.preferredTime}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Total</span>
                          <span className="text-lg font-bold text-[#D4A24C]">₦{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
