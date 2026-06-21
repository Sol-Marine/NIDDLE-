"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../lib/cart-context";

export default function CartPage() {
  const { items, addItem, removeItem, clearCart, totalItems, totalPrice, storeCount } = useCart();
  const [checking, setChecking] = useState(false);

  const groupedByStore: Record<string, { storeName: string; items: typeof items }> = {};
  items.forEach((item) => {
    if (!groupedByStore[item.storeId]) {
      groupedByStore[item.storeId] = { storeName: item.storeName, items: [] };
    }
    groupedByStore[item.storeId].items.push(item);
  });

  const deliveryFeePerStore = 2000;
  const totalDelivery = Object.keys(groupedByStore).length * deliveryFeePerStore;
  const grandTotal = totalPrice + totalDelivery;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 text-sm mb-6">Browse stores and add items to get started.</p>
            <Link href="/stores" className="inline-block bg-[#5A432C] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#4a3520] transition">
              Browse Stores →
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-28 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-1">Cart</span>
              <h1 className="text-3xl font-bold text-[#5A432C]">{totalItems} items from {storeCount} {storeCount === 1 ? "store" : "stores"}</h1>
            </div>
            <button onClick={clearCart} className="text-sm text-red-500 font-semibold hover:underline">Clear all</button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedByStore).map(([storeId, group]) => (
                <div key={storeId} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏪</span>
                      <div>
                        <h2 className="font-bold text-gray-900">{group.storeName}</h2>
                        <p className="text-xs text-gray-500">{group.items.length} items</p>
                      </div>
                    </div>
                    <Link href={`/stores/${storeId}`} className="text-xs text-[#D4A24C] font-semibold hover:underline">+ Add more</Link>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.itemId} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                        <div className="w-12 h-12 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center text-xl shrink-0">
                          {item.image || "📦"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeItem(storeId, item.itemId)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold hover:bg-gray-200">-</button>
                          <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                          <button onClick={() => addItem({ storeId, storeName: group.storeName, itemId: item.itemId, name: item.name, price: item.price, image: item.image })} className="w-8 h-8 rounded-full bg-[#5A432C] text-white flex items-center justify-center text-sm font-bold hover:bg-[#4a3520]">+</button>
                        </div>
                        <span className="font-bold text-[#5A432C] text-sm w-20 text-right">₦{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">₦{group.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-28">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {Object.entries(groupedByStore).map(([storeId, group]) => (
                    <div key={storeId} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate">{group.storeName}</span>
                      <span className="font-semibold">₦{group.items.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold">₦{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery ({storeCount} {storeCount === 1 ? "store" : "stores"})</span>
                    <span className="font-semibold">₦{totalDelivery.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#D4A24C]">₦{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/stores" className="block mt-4 text-center text-sm text-[#D4A24C] font-semibold hover:underline">
                  + Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
