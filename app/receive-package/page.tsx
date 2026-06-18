"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDeliveriesByPhone, getReceiveRequestsByPhone, generateRequestId, saveReceiveRequest } from "../lib/delivery";
import type { DeliveryOrder, ReceiveRequest } from "../lib/delivery";

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

const deliveryOptions = [
  { label: "Leave at reception", icon: "🏢" },
  { label: "Hand to me only", icon: "🤝" },
  { label: "Leave at my door", icon: "🚪" },
  { label: "Call on arrival", icon: "📞" },
  { label: "Neighbour can receive", icon: "🏠" },
];

const timeSlots = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export default function ReceivePackagePage() {
  const [tab, setTab] = useState<"register" | "alerts">("register");
  const [step, setStep] = useState(0);
  const [packageType, setPackageType] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryPref, setDeliveryPref] = useState("");
  const [instructions, setInstructions] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");

  const [requestRef, setRequestRef] = useState("");
  const [savedRequest, setSavedRequest] = useState<ReceiveRequest | null>(null);
  const [phoneLookup, setPhoneLookup] = useState("");
  const [lookedUp, setLookedUp] = useState(false);
  const [foundPackages, setFoundPackages] = useState<DeliveryOrder[]>([]);
  const [foundRequests, setFoundRequests] = useState<ReceiveRequest[]>([]);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const steps = [
    { label: "Expecting", emoji: "📬" },
    { label: "Your Details", emoji: "✍️" },
    { label: "Review", emoji: "✅" },
    { label: "Confirmed", emoji: "🧾" },
  ];

  const handleConfirm = async () => {
    const id = generateRequestId();
    const req: ReceiveRequest = {
      id,
      packageType: packageType || "Other",
      description: description || "No description",
      deliveryPref: deliveryPref || "Standard",
      instructions: instructions || "None",
      fullName: fullName || "Anonymous",
      phone: phone || "N/A",
      deliveryAddress: deliveryAddress || "Not specified",
      preferredTime: preferredTime || "Flexible",
      notes: notes || "None",
      createdAt: new Date().toLocaleString(),
      status: "pending",
    };
    await saveReceiveRequest(req);
    setRequestRef(id);
    setSavedRequest(req);
    nextStep();
  };

  const handleCheckAlerts = async () => {
    setLookedUp(true);
    const cleaned = phoneLookup.replace(/\D/g, "");
    const deliveries = await getDeliveriesByPhone(cleaned);
    setFoundPackages(deliveries);
    const requests = await getReceiveRequestsByPhone(cleaned);
    setFoundRequests(requests);
  };

  const getTypeIcon = (type: string) => {
    const found = packageTypes.find((t) => t.value === type);
    return found ? found.icon : "📦";
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#D4A24C] uppercase tracking-widest">
              Receive Something
            </span>
            <h1 className="text-5xl font-extrabold mt-3 mb-4">Receive a Package</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Register an incoming package or check if someone is sending something to you.
            </p>
          </div>

          <div className="flex gap-2 mb-8 max-w-md mx-auto">
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                tab === "register"
                  ? "bg-[#5A432C] text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              📬 Register
            </button>
            <button
              onClick={() => {
                setTab("alerts");
                setLookedUp(false);
                setPhoneLookup("");
              }}
              className={`flex-1 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                tab === "alerts"
                  ? "bg-[#5A432C] text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              🔔 My Alerts
            </button>
          </div>

          {tab === "register" ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {steps.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      const canGoTo = i === 0 || (i <= step);
                      if (canGoTo) setStep(i);
                    }}
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
                {step === 0 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">What are you expecting?</h2>
                      <p className="text-gray-500 text-sm">
                        Tell us about the package someone is sending to you.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Package Type
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {packageTypes.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setPackageType(t.value)}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 ${
                              packageType === t.value
                                ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                                : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                          >
                            <span className="text-3xl">{t.icon}</span>
                            <span className="text-sm font-medium">{t.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Describe what you&apos;re receiving{" "}
                        <span className="text-gray-400 font-normal">(be detailed)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Tell us everything you know — is it a package from a loved one? An important document? Groceries for the week? Electronics? The more details you share, the smoother the delivery."
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Delivery Preference
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {deliveryOptions.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setDeliveryPref(opt.label)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                              deliveryPref === opt.label
                                ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                                : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                          >
                            <span className="text-xl">{opt.icon}</span>
                            <span className="text-left text-xs leading-tight">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special instructions for the rider
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        placeholder="Call when you arrive. Ring the bell twice. Use the side gate. Don't leave in the sun..."
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Your details</h2>
                      <p className="text-gray-500 text-sm">
                        So we know where to deliver and who to contact.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your name"
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+234 800 000 0000"
                            className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Your full delivery address in Lagos"
                          className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Preferred Delivery Time
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setPreferredTime(slot)}
                            className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                              preferredTime === slot
                                ? "border-[#D4A24C] bg-[#FFF8F0] shadow-md"
                                : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Anything else you&apos;d like the sender or rider to know?
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Let us know if there are specific times that work best, access details to your building, or any special requests..."
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Review your request</h2>
                      <p className="text-gray-500 text-sm">
                        Confirm your details so we can notify the sender and rider.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <SummaryCard emoji="📦" label="Expecting" value={packageType || "Not set"} />
                      <SummaryCard emoji="🚚" label="Delivery" value={deliveryPref || "Standard"} />
                      <SummaryCard emoji="👤" label="Name" value={fullName || "Not set"} />
                      <SummaryCard emoji="📞" label="Phone" value={phone || "Not set"} />
                      <SummaryCard emoji="📍" label="Address" value={deliveryAddress || "Not set"} />
                      <SummaryCard emoji="⏰" label="Time" value={preferredTime || "Flexible"} />
                    </div>
                    <button
                      onClick={handleConfirm}
                      className="w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-5 rounded-2xl text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] shadow-lg"
                    >
                      Confirm Request →
                    </button>
                  </div>
                )}

                {step === 3 && savedRequest && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">✅</span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Request Confirmed!</h2>
                      <p className="text-gray-500 text-sm">
                        Your receive request has been saved. Save your reference ID below.
                      </p>
                    </div>

                    <div className="bg-[#1a1a2e] rounded-3xl p-8 text-white">
                      <div className="text-center mb-6">
                        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Reference ID</p>
                        <p className="text-3xl font-extrabold tracking-wider text-[#D4A24C]">{requestRef}</p>
                      </div>

                      <div className="border-t border-gray-700 pt-6 space-y-3 text-sm">
                        <ReceiptRow label="Recipient" value={fullName} />
                        <ReceiptRow label="Phone" value={phone} />
                        <ReceiptRow label="Address" value={deliveryAddress} />
                        <ReceiptRow label="Package" value={packageType || "Other"} />
                        <ReceiptRow label="Delivery Preference" value={deliveryPref || "Standard"} />
                        <ReceiptRow label="Time" value={preferredTime || "Flexible"} />
                        <ReceiptRow label="Status" value="Pending Quote" />
                        <ReceiptRow label="Confirmed At" value={new Date().toLocaleString()} />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/pricing?ref=${requestRef}`} className="flex-1">
                        <button className="w-full bg-[#D4A24C] text-[#1a1a2e] py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
                          Get a Quote & Negotiate →
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
                      Use reference <strong>{requestRef}</strong> to get a price quote and negotiate delivery cost.
                    </p>
                  </div>
                )}

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
                  {step < 2 ? (
                    <button
                      onClick={nextStep}
                      className="bg-[#5A432C] text-white px-10 py-3.5 rounded-2xl font-semibold hover:bg-[#4a3520] transition-all duration-200 shadow-md"
                    >
                      Continue →
                    </button>
                  ) : step === 2 ? (
                    <div />
                  ) : (
                    <Link href={`/pricing?ref=${requestRef}`}>
                      <button className="bg-[#D4A24C] text-[#1a1a2e] px-10 py-3.5 rounded-2xl font-bold hover:shadow-lg transition-all duration-200">
                        Get a Quote →
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-8 md:p-12">
              {!lookedUp ? (
                <div className="max-w-md mx-auto text-center space-y-8">
                  <div className="w-20 h-20 rounded-full bg-[#D4A24C]/10 flex items-center justify-center mx-auto">
                    <span className="text-4xl">🔔</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Check your package alerts</h2>
                    <p className="text-gray-500 text-sm">
                      Enter your phone number to see if someone is sending a package to you.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                      Your Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        📞
                      </span>
                      <input
                        type="tel"
                        value={phoneLookup}
                        onChange={(e) => setPhoneLookup(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCheckAlerts}
                    disabled={!phoneLookup.trim()}
                    className={`w-full py-4 rounded-2xl font-semibold transition shadow-md ${
                      phoneLookup.trim()
                        ? "bg-[#5A432C] text-white hover:bg-[#4a3520]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Check Alerts
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Your Package Alerts</h2>
                      <p className="text-gray-500 text-sm">
                        {foundPackages.length} incoming package
                        {foundPackages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLookedUp(false);
                        setPhoneLookup("");
                      }}
                      className="text-sm text-[#D4A24C] font-semibold hover:underline"
                    >
                      Check another number
                    </button>
                  </div>

                  {foundPackages.length === 0 && foundRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📭</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Nothing found
                      </h3>
                      <p className="text-gray-500 text-sm">
                        No incoming packages or requests linked to this phone number.
                      </p>
                    </div>
                  ) : (
                    <>
                      {foundRequests.map((req) => (
                        <div key={req.id} className="border border-blue-100 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-blue-50/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                {getTypeIcon(req.packageType)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-bold text-gray-900">{req.packageType}</h3>
                                  <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                                    {req.status === "pending" ? "Awaiting Quote" : req.status === "quoted" ? "Quoted" : "Confirmed"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  You registered this — awaiting price quote
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>🔗 {req.id}</span>
                                  <span>⏱ {req.preferredTime}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <Link href={`/pricing?ref=${req.id}`}>
                                <button className="bg-[#D4A24C] text-[#1a1a2e] px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition shadow-md w-full">
                                  Get Quote
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      {foundPackages.map((pkg) => {
                        const statusLbl: Record<string, string> = {
                          "order-placed": "Order Placed",
                          "picked-up": "Picked Up",
                          "in-transit": "In Transit",
                          "out-for-delivery": "Out for Delivery",
                          delivered: "Delivered ✓",
                        };
                        return (
                          <div key={pkg.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-[#D4A24C]/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                  {getTypeIcon(pkg.packageType)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-gray-900">{pkg.packageType}</h3>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      pkg.status === "delivered" ? "bg-green-100 text-green-700" : "bg-[#D4A24C]/10 text-[#5A432C]"
                                    }`}>
                                      {statusLbl[pkg.status] || pkg.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    From <strong>{pkg.senderName}</strong> · {pkg.pickupAddress}
                                  </p>
                                  {pkg.description && pkg.description !== "No description" && (
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 italic">&ldquo;{pkg.description}&rdquo;</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span>🔗 {pkg.id}</span>
                                    {pkg.timeSlot && <span>⏱ {pkg.timeSlot}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <Link href="/track">
                                  <button className="bg-[#5A432C] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#4a3520] transition shadow-md w-full">Track</button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {(foundPackages.length > 0 || foundRequests.length > 0) && (
                    <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF0E0] rounded-3xl p-6 border border-[#D4A24C]/20 mt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4A24C]/15 flex items-center justify-center text-2xl shrink-0">📢</div>
                        <div>
                          <h3 className="font-bold text-[#5A432C]">Want SMS & email alerts?</h3>
                          <p className="text-sm text-gray-600">Enable notifications to get instant alerts when a package is on its way to you.</p>
                        </div>
                        <button className="bg-[#5A432C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#4a3520] transition shadow-md shrink-0">Enable</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SummaryCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">{emoji}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
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
