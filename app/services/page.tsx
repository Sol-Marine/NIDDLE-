// app/services/page.tsx

import {
  Bike,
  Package,
  ShoppingCart,
  Users,
  Shirt,
  CheckCircle,
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Food Delivery",
      icon: <Bike size={40} />,
      description:
        "Fast and reliable food delivery from your favorite restaurants straight to your doorstep.",
    },
    {
      title: "Parcel Delivery",
      icon: <Package size={40} />,
      description:
        "Secure and same-day delivery for documents, packages, and important items.",
    },
    {
      title: "Grocery Delivery",
      icon: <ShoppingCart size={40} />,
      description:
        "Shop from local stores and receive your groceries conveniently at home.",
    },
    {
      title: "Rider Partnership",
      icon: <Users size={40} />,
      description:
        "Join our growing rider network and earn income with flexible schedules.",
    },
    {
      title: "Laundry Delivery",
      icon: <Shirt size={40} />,
      description:
        "Pickup and delivery laundry services designed for convenience and speed.",
    },
  ];

  const reasons = [
    "Fast & Reliable Deliveries",
    "Affordable Pricing",
    "Professional Riders",
    "Real-Time Tracking",
    "Eco-Friendly Transportation",
    "Excellent Customer Support",
  ];

  return (
    <main className="relative bg-[#111111] text-white min-h-screen overflow-hidden">
      <section className="py-24 px-6">
  <div className="max-w-6xl mx-auto text-center">
    <span className="text-[#c89b3c] uppercase tracking-widest font-semibold">
      Our Services
    </span>

    <h1 className="text-5xl md:text-7xl font-bold mt-4 mb-6">
      Moving What Matters,
      <span className="text-[#c89b3c]"> Faster.</span>
    </h1>

    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
      From food and groceries to parcels and laundry,
      NIDDLE delivers convenience right to your doorstep
      through trusted riders and smart logistics.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
      <button className="bg-[#c89b3c] text-black px-8 py-4 rounded-xl font-semibold hover:scale-105 transition">
        Book a Delivery
      </button>

      <button className="border border-[#c89b3c] px-8 py-4 rounded-xl font-semibold hover:bg-[#c89b3c] hover:text-black transition">
        Become a Rider
      </button>
    </div>
  </div>
</section>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#c89b3c]/10 blur-[150px]" />

<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#c89b3c]/10 blur-[150px]" />
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our Services
          </h1>

          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            NIDDLE connects people, businesses, and communities through
            reliable delivery solutions powered by technology and professional
            riders.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="
bg-[#1b1b1b]/80
backdrop-blur-md
border border-[#2a2a2a]
rounded-3xl
p-8
hover:border-[#c89b3c]
hover:shadow-[0_0_30px_rgba(200,155,60,0.25)]
hover:-translate-y-2
transition-all
duration-300
"
              >
                <div className="text-[#c89b3c] mb-5">
                  {service.icon}
                </div>

                <h3 className="text-2xl font-semibold mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            <div className="bg-[#1b1b1b] rounded-3xl p-8 text-center">
              <h3 className="text-4xl font-bold text-[#c89b3c]">10K+</h3>
              <p className="text-gray-400 mt-2">Deliveries Completed</p>
            </div>

            <div className="bg-[#1b1b1b] rounded-3xl p-8 text-center">
              <h3 className="text-4xl font-bold text-[#c89b3c]">500+</h3>
              <p className="text-gray-400 mt-2">Active Riders</p>
            </div>

            <div className="bg-[#1b1b1b] rounded-3xl p-8 text-center">
              <h3 className="text-4xl font-bold text-[#c89b3c]">50+</h3>
              <p className="text-gray-400 mt-2">Partner Stores</p>
            </div>

            <div className="bg-[#1b1b1b] rounded-3xl p-8 text-center">
              <h3 className="text-4xl font-bold text-[#c89b3c]">98%</h3>
              <p className="text-gray-400 mt-2">Customer Satisfaction</p>
            </div>

          </div>
        </div>
      </section>
      {/* Why Choose NIDDLE */}
      <section className="bg-[#171717] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-14">
            Why Choose NIDDLE?
          </h2>
<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-16">
      How It Works
    </h2>

    <div className="grid md:grid-cols-3 gap-10">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#c89b3c] text-black rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">
          1
        </div>

        <h3 className="text-xl font-semibold mb-3">
          Place Your Order
        </h3>

        <p className="text-gray-400">
          Request a delivery through NIDDLE in just a few clicks.
        </p>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-[#c89b3c] text-black rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">
          2
        </div>

        <h3 className="text-xl font-semibold mb-3">
          Rider Pickup
        </h3>

        <p className="text-gray-400">
          A nearby rider is assigned and picks up your item.
        </p>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-[#c89b3c] text-black rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">
          3
        </div>

        <h3 className="text-xl font-semibold mb-3">
          Fast Delivery
        </h3>

        <p className="text-gray-400">
          Your order arrives safely and on time.
        </p>
      </div>
    </div>
  </div>
</section>
          <div className="grid md:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-[#202020] p-5 rounded-2xl"
              >
                <CheckCircle
                  size={24}
                  className="text-[#c89b3c]"
                />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>

          <p className="text-gray-400 mb-10">
            Whether you need deliveries or want to become a rider,
            NIDDLE is here to move your world forward.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-[#c89b3c] text-black px-8 py-4 rounded-xl font-semibold hover:scale-105 transition">
              Book a Delivery
            </button>

            <button className="border border-[#c89b3c] px-8 py-4 rounded-xl font-semibold hover:bg-[#c89b3c] hover:text-black transition">
              Become a Rider
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}