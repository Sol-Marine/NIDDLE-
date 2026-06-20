"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[360px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/national-theater.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/85 via-[#1a1a2e]/70 to-[#1a1a2e]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,162,76,0.12),transparent_60%)]" />
        <div className="relative h-full max-w-[1400px] mx-auto px-8 flex flex-col justify-center">
          <span className="text-[#D4A24C] font-semibold text-sm uppercase tracking-widest mb-3">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 max-w-2xl leading-tight">
            Contact <span className="text-[#D4A24C]">NIDDLE</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Have a question, feedback, or need help with a delivery? We&apos;re here for you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 pb-24">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="font-bold text-xl text-[#5A432C] mb-6">Contact Information</h2>
              <div className="space-y-6">
                <ContactInfoRow
                  icon="📍"
                  label="Address"
                  value="42 Awolowo Road, Ikoyi, Lagos, Nigeria"
                />
                <ContactInfoRow
                  icon="📞"
                  label="Phone"
                  value="+234 906 489 3244"
                />
                <ContactInfoRow
                  icon="✉️"
                  label="Email"
                  value="support@niddle.com"
                />
                <ContactInfoRow
                  icon="⏰"
                  label="Working Hours"
                  value="Mon – Sat, 7:00 AM – 8:00 PM"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF0E0] rounded-3xl p-8 border border-[#D4A24C]/20 shadow-lg">
              <h3 className="font-bold text-lg text-[#5A432C] mb-4">Why call or message us?</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-[#D4A24C] mt-0.5">✓</span>
                  Track your delivery status
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4A24C] mt-0.5">✓</span>
                  Report an issue with a delivery
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4A24C] mt-0.5">✓</span>
                  Become a NIDDLE rider
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4A24C] mt-0.5">✓</span>
                  Partner your business with us
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D4A24C] mt-0.5">✓</span>
                  General inquiries & feedback
                </li>
              </ul>
            </div>

            <div className="bg-[#1a1a2e] rounded-3xl p-8 shadow-xl">
              <h3 className="font-bold text-lg text-white mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {["X", "IG", "FB", "WA"].map((s) => (
                  <div key={s} className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-sm font-bold hover:bg-[#D4A24C]/30 hover:scale-110 transition-all cursor-pointer">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
              {sent ? (
                <div className="text-center py-16 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-500">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
                  <p className="text-gray-500 text-sm mb-8">
                    Fill in the form below and we&apos;ll respond within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📋</span>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="How can we help?"
                          required
                          className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-400">💬</span>
                        <textarea
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us more about your inquiry..."
                          required
                          className="w-full border-2 border-gray-200 rounded-2xl p-4 pl-12 text-sm focus:border-[#D4A24C] focus:ring-2 focus:ring-[#D4A24C]/20 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4">{error}</div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-[#5A432C] to-[#4a3520] text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {sending ? "Sending..." : "Send Message →"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ContactInfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}
