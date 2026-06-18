import Image from "next/image";

const lagosZones = [
  "Ikeja", "Victoria Island", "Lekki", "Surulere",
  "Yaba", "Ikoyi", "GRA", "Oshodi",
];

export default function Coverage() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#D4A24C]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-10 md:mb-16 animate-fade-in-up">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">
            Our Network
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#5A432C] mb-4">
            Lagos Coverage Zone
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fast bicycle delivery across our service zones in Lagos.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 md:gap-8 items-start">
          <div className="lg:col-span-3 relative group">
            <div className="relative h-[280px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/map-image.jpg"
                alt="Lagos Coverage Map"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Lagos Island to Mainland
                </h3>
                <p className="text-white/80">
                  Connecting every corner of Lagos with bicycle-fast delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lagosZones.map((zone, i) => (
              <div
                key={zone}
                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:border-[#D4A24C]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center mb-3 group-hover:bg-[#D4A24C]/20 transition-colors">
                  <span className="text-lg">📍</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{zone}</h4>
                <p className="text-xs text-gray-500">Same-day delivery</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
