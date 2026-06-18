"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDeliveryById, updateDelivery } from "../lib/delivery";
import type { DeliveryOrder } from "../lib/delivery";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("../components/DeliveryMap"), { ssr: false });

const statusSteps: { label: string; icon: string; key: DeliveryOrder["status"] }[] = [
  { label: "Order Placed", icon: "📋", key: "order-placed" },
  { label: "Picked Up", icon: "📦", key: "picked-up" },
  { label: "In Transit", icon: "🚴", key: "in-transit" },
  { label: "Out for Delivery", icon: "📍", key: "out-for-delivery" },
  { label: "Delivered", icon: "✅", key: "delivered" },
];

const statusLabels: Record<string, string> = {
  "order-placed": "Order Placed",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
};

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [showMap, setShowMap] = useState(false);

  const activeStep = delivery
    ? statusSteps.findIndex((s) => s.key === delivery.status)
    : -1;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (!trackingId.trim()) {
      setDelivery(null);
      return;
    }
    const found = await getDeliveryById(trackingId.trim().toUpperCase());
    setDelivery(found || null);
  };

  const handleConfirmDelivery = async () => {
    if (!delivery || !confirmName.trim()) return;
    await updateDelivery(delivery.id, {
      status: "delivered",
      deliveredAt: new Date().toLocaleString(),
      receivedBy: confirmName.trim(),
      proofNote: confirmNote.trim() || undefined,
    });
    setDelivery({
      ...delivery,
      status: "delivered",
      deliveredAt: new Date().toLocaleString(),
      receivedBy: confirmName.trim(),
      proofNote: confirmNote.trim() || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />

      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,162,76,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 relative text-center">
          <span className="text-[#D4A24C] font-semibold text-sm uppercase tracking-widest">
            Track Your Delivery
          </span>
          <h1 className="text-5xl font-extrabold text-white mt-3 mb-4">
            Where&apos;s your package?
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto mb-10">
            Enter your tracking ID to see real-time updates on your delivery.
          </p>

          <form onSubmit={handleTrack} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter tracking ID (e.g. NID-XXXX-XXXX)"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 pl-12 text-white placeholder-gray-500 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/30 outline-none transition-all backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#D4A24C] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#c4943e] transition-all shadow-lg hover:shadow-xl"
              >
                Track
              </button>
            </div>
          </form>
        </div>
      </section>

      {searched && (
        <section className="max-w-4xl mx-auto px-6 -mt-10 relative z-10 pb-24">
          {!delivery ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No delivery found</h2>
              <p className="text-gray-500 text-sm mb-6">
                We couldn&apos;t find a delivery with that tracking ID. Double-check and try again.
              </p>
              <p className="text-xs text-gray-400">
                Tip: Tracking IDs look like <strong>NID-XXXX-XXXX</strong>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Status Banner */}
              <div
                className={`p-8 border-b border-gray-100 ${
                  delivery.status === "delivered"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50"
                    : "bg-gradient-to-r from-[#FFF8F0] to-[#FFF0E0]"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tracking ID</p>
                    <p className="text-2xl font-extrabold text-[#5A432C] tracking-wide">
                      {delivery.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Status</p>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                        delivery.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          delivery.status === "delivered"
                            ? "bg-green-600"
                            : "bg-green-500 animate-pulse"
                        }`}
                      />
                      {statusLabels[delivery.status] || delivery.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12 grid md:grid-cols-5 gap-8">
                {/* Timeline */}
                <div className="md:col-span-3">
                  <h3 className="font-bold text-lg mb-8">Delivery Timeline</h3>
                  <div className="space-y-0">
                    {statusSteps.map((step, i) => {
                      const isActive = i <= activeStep;
                      const isLast = i === statusSteps.length - 1;
                      return (
                        <div key={step.label} className="flex gap-5">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 border-2 ${
                                isActive
                                  ? "bg-[#5A432C] border-[#5A432C] text-white"
                                  : "bg-white border-gray-200 text-gray-400"
                              }`}
                            >
                              {isActive ? (
                                step.icon
                              ) : (
                                <span className="text-lg">{step.icon}</span>
                              )}
                            </div>
                            {!isLast && (
                              <div
                                className={`w-0.5 h-14 ${isActive && i < activeStep ? "bg-[#D4A24C]" : "bg-gray-200"}`}
                              />
                            )}
                          </div>
                          <div className={`pb-10 ${isLast ? "pb-0" : ""}`}>
                            <p
                              className={`font-semibold ${isActive ? "text-gray-900" : "text-gray-400"}`}
                            >
                              {step.label}
                            </p>
                            <p
                              className={`text-sm ${isActive ? "text-gray-500" : "text-gray-300"}`}
                            >
                              {isActive && i === activeStep && delivery.status !== "delivered"
                                ? "In progress"
                                : isActive
                                  ? "Completed"
                                  : "Pending"}
                            </p>
                            {i === activeStep && delivery.status !== "delivered" && (
                              <span className="inline-block mt-1 text-xs text-[#D4A24C] font-semibold">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Map */}
                <div className="md:col-span-5">
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#5A432C] hover:text-[#4a3520] transition mb-4"
                  >
                    <span>{showMap ? "▼" : "▶"}</span>
                    {showMap ? "Hide delivery map" : "View delivery map"}
                  </button>
                  {showMap && (
                    <DeliveryMap
                      pickupAddress={delivery.pickupAddress}
                      deliveryAddress={delivery.deliveryAddress}
                    />
                  )}
                </div>

                {/* Package Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Package Details</h3>
                    <div className="space-y-4">
                      <InfoRow label="Type" value={delivery.packageType} />
                      <InfoRow label="Size" value={delivery.packageSize} />
                      <InfoRow label="Weight" value={delivery.weight} />
                      <InfoRow label="From" value={delivery.pickupAddress} />
                      <InfoRow label="To" value={delivery.deliveryAddress} />
                      <InfoRow label="Rider" value={delivery.riderName} />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4">Sender & Recipient</h3>
                    <div className="space-y-4">
                      <InfoRow label="Sender" value={delivery.senderName} />
                      <InfoRow label="Sender Phone" value={delivery.senderPhone} />
                      <InfoRow label="Recipient" value={delivery.recipientName} />
                      <InfoRow label="Recipient Phone" value={delivery.recipientPhone} />
                    </div>
                  </div>

                  {/* Proof of Delivery */}
                  {delivery.status === "delivered" && delivery.receivedBy ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
                        <span>✅</span> Proof of Delivery
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Received by</span>
                          <span className="font-bold text-gray-900">{delivery.receivedBy}</span>
                        </div>
                        {delivery.deliveredAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Delivered at</span>
                            <span className="font-semibold text-gray-900">{delivery.deliveredAt}</span>
                          </div>
                        )}
                        {delivery.proofNote && (
                          <div className="bg-white/60 rounded-xl p-3 italic text-gray-600 mt-2">
                            &ldquo;{delivery.proofNote}&rdquo;
                          </div>
                        )}
                        <div className="bg-green-100 rounded-xl p-3 text-center text-xs text-green-700 font-semibold mt-2">
                          ✓ Delivery confirmed and signed for
                        </div>
                      </div>
                    </div>
                  ) : delivery.status === "out-for-delivery" ? (
                    /* Confirm Delivery Form */
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="font-bold text-lg mb-3 text-[#5A432C] flex items-center gap-2">
                        <span>📬</span> Confirm Delivery
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Are you the recipient? Confirm that you&apos;ve received this package.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={confirmName}
                          onChange={(e) => setConfirmName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                        <textarea
                          value={confirmNote}
                          onChange={(e) => setConfirmNote(e.target.value)}
                          placeholder="Any notes about the delivery? (optional)"
                          rows={2}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                        />
                        <button
                          onClick={handleConfirmDelivery}
                          disabled={!confirmName.trim()}
                          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                            confirmName.trim()
                              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          ✓ Confirm Receipt
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Link href={`/send-package`}>
                      <button className="w-full bg-[#5A432C] text-white py-3 rounded-xl font-semibold hover:bg-[#4a3520] transition shadow-md text-sm">
                        📦 Send Another Package
                      </button>
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="w-full border-2 border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:border-[#D4A24C] hover:text-[#D4A24C] transition text-sm"
                    >
                      🖨 Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <Footer />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
