"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getReceiveRequestById, updateReceiveRequest } from "../lib/delivery";
import type { ReceiveRequest } from "../lib/delivery";
import { RIDERS, PACKAGE_TYPES, PACKAGE_TYPE_ICONS, SIZES, TIME_SLOTS } from "@/app/lib/constants";

export default function PricingPage() {
  const [step, setStep] = useState(0);
  const [packageType, setPackageType] = useState("Parcel");
  const [size, setSize] = useState("Small");
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [requestRef, setRequestRef] = useState("");
  const [receiveRequest, setReceiveRequest] = useState<ReceiveRequest | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState(3500);
  const [priceSet, setPriceSet] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;
    getReceiveRequestById(ref).then((req) => {
      setRequestRef(ref);
      if (!req) return;
      setReceiveRequest(req);
      setPackageType(req.packageType);
      if (req.negotiatedPrice) setNegotiatedPrice(req.negotiatedPrice);
    });
  }, []);

  const handleSetPrice = async () => {
    if (!receiveRequest) return;
    await updateReceiveRequest(receiveRequest.id, {
      negotiatedPrice,
      status: "quoted",
    });
    setPriceSet(true);
  };

  const steps = [
    { label: "Package", emoji: "📦" },
    { label: "Schedule", emoji: "📅" },
    { label: "Rider", emoji: "🚴" },
    { label: "Review", emoji: "✅" },
  ];

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />

      {/* Hero with background image */}
      <section className="relative h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/national-theater.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/85 via-[#1a1a2e]/70 to-[#1a1a2e]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,162,76,0.15),transparent_60%)]" />
        <div className="relative h-full max-w-[1400px] mx-auto px-8 flex flex-col justify-center">
          <span className="text-[#D4A24C] font-semibold text-sm uppercase tracking-widest mb-3">
            Book Your Delivery
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 max-w-2xl leading-tight">
            Get a <span className="text-[#D4A24C]">Delivery Quote</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Choose your time window, pick your preferred rider, and tell us what you need delivered — all in one place.
          </p>
        </div>
      </section>

      {/* Receive Request Banner */}
      {receiveRequest && (
        <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10 pb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl shrink-0">📬</div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Reference: {requestRef}</p>
                  <h3 className="font-bold text-gray-900">
                    {receiveRequest.fullName} is expecting {receiveRequest.packageType}
                  </h3>
                  <p className="text-xs text-gray-500">{receiveRequest.deliveryAddress}</p>
                </div>
              </div>
              {!priceSet && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Your quote</p>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 font-semibold">₦</span>
                      <input
                        type="number"
                        value={negotiatedPrice}
                        onChange={(e) => setNegotiatedPrice(Number(e.target.value))}
                        className="w-24 border-2 border-gray-200 rounded-xl p-2 text-sm font-bold text-gray-900 focus:border-[#D4A24C] outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSetPrice}
                    className="bg-[#5A432C] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#4a3520] transition shadow-md"
                  >
                    Set Price
                  </button>
                </div>
              )}
              {priceSet && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-5 py-3 rounded-xl text-sm font-semibold">
                  <span>✅</span> Quoted at ₦{negotiatedPrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Form Section */}
      <section className="max-w-5xl mx-auto px-6 -mt-20 relative z-10 pb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Step Indicator */}
          <div className="flex border-b border-gray-100">
            {steps.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setStep(i)}
                className={`flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 relative ${
                  i === step
                    ? "text-[#5A432C] bg-[#FFF8F0]"
                    : i < step
                    ? "text-[#D4A24C]"
                    : "text-gray-400"
                }`}
              >
                <span className="hidden sm:inline">{s.emoji} </span>
                {s.label}
                {i < step && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#D4A24C] rounded-full" />
                )}
                {i === step && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#5A432C] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {/* STEP 0: Package Details */}
            {step === 0 && (
              <div className="animate-fade-in-up space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">What are you sending?</h2>
                  <p className="text-gray-500 text-sm">Tell us about your package so we can match you with the right rider.</p>
                </div>

                {/* Package Type Grid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Package Type</label>
                  <div className="grid grid-cols-5 gap-3">
                    {PACKAGE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPackageType(t)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                          packageType === t
                            ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <span className="text-2xl">{PACKAGE_TYPE_ICONS[t]}</span>
                        <span className="text-xs font-medium">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Package Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {SIZES.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSize(s.label)}
                        className={`p-4 rounded-2xl border-2 font-medium transition-all duration-200 ${
                          size === s.label
                            ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Approximate Weight</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. 5kg"
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">⚖️</span>
                  </div>
                </div>

                {/* Package Description / What they want */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    placeholder="Tell us about your package — fragile items, delivery instructions, or anything else we should know..."
                    rows={4}
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Schedule */}
            {step === 1 && (
              <div className="animate-fade-in-up space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Choose your delivery window</h2>
                  <p className="text-gray-500 text-sm">Select a date and time that works best for you.</p>
                </div>

                {/* Pickup & Delivery Locations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter pickup address"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter delivery address"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all text-gray-700"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                  </div>
                </div>

                {/* Time Window */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Time Window</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                          selectedTime === slot
                            ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Speed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Delivery Speed</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Standard 2-4hrs", "Express 1hr", "Priority 30min"].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        className="border-2 border-gray-100 bg-white p-4 rounded-2xl text-sm font-medium hover:border-gray-200 transition-all duration-200"
                      >
                        {speed === "Standard 2-4hrs" && "🚲 "}
                        {speed === "Express 1hr" && "⚡ "}
                        {speed === "Priority 30min" && "🚀 "}
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Rider Selection */}
            {step === 2 && (
              <div className="animate-fade-in-up space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Choose your rider</h2>
                  <p className="text-gray-500 text-sm">Pick a rider based on ratings, experience, and availability.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {RIDERS.map((rider) => (
                    <button
                      key={rider.id}
                      type="button"
                      onClick={() => setSelectedRider(rider.id)}
                      className={`flex items-center gap-5 p-6 rounded-3xl border-2 text-left transition-all duration-200 ${
                        selectedRider === rider.id
                          ? "border-[#D4A24C] bg-[#FFF8F0] shadow-lg"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                          selectedRider === rider.id
                            ? "bg-[#D4A24C]/20"
                            : "bg-gray-50"
                        }`}
                      >
                        {rider.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{rider.name}</h3>
                          <span className="text-xs bg-[#D4A24C]/10 text-[#5A432C] font-semibold px-2 py-0.5 rounded-full">
                            {rider.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-[#D4A24C]">★</span> {rider.rating}
                          </span>
                          <span>{rider.rides} rides</span>
                        </div>
                      </div>
                      {selectedRider === rider.id && (
                        <div className="w-7 h-7 rounded-full bg-[#D4A24C] flex items-center justify-center shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Preferred rider name (type in) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or type a preferred rider name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. If you have a regular rider in mind..."
                    className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Review & Submit */}
            {step === 3 && (
              <div className="animate-fade-in-up space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Review your order</h2>
                  <p className="text-gray-500 text-sm">Double-check everything before requesting your quote.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <SummaryCard emoji="📦" label="Package" value={`${size} ${packageType}`} />
                  <SummaryCard emoji="📅" label="Date" value={date || "Not selected"} />
                  <SummaryCard emoji="⏰" label="Time Window" value={selectedTime || "Not selected"} />
                  <SummaryCard
                    emoji="🚴"
                    label="Rider"
                    value={selectedRider ? RIDERS.find((r) => r.id === selectedRider)?.name || "Selected" : "Not selected"}
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Budget Offer</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                    <input
                      type="number"
                      placeholder="5000"
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-10 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Price Estimate */}
                <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF0E0] rounded-3xl p-8 border border-[#D4A24C]/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-xl text-[#5A432C]">Estimated Price</h3>
                    <span className="text-sm text-gray-500">Subject to distance</span>
                  </div>
                  <p className="text-4xl font-extrabold text-[#5A432C]">₦3,500</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Riders available in your area
                  </div>
                </div>

                <Link href="/send-package">
                  <button
                    className="w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-5 rounded-2xl text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] shadow-lg"
                  >
                    Book Delivery →
                  </button>
                </Link>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-8 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className={`px-8 py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
                  step === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "border-2 border-gray-200 text-gray-700 hover:border-gray-400"
                }`}
              >
                ← Back
              </button>

              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "bg-[#5A432C] w-6"
                        : i < step
                        ? "bg-[#D4A24C]"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="bg-[#5A432C] text-white px-10 py-3.5 rounded-2xl font-semibold hover:bg-[#4a3520] transition-all duration-200 shadow-md"
                >
                  Continue →
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SummaryCard({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">
        {emoji}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
