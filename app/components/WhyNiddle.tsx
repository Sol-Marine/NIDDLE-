export default function WhyNiddle() {
  return (
    <section className="py-24 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4A24C]/8 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">
            Why Choose Us
          </span>
          <h2 className="text-5xl font-bold text-[#5A432C] mb-4">
            Why Niddle
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            The smarter way to move packages around Lagos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReasonCard
            icon="⚡"
            title="Fast"
            description="Same-day deliveries across all Lagos zones. We beat traffic with bicycles."
            gradient="from-amber-50 to-orange-50"
            borderColor="border-amber-200"
            iconBg="bg-amber-100"
          />
          <ReasonCard
            icon="💰"
            title="Affordable"
            description="Low delivery costs with transparent pricing. No hidden fees."
            gradient="from-emerald-50 to-teal-50"
            borderColor="border-emerald-200"
            iconBg="bg-emerald-100"
          />
          <ReasonCard
            icon="🌱"
            title="Eco-Friendly"
            description="Zero-emission bicycle deliveries. Good for you, good for Lagos."
            gradient="from-sky-50 to-blue-50"
            borderColor="border-sky-200"
            iconBg="bg-sky-100"
          />
          <ReasonCard
            icon="🔒"
            title="Secure"
            description="Safe package handling with real-time tracking and confirmation."
            gradient="from-purple-50 to-pink-50"
            borderColor="border-purple-200"
            iconBg="bg-purple-100"
          />
        </div>
      </div>
    </section>
  );
}

function ReasonCard({
  icon,
  title,
  description,
  gradient,
  borderColor,
  iconBg,
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-8 rounded-3xl border ${borderColor} shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group`}>
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
