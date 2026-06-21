"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STORE_CATEGORIES = ["Food & Drinks", "Groceries", "Pharmacy", "Electronics", "Fashion", "Gifts", "Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"choose" | "customer" | "store">("choose");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeCategory, setStoreCategory] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeHours, setStoreHours] = useState("9:00 AM - 6:00 PM");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.id) router.replace("/");
    });
  }, [router]);

  const handleCustomerRegister = async () => {
    if (!name || !email || !password) { setError("All fields are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "customer" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to register"); return; }
      setVerifyToken(data.verifyToken);
    } catch { setError("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const handleStoreRegister = async () => {
    if (step === 0) {
      if (!name || !email || !password) { setError("All fields are required"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      setStep(1); setError(""); return;
    }
    if (step === 1) {
      if (!storeName || !storeCategory) { setError("Store name and category are required"); return; }
      setStep(2); setError(""); return;
    }
    if (step === 2) {
      if (!storeAddress || !storePhone || !storeEmail) { setError("All contact fields are required"); return; }
      setSubmitting(true); setError("");
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, email, password, role: "store",
            storeName, storeDescription: storeDesc, storeCategory,
            storeAddress, storePhone: storePhone, storeEmail: storeEmail || email, storeHours,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to register"); return; }
        setVerifyToken(data.verifyToken);
      } catch { setError("Something went wrong"); }
      finally { setSubmitting(false); }
    }
  };

  if (verifyToken) {
    return (
      <main className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-10 shadow-xl">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account created!</h1>
            <p className="text-gray-500 text-sm mb-6">
              {accountType === "store" ? "Verify your email, then complete your store setup." : "Check your email for the verification link."}
            </p>
            <a href={`/verify-email?token=${verifyToken}`} className="block w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200">
              Verify Email Now →
            </a>
            <Link href="/login" className="block mt-4 text-sm text-[#5A432C] font-semibold hover:underline">Back to login</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {accountType === "choose" && (
            <>
              <div className="text-center mb-10">
                <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Get Started</span>
                <h1 className="text-3xl md:text-4xl font-bold text-[#5A432C] mb-2">Create your account</h1>
                <p className="text-gray-500 text-sm">Choose how you want to use NIDDLE.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <button onClick={() => setAccountType("customer")} className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#D4A24C] hover:shadow-xl transition-all text-left group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">🛒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Customer</h3>
                  <p className="text-gray-500 text-sm">Browse stores, order food and goods, get same-day delivery across Lagos.</p>
                </button>

                <button onClick={() => setAccountType("store")} className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#D4A24C] hover:shadow-xl transition-all text-left group">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">🏪</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Store Owner</h3>
                  <p className="text-gray-500 text-sm">List your store, upload your menu, and reach thousands of customers.</p>
                </button>
              </div>

              <p className="text-center mt-8 text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-[#5A432C] font-bold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {accountType === "customer" && (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
              <button onClick={() => { setAccountType("choose"); setError(""); }} className="text-sm text-gray-400 hover:text-gray-600 mb-6">← Back</button>
              <div className="mb-6">
                <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">Customer Account</span>
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border-2 border-gray-100 rounded-xl p-3 pr-12 text-sm focus:border-[#D4A24C] outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{showPassword ? "🙈" : "👁️"}</button>
                  </div>
                </div>
                <button onClick={handleCustomerRegister} disabled={submitting} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition disabled:opacity-50">
                  {submitting ? "Creating..." : "Create Account →"}
                </button>
              </div>

              <p className="text-center mt-6 text-sm text-gray-500">
                Already have an account? <Link href="/login" className="text-[#D4A24C] font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {accountType === "store" && (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
              <button onClick={() => { if (step > 0) setStep(step - 1); else { setAccountType("choose"); setError(""); } }} className="text-sm text-gray-400 hover:text-gray-600 mb-6">← {step > 0 ? "Back" : "Change account type"}</button>
              <span className="inline-block text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">Store Owner Account</span>

              <div className="flex gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-[#D4A24C]" : "bg-gray-200"}`} />
                ))}
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">{error}</div>}

              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Your Account</h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border-2 border-gray-100 rounded-xl p-3 pr-12 text-sm focus:border-[#D4A24C] outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{showPassword ? "🙈" : "👁️"}</button>
                    </div>
                  </div>
                  <button onClick={handleStoreRegister} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition">Continue →</button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Store Information</h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name *</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. Mama Nkechi Kitchen" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STORE_CATEGORIES.map((cat) => (
                        <button key={cat} type="button" onClick={() => setStoreCategory(cat)} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${storeCategory === cat ? "border-[#D4A24C] bg-[#FFF8F0] text-[#5A432C]" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder="What does your store sell?" rows={3} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none resize-none" />
                  </div>
                  <button onClick={handleStoreRegister} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition">Continue →</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Contact & Location</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                      <input type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="08012345678" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                      <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} placeholder="store@email.com" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store Address *</label>
                    <input type="text" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} placeholder="Full address in Lagos" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Opening Hours</label>
                    <input type="text" value={storeHours} onChange={(e) => setStoreHours(e.target.value)} className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                  </div>
                  <button onClick={handleStoreRegister} disabled={submitting} className="w-full bg-[#D4A24C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#c49540] transition disabled:opacity-50">
                    {submitting ? "Creating Account..." : "Create Store Account →"}
                  </button>
                </div>
              )}

              <p className="text-center mt-6 text-sm text-gray-500">
                Already have an account? <Link href="/login" className="text-[#D4A24C] font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
