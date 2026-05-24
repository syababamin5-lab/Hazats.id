import Navbar from '@/components/Navbar';
import { Map, Award } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getGuides() {
  try {
    const res = await fetch(`${API_URL}/guides`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      
      {/* Header */}
      <section className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[#D4AF37] font-semibold tracking-[0.2em] uppercase text-xs mb-4 block">
            Hazats Adventure
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Pemandu Profesional
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Perjalanan Anda didampingi oleh para ahli gunung bersertifikat yang telah berpengalaman bertahun-tahun menjelajahi keindahan dan menghadapi tantangan alam Nusantara.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {guides.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              Belum ada profil pemandu yang dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((g: any) => (
                <div key={g.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 group">
                  <div 
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url(${g.photo_url || 'https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?auto=format&fit=crop&q=80'})` }}
                  />
                  <div className="p-8 relative">
                    <div className="w-12 h-12 bg-black text-[#D4AF37] rounded-full flex items-center justify-center absolute -top-6 right-8 shadow-lg group-hover:scale-110 transition-transform">
                      <Award size={24} />
                    </div>
                    <h3 className="font-heading font-bold text-2xl mb-2">{g.name}</h3>
                    <div className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
                      <Map size={14} /> Official Guide
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {g.history}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
