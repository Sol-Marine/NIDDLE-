import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">📦</div>
        <h1 className="text-6xl font-extrabold text-[#5A432C] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
        <p className="text-gray-500 mb-8">
          Looks like this package got lost in transit. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:border-[#D4A24C] hover:text-[#D4A24C] transition-all duration-200"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
