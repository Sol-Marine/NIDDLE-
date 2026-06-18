import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RiderSection from "./components/RiderSection";
import HowItWorks from "./components/HowItWorks";
import WhyNiddle from "./components/WhyNiddle";
import Coverage from "./components/Coverage";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen text-gray-900">
      <Navbar />
      <Hero />
      <RiderSection />
      <HowItWorks />
      <WhyNiddle />
      <Coverage />
      <Testimonials />
      <Footer />
    </main>
  );
}