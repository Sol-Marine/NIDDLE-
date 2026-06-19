"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { generateTrackingId, saveDelivery } from "../lib/delivery";
import type { DeliveryOrder } from "../lib/delivery";

const packageTypes = [
  { value: "Documents", icon: "📄" },
  { value: "Food", icon: "🍱" },
  { value: "Parcel", icon: "📦" },
  { value: "Groceries", icon: "🛒" },
  { value: "Gift", icon: "🎁" },
  { value: "Electronics", icon: "💻" },
  { value: "Clothing", icon: "👕" },
  { value: "Other", icon: "📋" },
];

const sizes = [
  { label: "Small", icon: "📦", desc: "Envelope or small box" },
  { label: "Medium", icon: "📦📦", desc: "Bag or medium box" },
  { label: "Large", icon: "📦📦📦", desc: "Large box or multiple items" },
];

const specialHandling = [
  { label: "Fragile", icon: "🥚" },
  { label: "Perishable", icon: "🧊" },
  { label: "Valuable", icon: "💎" },
  { label: "Urgent", icon: "⚡" },
  { label: "None", icon: "✅" },
];

const riders = [
  { id: 1, name: "Chidi O.", rating: 4.9, rides: 342, badge: "Top Rider" },
  { id: 2, name: "Amara K.", rating: 4.8, rides: 287, badge: "Fast" },
  { id: 3, name: "Femi A.", rating: 4.7, rides: 198, badge: "Eco" },
  { id: 4, name: "Zainab B.", rating: 4.9, rides: 415, badge: "Top Rider" },
];

const timeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export default function SendPackagePage() {
  const [step, setStep] = useState(0);
  const [packageType, setPackageType] = useState("");
  const [size, setSize] = useState("");
  const [handling, setHandling] = useState("");
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [value, setValue] = useState("");
  const [instructions, setInstructions] = useState("");

  const [trackingId, setTrackingId] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const steps = [
    { label: "Your Package", emoji: "📦" },
    { label: "Sender & Details", emoji: "✍️" },
    { label: "Recipient & Rider", emoji: "🚴" },
    { label: "Review & Price", emoji: "💰" },
    { label: "Receipt", emoji: "🧾" },
  ];

  const calculatePrice = () => {
    let base = 2000;
    if (size === "Medium") base = 3500;
    if (size === "Large") base = 5000;
    if (handling === "Fragile") base += 500;
    if (handling === "Perishable") base += 800;
    if (handling === "Valuable") base += 1000;
    if (handling === "Urgent") base += 1500;
    if (selectedTime?.includes("Express") || selectedTime?.includes("Priority")) base += 2000;
    return base;
  };

  const estimatedPrice = calculatePrice();

  const handleBookDelivery = async () => {
    setBooking(true);
    setBookError("");
    try {
      const id = generateTrackingId();
      setTrackingId(id);
      const riderName = selectedRider
        ? riders.find((r) => r.id === selectedRider)?.name || "Auto-assigned"
        : "Auto-assigned";

      const order: DeliveryOrder = {
        id,
        senderName: senderName || "Anonymous",
        senderPhone: senderPhone || "N/A",
        recipientName: recipientName || "Not specified",
        recipientPhone: recipientPhone || "N/A",
        pickupAddress: pickupAddress || "Not specified",
        deliveryAddress: deliveryAddress || "Not specified",
        packageType: packageType || "Other",
        packageSize: size || "Medium",
        handling: handling || "None",
        description: description || "No description",
        weight: weight || "N/A",
        value: value || "0",
        specialInstructions: instructions || "None",
        riderName,
        timeSlot: selectedTime || "Flexible",
        price: estimatedPrice,
        originalPrice: estimatedPrice,
        negotiationStatus: "pending",
        status: "order-placed",
        createdAt: new Date().toLocaleString(),
      };

      await saveDelivery(order);
      nextStep();
    } catch (err) {
      setBookError("Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />

      <section className="bg-gradient-to-br from-[#FFF8F0] via-white to-[#FFF0E0] py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs md:text-sm font-semibold text-[#D4A24C] uppercase tracking-widest">
              Send Something
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">Send a Package</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Tell us about your package, set your preferences, and pick the perfect rider.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Desktop tabs */}
            <div className="hidden sm:flex border-b border-gray-100">
              {steps.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => i <= step && setStep(i)}
                  className={`flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 relative ${
                    i === step
                      ? "text-[#5A432C] bg-[#FFF8F0]"
                      : i < step
                        ? "text-[#D4A24C]"
                        : "text-gray-400 cursor-default"
                  }`}
                >
                  <span>{s.emoji} {s.label}</span>
                  {i < step && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#D4A24C] rounded-full" />
                  )}
                  {i === step && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#5A432C] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile step indicator */}
            <div className="sm:hidden border-b border-gray-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{steps[step].emoji}</span>
                  <span className="text-sm font-bold text-[#5A432C]">{steps[step].label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-400">Step {step + 1}/{steps.length}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < step ? "bg-[#D4A24C]" : i === step ? "bg-[#5A432C]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-5 md:p-8 lg:p-12">
              {/* STEP 0: Package */}
              {step === 0 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">What are you sending?</h2>
                    <p className="text-gray-500 text-sm">Choose a category so we know what we&apos;re working with.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Package Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {packageTypes.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setPackageType(t.value)}
                          className={`flex flex-col items-center gap-2 p-3 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
                            packageType === t.value
                              ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <span className="text-2xl sm:text-3xl">{t.icon}</span>
                          <span className="text-sm font-medium">{t.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Package Size</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {sizes.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setSize(s.label)}
                          className={`p-3 sm:p-5 rounded-2xl border-2 text-center transition-all duration-200 ${
                            size === s.label
                              ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <div className="font-semibold text-sm">{s.label}</div>
                          <div className="text-xs text-gray-500">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Special Handling</label>
                    <div className="flex flex-wrap gap-3">
                      {specialHandling.map((h) => (
                        <button
                          key={h.label}
                          type="button"
                          onClick={() => setHandling(h.label)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                            handling === h.label
                              ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                              : "border-gray-100 bg-white hover:border-gray-200"
                          }`}
                        >
                          <span>{h.icon}</span> {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Sender & Details */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Your details & package info</h2>
                    <p className="text-gray-500 text-sm">Tell us about yourself and what you&apos;re sending.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                        <input
                          type="text"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                        <input
                          type="tel"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What&apos;s inside? <span className="text-gray-400 font-normal">(be descriptive)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Tell us everything — is it a birthday gift? Documents? Groceries? Share the details so our rider knows exactly what to expect."
                      className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Approximate Weight</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">⚖️</span>
                        <input
                          type="text"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g. 2kg"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Value</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-8 sm:pl-10 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special instructions for the rider
                    </label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={2}
                      placeholder="Fragile — handle with care. Leave at the reception desk. Call before arrival..."
                      className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Recipient & Rider & Time */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Recipient, rider & schedule</h2>
                    <p className="text-gray-500 text-sm">Who&apos;s receiving it and who&apos;s delivering it.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Recipient's name"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Phone</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                        <input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                        <input
                          type="text"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="Enter pickup address"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Location</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter delivery address"
                          className="w-full border-2 border-gray-100 rounded-2xl p-3 sm:p-4 pl-10 sm:pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {riders.map((rider) => (
                      <button
                        key={rider.id}
                        type="button"
                        onClick={() => setSelectedRider(rider.id)}
                        className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 text-left transition-all duration-200 ${
                          selectedRider === rider.id
                            ? "border-[#D4A24C] bg-[#FFF8F0] shadow-lg"
                            : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${selectedRider === rider.id ? "bg-[#D4A24C]/20" : "bg-gray-50"}`}
                        >
                          🚴
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
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
                          <div className="w-6 h-6 rounded-full bg-[#D4A24C] flex items-center justify-center shrink-0">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Time Window</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
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
                </div>
              )}

              {/* STEP 3: Review & Book */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Review & price</h2>
                    <p className="text-gray-500 text-sm">Everything look good? Confirm to book your delivery.</p>
                  </div>

                  {/* Sender / Recipient */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <SummaryCard emoji="📤" label="Sender" value={senderName || "Not set"} />
                    <SummaryCard emoji="📥" label="Recipient" value={recipientName || "Not set"} />
                  </div>

                  {/* Package */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <SummaryCard emoji="📦" label="Package" value={`${packageType || "Other"} · ${size || "Medium"}`} />
                    <SummaryCard emoji="⚠️" label="Handling" value={handling || "None"} />
                    <SummaryCard emoji="📍" label="Pickup" value={pickupAddress || "Not set"} />
                    <SummaryCard emoji="🎯" label="Delivery" value={deliveryAddress || "Not set"} />
                    <SummaryCard emoji="⏰" label="Time" value={selectedTime || "Flexible"} />
                    <SummaryCard
                      emoji="🚴"
                      label="Rider"
                      value={selectedRider ? riders.find((r) => r.id === selectedRider)?.name || "Selected" : "Auto-assign"}
                    />
                  </div>

                  <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF0E0] rounded-3xl p-5 md:p-8 border border-[#D4A24C]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg md:text-xl text-[#5A432C]">Delivery Estimate</h3>
                      <span className="text-sm text-gray-500">Same-day Lagos delivery</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-extrabold text-[#5A432C]">₦{estimatedPrice.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Based on {size || "Medium"} {packageType || "parcel"}, {handling !== "None" ? handling : "standard"} handling</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Riders available now
                    </div>
                  </div>

                  <button
                    onClick={handleBookDelivery}
                    disabled={booking}
                    className="w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 md:py-5 rounded-2xl text-base md:text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {booking ? "Booking..." : `Book Delivery — ₦${estimatedPrice.toLocaleString()}`}
                  </button>
                  {bookError && (
                    <p className="text-red-500 text-sm text-center mt-2">{bookError}</p>
                  )}
                </div>
              )}

              {/* STEP 4: Receipt */}
              {step === 4 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-gray-500">Your package has been booked. Save your tracking ID below.</p>
                  </div>

                  <div className="bg-[#1a1a2e] rounded-3xl p-5 md:p-8 text-white">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Tracking ID</p>
                      <p className="text-xl md:text-3xl font-extrabold tracking-wider text-[#D4A24C] break-all">{trackingId}</p>
                    </div>

                    <div className="border-t border-gray-700 pt-6 space-y-3 text-sm">
                      <ReceiptRow label="From" value={`${senderName || "Anonymous"} · ${senderPhone}`} />
                      <ReceiptRow label="To" value={`${recipientName || "Not specified"} · ${recipientPhone}`} />
                      <ReceiptRow label="Package" value={`${packageType} · ${size}`} />
                      <ReceiptRow label="Pickup" value={pickupAddress || "Not set"} />
                      <ReceiptRow label="Delivery" value={deliveryAddress || "Not set"} />
                      <ReceiptRow label="Rider" value={selectedRider ? riders.find((r) => r.id === selectedRider)?.name || "Auto-assign" : "Auto-assign"} />
                      <ReceiptRow label="Time Slot" value={selectedTime || "Flexible"} />
                      <ReceiptRow label="Status" value="Order Placed ✓" />
                      <ReceiptRow label="Amount Paid" value={`₦${estimatedPrice.toLocaleString()}`} />
                      <ReceiptRow label="Booked At" value={new Date().toLocaleString()} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/track?id=${trackingId}`} className="flex-1">
                      <button className="w-full bg-[#5A432C] text-white py-4 rounded-2xl font-semibold hover:bg-[#4a3520] transition shadow-md">
                        Track Delivery →
                      </button>
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 border-2 border-gray-200 py-4 rounded-2xl font-semibold text-gray-700 hover:border-[#D4A24C] hover:text-[#D4A24C] transition"
                    >
                      🖨 Print Receipt
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    A copy of this receipt has been saved. Use tracking ID <strong>{trackingId}</strong> to track your delivery anytime.
                  </p>
                </div>
              )}

              {/* Navigation */}
              {step < 4 && (
                <div className="flex justify-between mt-6 pt-6 md:mt-10 md:pt-8 border-t border-gray-100">
                  <button
                    onClick={prevStep}
                    disabled={step === 0}
                    className={`px-5 md:px-8 py-3 md:py-3.5 rounded-2xl font-semibold transition-all duration-200 ${
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
                          i === step ? "bg-[#5A432C] w-6" : i < step ? "bg-[#D4A24C]" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextStep}
                    className="bg-[#5A432C] text-white px-6 md:px-10 py-3 md:py-3.5 rounded-2xl font-semibold hover:bg-[#4a3520] transition-all duration-200 shadow-md text-sm md:text-base"
                  >
                    Continue →
                  </button>
                </div>
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
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
