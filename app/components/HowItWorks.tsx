export default function HowItWorks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#D4A24C]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">
            Simple Process
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fast and simple delivery in three easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <StepCard
            number="01"
            icon="📦"
            title="Request Pickup"
            description="Tell us where your package is and where it's going. Schedule a pickup from your location."
          />
          <StepCard
            number="02"
            icon="🚴"
            title="Rider Collects"
            description="Our rider arrives, picks up your package, and heads straight to the destination."
          />
          <StepCard
            number="03"
            icon="✅"
            title="Package Delivered"
            description="Delivery is completed and confirmed. Track every step in real-time."
          />

          <div className="hidden md:block absolute top-1/3 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-[#D4A24C]/30 via-[#D4A24C] to-[#D4A24C]/30 -z-10" />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative group">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A24C]/15 to-[#C2533D]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl">{icon}</span>
        </div>
        <span className="text-sm font-bold text-[#D4A24C] tracking-wider">{number}</span>
        <h3 className="font-bold text-xl mt-2 mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
