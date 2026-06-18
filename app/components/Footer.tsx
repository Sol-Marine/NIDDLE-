import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#D4A24C] mb-4">
              NIDDLE
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fast bicycle delivery across Lagos. Connecting your packages to their destinations, same day.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link href="/" className="hover:text-[#D4A24C] transition-colors">Home</Link>
              <Link href="/services" className="hover:text-[#D4A24C] transition-colors">Services</Link>
              <Link href="/pricing" className="hover:text-[#D4A24C] transition-colors">Get a Quote</Link>
              <Link href="/contact" className="hover:text-[#D4A24C] transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Coverage
            </h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <span>Ikeja</span>
              <span>Victoria Island</span>
              <span>Lekki</span>
              <span>Surulere</span>
              <span>Ikoyi</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <span>Lagos, Nigeria</span>
              <span>hello@niddle.com</span>
              <span>+234 800 NIDDLE</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} NIDDLE. All rights reserved.</p>
          <p>Delivering across Lagos, Nigeria.</p>
        </div>
      </div>
    </footer>
  );
}
