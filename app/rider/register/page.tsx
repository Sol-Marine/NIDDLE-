"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function RiderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("bicycle");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");

  const handleRegister = async () => {
    if (step === 0) {
      if (!name || !email || !password) { setError("All fields are required"); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
      setStep(1); setError(""); return;
    }
    if (step === 1) {
      if (!phone) { setError("Phone number is required"); return; }
      setSubmitting(true); setError("");
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, vehicleType, role: "rider" }),
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
            <div className="text-6xl mb-4">🚴</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome aboard!</h1>
            <p className="text-gray-500 text-sm mb-6">Your rider account has been created. Verify your email to start.</p>
            <a href={`/verify-email?token=${verifyToken}`} className="block w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200">
              Verify Email Now →
            </a>
            <Link href="/rider/dashboard" className="block mt-4 text-sm text-[#5A432C] font-semibold hover:underline">Go to Rider Dashboard</Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">Rider Registration</span>
            <h1 className="text-3xl md:text-4xl font-bold text-[#5A432C] mb-2">Start earning with NIDDLE</h1>
            <p className="text-gray-500 text-sm">Deliver packages across Lagos and earn on your own schedule.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">
            <div className="flex gap-2 mb-6">
              {[0, 1].map((i) => (
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
                <button onClick={handleRegister} className="w-full bg-[#5A432C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#4a3520] transition">Continue →</button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Rider Details</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#D4A24C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "bicycle", label: "Bicycle", icon: "🚲" },
                      { value: "motorcycle", label: "Motorcycle", icon: "🏍️" },
                      { value: "car", label: "Car", icon: "🚗" },
                    ].map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => setVehicleType(v.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          vehicleType === v.value
                            ? "border-[#D4A24C] bg-[#FFF8F0]"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{v.icon}</span>
                        <span className="text-xs font-semibold text-gray-700">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleRegister} disabled={submitting} className="w-full bg-[#D4A24C] text-white py-3.5 rounded-2xl font-bold hover:bg-[#c49540] transition disabled:opacity-50">
                  {submitting ? "Creating Account..." : "Create Rider Account →"}
                </button>
              </div>
            )}

            <p className="text-center mt-6 text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-[#D4A24C] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
