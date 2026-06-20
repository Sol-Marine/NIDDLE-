"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid reset link</h1>
          <Link href="/forgot-password" className="text-[#D4A24C] font-semibold hover:underline">
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Password reset!</h1>
          <p className="text-gray-500 text-sm mb-6">Your password has been updated.</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go to Login →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Reset password</h1>
          <p className="text-gray-500 text-sm">Enter your new password below.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#5A432C] to-[#4a3520] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link href="/login" className="block mt-6 text-center text-sm text-[#5A432C] font-semibold hover:underline">
          ← Back to login
        </Link>
      </div>
    </main>
  );
}
