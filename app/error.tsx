"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#faf7f2] flex items-center justify-center z-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-[#D4A24C] to-[#C2533D] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
