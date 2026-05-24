import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import TripCatalog from '@/components/TripCatalog';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Services />
        <TripCatalog />
      </main>
      <footer className="bg-black text-white py-12 text-center">
        <p className="text-gray-400 text-sm">© 2026 Hazats Adventure. All rights reserved.</p>
      </footer>
    </>
  );
}
