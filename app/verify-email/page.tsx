"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus(res.ok ? "done" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#D4A24C]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verifying email...</h1>
          </>
        )}
        {status === "done" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Email verified!</h1>
            <p className="text-gray-500 text-sm mb-6">Your account is now active. You can sign in.</p>
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign In →
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verification failed</h1>
            <p className="text-gray-500 text-sm mb-6">This link is invalid or has expired.</p>
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Login →
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
