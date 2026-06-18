import Image from "next/image";
import Link from "next/link";

export default function RiderSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-6 bg-gradient-to-r from-[#D4A24C]/10 to-[#C2533D]/5 rounded-[3rem] blur-2xl" />
            <div className="relative animate-fade-in-up">
              <Image
                src="/Bicycle-rider.jpeg"
                alt="Delivery Rider"
                width={700}
                height={700}
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 animate-fade-in-up">
            <span className="text-sm font-semibold text-[#D4A24C] uppercase tracking-widest">
              Our Riders
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
              Fast deliveries by
              <br />
              <span className="text-[#D4A24C]">bicycle riders</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              Our riders navigate Lagos traffic with speed and care,
              getting your packages where they need to be — same day.
            </p>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-xl">🌿</div>
                <div>
                  <p className="font-semibold text-gray-900">Eco-Friendly</p>
                  <p className="text-sm text-gray-500">Zero emissions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl">⚡</div>
                <div>
                  <p className="font-semibold text-gray-900">Super Fast</p>
                  <p className="text-sm text-gray-500">Same-day delivery</p>
                </div>
              </div>
            </div>

            <Link href="/send-package">
              <button className="mt-10 bg-[#5A432C] text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95">
                Send With Us →
              </button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
