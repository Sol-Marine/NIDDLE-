"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { Store, StoreItem, StoreOrder, StoreMessage } from "../../lib/db";

const ORDER_STATUS: Record<string, { label: string; color: string; next: string[] }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", next: ["confirmed", "cancelled"] },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", next: ["preparing"] },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700", next: ["ready"] },
  ready: { label: "Ready for Pickup", color: "bg-purple-100 text-purple-700", next: ["picked-up"] },
  "picked-up": { label: "Picked Up", color: "bg-indigo-100 text-indigo-700", next: ["in-transit"] },
  "in-transit": { label: "In Transit", color: "bg-cyan-100 text-cyan-700", next: ["delivered"] },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", next: [] },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", next: [] },
};

export default function StoreDashboardPage() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "items" | "add-item" | "messages" | "analytics">("orders");
  const [messages, setMessages] = useState<StoreMessage[]>([]);

  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (!storeId) {
      fetch("/api/auth/me").then((r) => r.json()).then((d) => {
        if (d.role === "store") {
          fetch("/api/stores").then((r) => r.json()).then((stores) => {
            const myStore = Array.isArray(stores) ? stores.find((s: { ownerId: string }) => s.ownerId === d.id) : null;
            if (myStore) {
              window.location.href = `/store/dashboard?storeId=${myStore.id}`;
            } else {
              window.location.href = "/store/register";
            }
          });
        }
      });
      return;
    }
    Promise.all([
      fetch(`/api/stores/${storeId}`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}/items`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}/orders`, { headers: { "Content-Type": "application/json" } }).then((r) => r.json()),
      fetch(`/api/stores/${storeId}/messages`).then((r) => r.json()),
    ]).then(([s, i, o, m]) => {
      setStore(s);
      setItems(Array.isArray(i) ? i : []);
      setOrders(Array.isArray(o) ? o : []);
      setMessages(Array.isArray(m) ? m : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [storeId]);

  const addItem = async () => {
    if (!itemName || !itemPrice || !storeId) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName, description: itemDesc, price: Number(itemPrice), category: itemCategory, image: itemImage }),
      });
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setItemName(""); setItemDesc(""); setItemPrice(""); setItemCategory(""); setItemImage("");
      setTab("items");
    } catch { alert("Failed to add item"); }
    finally { setAddingItem(false); }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/store-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
    } catch { alert("Failed to update"); }
  };

  const toggleItemAvailability = async (item: StoreItem) => {
    const action = item.isAvailable ? "hide" : "show";
    if (!confirm(`Are you sure you want to ${action} "${item.name}"?`)) return;
    try {
      await fetch(`/api/stores/${storeId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, price: item.price }),
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch { /* ignore */ }
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

  if (!store) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-10 shadow-xl">
            <span className="text-6xl mb-4 block">🏪</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Store Found</h2>
            <p className="text-gray-500 text-sm mb-6">Register your store to start receiving orders.</p>
            <a href="/store/register" className="inline-block bg-[#D4A24C] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#c49540] transition">Register Store →</a>
          </div>
        </section>
      </main>
    );
  }

  const pendingOrders = orders.filter((o) => ["pending", "confirmed", "preparing", "ready"].includes(o.status));
  const activeOrders = orders.filter((o) => ["picked-up", "in-transit"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <span className="text-sm text-[#D4A24C] font-semibold">{store.category}</span>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-sm">
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl"><span className="font-bold">{pendingOrders.length}</span> Pending</div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl"><span className="font-bold">{activeOrders.length}</span> Active</div>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl"><span className="font-bold">{completedOrders.length}</span> Done</div>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl"><span className="font-bold">₦{totalRevenue.toLocaleString()}</span> Revenue</div>
                <div className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl"><span className="font-bold">{todayOrders.length}</span> Today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {(["orders", "items", "add-item", "messages", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? "bg-[#5A432C] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4A24C]"}`}>
                {t === "orders" ? "📦 Orders" : t === "items" ? "📋 Menu Items" : t === "add-item" ? "➕ Add Item" : t === "messages" ? "💬 Messages" : "📊 Analytics"}
              </button>
            ))}
          </div>

          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl">
                  <span className="text-5xl block mb-3">📭</span>
                  <p className="text-gray-500">No orders yet.</p>
                </div>
              ) : orders.map((order) => {
                const statusInfo = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone} · {order.id}</p>
                      </div>
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between"><span>{it.name} × {it.qty}</span><span className="font-semibold">₦{(it.price * it.qty).toLocaleString()}</span></div>
                      ))}
                      <div className="flex justify-between border-t border-gray-200 pt-1 mt-1 font-bold"><span>Total</span><span>₦{(order.totalPrice + order.deliveryFee).toLocaleString()}</span></div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">📍 {order.deliveryAddress}</p>
                    {statusInfo.next.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {statusInfo.next.map((ns) => (
                          <button key={ns} onClick={() => {
                            if (ns === "cancelled") {
                              if (!confirm("Are you sure you want to cancel this order?")) return;
                            }
                            updateOrderStatus(order.id, ns);
                          }} className={`px-4 py-1.5 text-white text-xs font-semibold rounded-lg transition ${ns === "cancelled" ? "bg-red-500 hover:bg-red-600" : "bg-[#5A432C] hover:bg-[#4a3520]"}`}>
                            {ns === "cancelled" ? "Cancel Order" : `Mark as ${ORDER_STATUS[ns]?.label || ns}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "items" && (
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl">
                  <span className="text-5xl block mb-3">📦</span>
                  <p className="text-gray-500 mb-3">No items yet.</p>
                  <button onClick={() => setTab("add-item")} className="text-[#D4A24C] font-semibold text-sm hover:underline">Add your first item →</button>
                </div>
              ) : items.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 ${!item.isAvailable ? "opacity-50" : ""}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center text-xl shrink-0">{item.image || "📦"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  <span className="font-bold text-[#D4A24C] text-sm">₦{item.price.toLocaleString()}</span>
                  <button onClick={() => toggleItemAvailability(item)} className={`text-xs font-semibold px-3 py-1 rounded-full ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isAvailable ? "Active" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "add-item" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg max-w-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Add Menu Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
                  <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Jollof Rice" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Describe the item..." rows={2} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₦) *</label>
                    <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="0" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <input type="text" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} placeholder="e.g. Main Course" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji Icon</label>
                  <input type="text" value={itemImage} onChange={(e) => setItemImage(e.target.value)} placeholder="🍔" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <button onClick={addItem} disabled={addingItem || !itemName || !itemPrice} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition disabled:opacity-50">
                  {addingItem ? "Adding..." : "Add Item →"}
                </button>
              </div>
            </div>
          )}

          {tab === "messages" && store && (
            <MessagesTab storeId={store.id} ownerId={store.ownerId} messages={messages} setMessages={setMessages} />
          )}

          {tab === "analytics" && (
            <AnalyticsTab orders={orders} items={items} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function MessagesTab({ storeId, ownerId, messages, setMessages }: { storeId: string; ownerId: string; messages: StoreMessage[]; setMessages: React.Dispatch<React.SetStateAction<StoreMessage[]>> }) {
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const conversations = new Map<string, StoreMessage[]>();
  messages.forEach((m) => {
    if (m.senderId !== ownerId) {
      if (!conversations.has(m.senderId)) conversations.set(m.senderId, []);
      conversations.get(m.senderId)!.push(m);
    }
  });

  const sendReply = async (senderId: string) => {
    const text = replyInputs[senderId]?.trim();
    if (!text || sending) return;
    setSending(senderId);
    try {
      const res = await fetch(`/api/stores/${storeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setReplyInputs((prev) => ({ ...prev, [senderId]: "" }));
      }
    } catch { /* ignore */ }
    finally { setSending(null); }
  };

  if (conversations.size === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl">
        <span className="text-5xl block mb-3">💬</span>
        <p className="text-gray-500">No messages yet. Customers will chat with you from your store page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(conversations.entries()).map(([senderId, msgs]) => {
        const lastMsg = msgs[msgs.length - 1];
        const unread = msgs.filter((m) => !m.read && m.senderId !== ownerId).length;
        return (
          <div key={senderId} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#D4A24C]/10 flex items-center justify-center text-lg">👤</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{lastMsg.senderName}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-3 bg-gray-50 rounded-xl p-3">
              {msgs.map((m) => {
                const isMe = m.senderId === ownerId;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-[#5A432C] text-white" : "bg-white text-gray-900 border border-gray-100"}`}>
                      {m.message}
                      <p className={`text-[10px] mt-1 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={replyInputs[senderId] || ""}
                onChange={(e) => setReplyInputs((prev) => ({ ...prev, [senderId]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && sendReply(senderId)}
                placeholder="Type a reply..."
                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:border-[#D4A24C] outline-none"
              />
              <button
                onClick={() => sendReply(senderId)}
                disabled={sending === senderId || !replyInputs[senderId]?.trim()}
                className="px-5 py-2.5 bg-[#D4A24C] text-white text-sm font-semibold rounded-xl hover:bg-[#c49540] transition disabled:opacity-50"
              >
                {sending === senderId ? "..." : "Send"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsTab({ orders, items }: { orders: StoreOrder[]; items: StoreItem[] }) {
  const delivered = orders.filter((o) => o.status === "delivered");
  const cancelled = orders.filter((o) => o.status === "cancelled");
  const totalRevenue = delivered.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgOrderValue = delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0;
  const cancellationRate = orders.length > 0 ? Math.round((cancelled.length / orders.length) * 100) : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const dailyOrders = last7Days.map((day) => ({
    day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
    count: orders.filter((o) => new Date(o.createdAt).toDateString() === day).length,
    revenue: delivered
      .filter((o) => new Date(o.createdAt).toDateString() === day)
      .reduce((sum, o) => sum + o.totalPrice, 0),
  }));

  const maxDailyOrders = Math.max(...dailyOrders.map((d) => d.count), 1);

  const hourBuckets = Array.from({ length: 24 }, (_, i) => i);
  const ordersByHour = hourBuckets.map((h) => ({
    hour: `${h}:00`,
    count: orders.filter((o) => new Date(o.createdAt).getHours() === h).length,
  }));
  const maxHourOrders = Math.max(...ordersByHour.map((h) => h.count), 1);

  const itemSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  delivered.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemSales[item.name]) itemSales[item.name] = { name: item.name, qty: 0, revenue: 0 };
      itemSales[item.name].qty += item.qty;
      itemSales[item.name].revenue += item.price * item.qty;
    });
  });
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <p className="text-3xl font-bold text-[#5A432C]">{orders.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <p className="text-3xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <p className="text-3xl font-bold text-[#D4A24C]">₦{avgOrderValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Avg Order Value</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md text-center">
          <p className={`text-3xl font-bold ${cancellationRate > 10 ? "text-red-600" : "text-green-600"}`}>{cancellationRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Cancellation Rate</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-bold text-gray-900 mb-4">Last 7 Days</h3>
        <div className="flex items-end gap-2 h-40">
          {dailyOrders.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500">{d.count}</span>
              <div
                className="w-full bg-[#D4A24C] rounded-t-lg transition-all"
                style={{ height: `${(d.count / maxDailyOrders) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }}
              />
              <span className="text-[10px] text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-bold text-gray-900 mb-4">Peak Hours</h3>
        <div className="flex items-end gap-1 h-32">
          {ordersByHour.filter((_, i) => i >= 8 && i <= 21).map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-[#C2533D] rounded-t-lg transition-all"
                style={{ height: `${(h.count / maxHourOrders) * 100}%`, minHeight: h.count > 0 ? "4px" : "1px" }}
              />
              <span className="text-[8px] text-gray-400">{h.hour.replace(":00", "")}</span>
            </div>
          ))}
        </div>
      </div>

      {topItems.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#D4A24C]/20 flex items-center justify-center text-sm font-bold text-[#5A432C]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.qty} sold</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#D4A24C]">₦{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-bold text-gray-900 mb-4">Menu Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-500">Total Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{items.filter((i) => i.isAvailable).length}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{items.filter((i) => !i.isAvailable).length}</p>
            <p className="text-xs text-gray-500">Hidden</p>
          </div>
        </div>
      </div>
    </div>
  );
}
