"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      if (data.token) setToken(data.token);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-6">We sent a reset link to <strong>{email}</strong></p>
          <Link
            href={`/reset-password?token=${token}`}
            className="block w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Reset Password →
          </Link>
          <Link href="/login" className="block mt-4 text-sm text-[#5A432C] font-semibold hover:underline">
            ← Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#D4A24C]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#5A432C] to-[#4a3520] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link href="/login" className="block mt-6 text-center text-sm text-[#5A432C] font-semibold hover:underline">
          ← Back to login
        </Link>
      </div>
    </main>
  );
}
