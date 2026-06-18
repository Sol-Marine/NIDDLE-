"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { name, email, password } : { email, password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/admin");
  };

  return (
    <main className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1a1a2e] flex-col justify-between p-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/national-theater.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e]/95 to-[#2a1a0e]/90" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-[#D4A24C]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#C2533D]/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              NIDDLE
            </h1>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-[#D4A24C]/15 flex items-center justify-center mb-8">
            <span className="text-3xl">🚴</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Welcome back to
            <br />
            <span className="text-[#D4A24C]">fast delivery</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Login to manage deliveries, track packages in real-time, and connect with your preferred riders across Lagos.
          </p>

          <div className="flex gap-6 mt-12">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-gray-500">Deliveries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-gray-500">Riders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} NIDDLE. All rights reserved.
        </p>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-[#faf7f2] via-white to-[#FFF8F0]">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/">
              <h1 className="text-3xl font-extrabold text-[#5A432C]">NIDDLE</h1>
            </Link>
            <p className="text-gray-500 text-sm mt-1">Fast Bicycle Delivery</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign in</h2>
            <p className="text-gray-500 text-sm">
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4">
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 pr-14 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-lg"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5A432C] to-[#4a3520] text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              {isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-[#5A432C] font-bold hover:underline"
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
