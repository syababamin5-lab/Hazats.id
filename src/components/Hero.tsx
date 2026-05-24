'use client';

import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Index');

  const scrollToTrips = () => {
    document.getElementById('trips')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[90vh] min-h-[640px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop")',
          filter: 'grayscale(55%) brightness(0.5)'
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70 z-[1]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        {/* Label premium */}
        <div className="inline-flex items-center gap-2 border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-semibold tracking-[0.3em] uppercase px-5 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full inline-block" />
          Premium Mountain Adventure · West Java
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          {t('title')}
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={scrollToTrips}
            className="bg-[#D4AF37] hover:bg-[#c9a227] text-black px-8 py-4 rounded-full font-bold text-base transition-all transform hover:scale-105 shadow-lg shadow-[#D4AF37]/20"
          >
            {t('cta')} →
          </button>
          <a
            href="/register"
            className="border border-white/40 hover:border-white text-white px-8 py-4 rounded-full font-medium text-base transition-all hover:bg-white/10"
          >
            Daftar Gratis
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="w-px h-14 bg-gradient-to-b from-transparent via-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
