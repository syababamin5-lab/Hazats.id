import {useTranslations} from 'next-intl';

export default function Hero() {
  const t = useTranslations('Index');

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image - Monochromatic/Desaturated */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop")',
          filter: 'grayscale(60%) brightness(0.6)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          {t('title')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light">
          {t('description')}
        </p>
        <button className="bg-[#D4AF37] hover:bg-[#b8952b] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
          {t('cta')}
        </button>
      </div>
    </section>
  );
}
