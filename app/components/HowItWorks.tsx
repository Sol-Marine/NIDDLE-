export default function HowItWorks() {
  return (
    <section className="py-20">
      <h2 className="text-4xl font-bold text-center mb-10">
        How It Works
      </h2>

      <div className="grid grid-cols-3 gap-6 px-10">
        <div className="border p-6 rounded-lg">
          <h3 className="font-bold">1. Request Pickup</h3>
        </div>

        <div className="border p-6 rounded-lg">
          <h3 className="font-bold">2. Rider Collects Package</h3>
        </div>

        <div className="border p-6 rounded-lg">
          <h3 className="font-bold">3. Package Delivered</h3>
        </div>
      </div>
    </section>
  );
}