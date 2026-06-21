"use client";

import { useState, useEffect, use } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ChatBox from "../../components/ChatBox";
import { useCart } from "../../lib/cart-context";
import type { Store, StoreItem, StoreOrder, StoreReview } from "../../lib/db";

interface PricingInfo {
  distance: number;
  baseFee: number;
  distanceFee: number;
  surgeMultiplier: number;
  surgeFee: number;
  total: number;
  estimatedMinutes: number;
  demandLevel: string;
}

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem, removeItem, clearStore, getStoreItems } = useCart();
  const storeCartItems = getStoreItems(id);
  const [store, setStore] = useState<Store | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<StoreOrder | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/stores/${id}`).then((r) => r.json()),
      fetch(`/api/stores/${id}/items`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/stores/${id}/reviews`).then((r) => r.json()),
    ]).then(([s, i, u, rev]) => {
      setStore(s);
      setItems(Array.isArray(i) ? i : []);
      if (u.id) setUser(u);
      if (rev.reviews) setReviews(rev.reviews);
      if (rev.stats) setReviewStats(rev.stats);
      if (u.id && rev.reviews) {
        setHasReviewed(rev.reviews.some((r: StoreReview) => r.userId === u.id));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const fetchPricing = async (deliveryAddr: string) => {
    if (!store || !deliveryAddr) return;
    setPricingLoading(true);
    try {
      const res = await fetch("/api/pricing/calculate");
      const data = await res.json();
      setPricing({
        distance: 5,
        baseFee: data.baseFee,
        distanceFee: 0,
        surgeMultiplier: data.surgeMultiplier,
        surgeFee: 0,
        total: data.baseFee,
        estimatedMinutes: 30,
        demandLevel: data.demandLevel,
      });
    } catch {
      setPricing({ distance: 5, baseFee: 2000, distanceFee: 0, surgeMultiplier: 1, surgeFee: 0, total: 2000, estimatedMinutes: 30, demandLevel: "normal" });
    } finally {
      setPricingLoading(false);
    }
  };

  useEffect(() => {
    if (address && store) fetchPricing(address);
  }, [address, store]);

  const addToCart = (item: StoreItem) => {
    addItem({
      storeId: id,
      storeName: store?.name || "Store",
      itemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const removeFromCart = (itemId: string) => {
    removeItem(id, itemId);
  };

  const cartTotal = storeCartItems.reduce((sum, c) => sum + c.price * c.qty, 0);
  const deliveryFee = pricing?.total ?? 2000;
  const grandTotal = cartTotal + deliveryFee;

  const placeOrder = async () => {
    if (!name || !phone || !address || !storeCartItems.length) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: storeCartItems.map((c) => ({
            storeId: id,
            storeName: store?.name,
            name: c.name,
            price: c.price,
            qty: c.qty,
          })),
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          deliveryAddress: address,
          specialInstructions: instructions,
          preferredTime,
          paymentMethod: "card",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.orders?.[0] || { id: data.orders?.[0]?.orderId, totalPrice: cartTotal, deliveryFee });
      } else {
        alert(data.error || "Failed to place order");
      }
      clearStore(id);
      setShowCheckout(false);
    } catch {
      alert("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async () => {
    if (!user || hasReviewed) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/stores/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data, ...prev]);
        setReviewStats((prev) => ({
          average: prev.count === 0 ? reviewRating : Math.round(((prev.average * prev.count + reviewRating) / (prev.count + 1)) * 10) / 10,
          count: prev.count + 1,
        }));
        setHasReviewed(true);
        setReviewSuccess(true);
      }
    } catch {
      // ignore
    } finally {
      setSubmittingReview(false);
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

  if (!store) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="pt-32 text-center">
          <span className="text-6xl mb-4 block">🏪</span>
          <h2 className="text-2xl font-bold text-gray-900">Store not found</h2>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-10 shadow-xl">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
            <p className="text-gray-500 text-sm mb-6">Your order from <strong>{store?.name}</strong> has been received.</p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono font-bold text-[#5A432C]">{orderSuccess.id || "Processing"}</p>
              <p className="text-sm text-gray-500 mt-2">Estimated Delivery</p>
              <p className="font-bold text-lg">{pricing?.estimatedMinutes ?? 30} minutes</p>
              {pricing && pricing.surgeMultiplier > 1 && (
                <p className="text-xs text-orange-600 mt-1">🔥 Surge pricing active ({pricing.surgeMultiplier}x)</p>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-6">A rider will be assigned shortly. You&apos;ll be notified when your order is picked up.</p>
            <button onClick={() => setOrderSuccess(null)} className="bg-[#5A432C] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#4a3520] transition">
              Continue Shopping
            </button>
          </div>
        </section>
      </main>
    );
  }

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
            <div className="h-48 bg-gradient-to-br from-[#D4A24C]/20 to-[#C2533D]/20 flex items-center justify-center">
              <span className="text-8xl">🏪</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{store.name}</h1>
                  <span className="text-sm text-[#D4A24C] font-semibold bg-[#D4A24C]/10 px-3 py-1 rounded-full">{store.category}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-500">
                  {reviewStats.count > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="text-[#D4A24C]">★</span> {reviewStats.average} ({reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"})
                    </span>
                  )}
                  <span>📍 {store.address}</span>
                  <span>🕐 {store.openingHours}</span>
                </div>
              </div>
              {store.description && <p className="text-gray-500 mt-3">{store.description}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {categories.length > 0 ? categories.map((cat) => (
              <div key={cat} className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.filter((i) => i.category === cat && i.isAvailable).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center text-2xl shrink-0">
                        {item.image || "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        <p className="text-[#D4A24C] font-bold text-sm mt-1">₦{item.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => addToCart(item)} className="w-9 h-9 rounded-full bg-[#5A432C] text-white flex items-center justify-center text-lg font-bold hover:bg-[#4a3520] transition shrink-0">
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-16">
                <span className="text-5xl mb-3 block">📦</span>
                <p className="text-gray-500">No items yet. The store is setting up.</p>
              </div>
            )}
          </div>

          {storeCartItems.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-28">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Order ({storeCartItems.length} items)</h2>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {storeCartItems.map((c) => (
                    <div key={c.itemId} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">₦{c.price.toLocaleString()} × {c.qty}</p>
                      </div>
                      <span className="text-sm font-bold text-[#5A432C]">₦{(c.price * c.qty).toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => removeFromCart(c.itemId)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold hover:bg-gray-200">-</button>
                        <span className="text-sm font-semibold w-5 text-center">{c.qty}</span>
                        <button onClick={() => addItem({ storeId: id, storeName: store?.name || "", itemId: c.itemId, name: c.name, price: c.price })} className="w-7 h-7 rounded-full bg-[#5A432C] text-white flex items-center justify-center text-sm font-bold hover:bg-[#4a3520]">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₦{cartTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Delivery</span>
                    <div className="text-right">
                      {pricingLoading ? (
                        <span className="text-xs text-gray-400">Calculating...</span>
                      ) : (
                        <>
                          <span className="font-semibold">₦{deliveryFee.toLocaleString()}</span>
                          {pricing && pricing.surgeMultiplier > 1 && (
                            <span className="text-xs text-orange-600 block">{pricing.surgeMultiplier}x surge</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {pricing && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>📍 {pricing.distance} km • ~{pricing.estimatedMinutes} min</span>
                      <span className={pricing.demandLevel !== "normal" ? "text-orange-500 font-semibold" : ""}>
                        {pricing.demandLevel === "normal" ? "Normal demand" : `${pricing.demandLevel} demand`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100"><span>Total</span><span className="text-[#D4A24C]">₦{grandTotal.toLocaleString()}</span></div>
                </div>
                <button onClick={() => setShowCheckout(true)} className="w-full mt-4 bg-[#5A432C] text-white py-3 rounded-2xl font-bold hover:bg-[#4a3520] transition">
                  Checkout →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Address *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where should we deliver?" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time</label>
                <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none">
                  <option value="">Any time</option>
                  <option>8:00 AM - 10:00 AM</option>
                  <option>10:00 AM - 12:00 PM</option>
                  <option>12:00 PM - 2:00 PM</option>
                  <option>2:00 PM - 4:00 PM</option>
                  <option>4:00 PM - 6:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Special Instructions</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Any special requests?" rows={2} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none resize-none" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Items ({storeCartItems.length})</span><span>₦{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Delivery</span><span>₦{deliveryFee.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="text-[#D4A24C]">₦{grandTotal.toLocaleString()}</span></div>
              </div>
              <button onClick={placeOrder} disabled={submitting || !name || !phone || !address} className="w-full bg-[#5A432C] text-white py-4 rounded-2xl font-bold hover:bg-[#4a3520] transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Placing Order..." : "Place Order →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          {user && user.role === "customer" && !hasReviewed && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Leave a Review</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl transition ${star <= reviewRating ? "text-[#D4A24C]" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">{reviewRating}/5</span>
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was your experience? (optional)"
                rows={3}
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none resize-none mb-3"
              />
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="bg-[#5A432C] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-[#4a3520] transition disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {reviewSuccess && (
            <div className="bg-green-50 text-green-700 rounded-xl p-4 mb-6 text-sm font-semibold">
              Thank you! Your review has been submitted.
            </div>
          )}

          {hasReviewed && !reviewSuccess && (
            <div className="bg-gray-50 text-gray-500 rounded-xl p-4 mb-6 text-sm">
              You have already reviewed this store.
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#D4A24C]/20 flex items-center justify-center font-bold text-[#5A432C] text-sm">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={`text-xs ${s <= review.rating ? "text-[#D4A24C]" : "text-gray-300"}`}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">💬</span>
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </section>

      {user && store && (
        <ChatBox
          storeId={id}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole={user.role}
          storeName={store.name}
        />
      )}

      <Footer />
    </main>
  );
}
