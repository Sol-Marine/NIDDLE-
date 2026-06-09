export default function Hero() {
  return (
    <section className="px-10 py-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <div className="max-w-xl">
          <h1 className="text-7xl font-bold text-[#5A432C] mb-6">
            Fast Bicycle Delivery
          </h1>

          <p className="text-2xl text-gray-600 mb-8">
            Same-day deliveries across your city.
          </p>

          <div className="flex gap-4">
            <button className="bg-[#5A432C] text-white px-8 py-4 rounded-lg shadow-md">
              Send Package
            </button>

            <button className="border-2 border-[#5A432C] text-[#5A432C] px-8 py-4 rounded-lg">
              Track Delivery
            </button>
          </div>
        </div>

        <div>
          <img
            src="/bicycle-rider.jpeg"
            alt="Bicycle Rider"
            className="w-[500px]"
          />
        </div>

      </div>
    </section>
  );
}