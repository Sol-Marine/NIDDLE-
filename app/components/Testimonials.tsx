export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4A24C]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-10 md:mb-16">
          <span className="inline-block text-sm font-semibold text-[#D4A24C] uppercase tracking-widest mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#5A432C] mb-4">
            What Lagos Says
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Hear from our customers across the city.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-8">
          <TestimonialCard
            name="Sarah L."
            location="Victoria Island"
            rating={5}
            text="Fast and reliable delivery service. My package arrived the same day from VI to Ikeja!"
          />
          <TestimonialCard
            name="Mardon I."
            location="Lekki"
            rating={5}
            text="Affordable pricing and professional riders. Niddle is my go-to for all deliveries."
          />
          <TestimonialCard
            name="Suost R."
            location="Surulere"
            rating={5}
            text="Excellent customer support and delivery tracking. They make Lagos delivery easy."
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  name,
  location,
  rating,
  text,
}: {
  name: string;
  location: string;
  rating: number;
  text: string;
}) {
  return (
    <div className="bg-white border border-gray-100 p-5 md:p-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
      <div className="absolute top-0 left-8 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#D4A24C]/10 flex items-center justify-center">
        <span className="text-[#D4A24C] text-lg">&ldquo;</span>
      </div>

      <div className="flex items-center gap-2 mb-4 mt-2">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-[#D4A24C] text-lg">★</span>
        ))}
      </div>

      <p className="text-gray-600 leading-relaxed mb-6">
        {text}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5A432C] to-[#D4A24C] flex items-center justify-center text-white text-sm font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>
    </div>
  );
}
