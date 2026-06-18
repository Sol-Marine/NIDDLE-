import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/front-page.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/90 via-[#1a1a2e]/70 to-[#1a1a2e]/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,162,76,0.10),transparent_60%)]" />

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24 relative w-full">
        <div className="max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 border border-[#D4A24C]/50 bg-[#D4A24C]/15 backdrop-blur-sm rounded-full px-4 md:px-5 py-2 text-xs md:text-sm text-[#D4A24C] font-medium mb-6 md:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#D4A24C] animate-pulse" />
            Same-day delivery across Lagos
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">
              Fast. Reliable.
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#D4A24C] to-[#E8B86D] bg-clip-text text-transparent">
              Delivered.
            </span>
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-300 max-w-lg leading-relaxed">
            Niddle makes city deliveries simple and stress-free.
            From pickup to drop-off, we&apos;ve got Lagos covered.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-8 md:mt-10">
            <Link href="/send-package">
              <button className="bg-[#D4A24C] text-[#1a1a2e] px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 text-sm md:text-base">
                Send Package →
              </button>
            </Link>

            <Link href="/track">
              <button className="border-2 border-white/30 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold hover:border-[#D4A24C] hover:text-[#D4A24C] transition-all duration-300 backdrop-blur-sm text-sm md:text-base">
                Track Delivery
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8 mt-10 md:mt-14 pt-8 md:pt-10 border-t border-white/10 max-w-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4A24C]/20 flex items-center justify-center shrink-0">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Same-Day</h3>
                <p className="text-xs text-gray-400">Delivered within hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4A24C]/20 flex items-center justify-center shrink-0">
                <span className="text-lg">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Live Tracking</h3>
                <p className="text-xs text-gray-400">Real-time updates</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4A24C]/20 flex items-center justify-center shrink-0">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Safe & Secure</h3>
                <p className="text-xs text-gray-400">Handled with care</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
