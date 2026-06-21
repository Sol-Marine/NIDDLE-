"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const CATEGORIES = ["Food & Drinks", "Groceries", "Pharmacy", "Electronics", "Fashion", "Gifts", "Other"];

export default function StoreRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [openingHours, setOpeningHours] = useState("9:00 AM - 6:00 PM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.id) router.replace("/login");
    });
  }, [router]);

  const handleRegister = async () => {
    if (!name || !category || !address || !phone || !email) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, address, phone, email, openingHours }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) throw new Error("Please log in to register a store");
        throw new Error(data.error || "Failed to register store");
      }
      const store = await res.json();
      router.push(`/store/dashboard?storeId=${store.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Join NIDDLE</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#5A432C] mb-2">Register Your Store</h1>
            <p className="text-gray-500 text-sm">Start receiving orders and reaching customers across Lagos.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
            <div className="flex gap-2 mb-8">
              {[0, 1].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-[#D4A24C]" : "bg-gray-200"}`} />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Store Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mama Nkechi Kitchen" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} type="button" onClick={() => setCategory(cat)} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${category === cat ? "border-[#D4A24C] bg-[#FFF8F0] text-[#5A432C]" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers what you sell..." rows={3} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none resize-none" />
                </div>
                <button onClick={() => { if (!name || !category) { setError("Store name and category are required"); return; } setError(""); setStep(1); }} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition">
                  Continue →
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="store@email.com" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Store Address *</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address in Lagos" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Hours</label>
                  <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="9:00 AM - 6:00 PM" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 border-2 border-gray-200 py-3.5 rounded-2xl font-semibold text-gray-700 hover:border-gray-400 transition">← Back</button>
                  <button onClick={handleRegister} disabled={submitting} className="flex-1 bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition disabled:opacity-50">
                    {submitting ? "Registering..." : "Register Store →"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-6">
              Already have a store? <Link href="/store/dashboard" className="text-[#D4A24C] font-semibold hover:underline">Go to Dashboard</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
