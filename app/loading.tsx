export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#faf7f2] flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-[#5A432C] mb-4">NIDDLE</h1>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 rounded-full bg-[#D4A24C] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 rounded-full bg-[#C2533D] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 rounded-full bg-[#5A432C] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
