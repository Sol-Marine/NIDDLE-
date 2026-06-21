"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const services = [
  { icon: "🍔", title: "Food Delivery", desc: "Fast delivery from your favorite restaurants to your doorstep. Hot food, delivered hot." },
  { icon: "📦", title: "Parcel Delivery", desc: "Secure same-day delivery for documents, packages, and important items across Lagos." },
  { icon: "🛒", title: "Grocery Delivery", desc: "Shop from local stores and get your groceries delivered fresh to your home." },
  { icon: "🎁", title: "Gift Delivery", desc: "Surprise your loved ones with same-day gift delivery anywhere in Lagos." },
  { icon: "📱", title: "Electronics", desc: "Careful handling and secure delivery for phones, laptops, and gadgets." },
  { icon: "👕", title: "Clothing & Fashion", desc: "From boutiques to your wardrobe — same-day fashion delivery across Lagos." },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">What We Do</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A432C] mb-4">Our Services</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fast, reliable bicycle delivery across every corner of Lagos. Pick a service and get started.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#D4A24C]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-[#D4A24C]/10 flex items-center justify-center mb-5">
                <span className="text-3xl">{s.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-[#5A432C] to-[#4a3520]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to send a package?</h2>
          <p className="text-white/70 mb-8">Get a free quote in 60 seconds. No account required.</p>
          <Link href="/send-package" className="inline-block bg-[#D4A24C] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
            Send a Package →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
