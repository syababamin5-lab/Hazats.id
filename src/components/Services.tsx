import { useTranslations } from 'next-intl';
import { Map, Tent, Utensils, Car } from 'lucide-react';
import Link from 'next/link';

export default function Services() {
  const t = useTranslations('Services');

  const services = [
    { id: 'guide', icon: Map, title: t('guide'), desc: t('guide_desc') },
    { id: 'tent', icon: Tent, title: t('tent'), desc: t('tent_desc') },
    { id: 'cooking', icon: Utensils, title: t('cooking'), desc: t('cooking_desc') },
    { id: 'transport', icon: Car, title: t('transport'), desc: t('transport_desc') },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37]">
            All-Inclusive
          </span>
          <h2 className="font-heading text-4xl font-bold mt-3">{t('title')}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.id}
                href={svc.id === 'guide' ? '/guides' : '#'}
                className={`group flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 transition-all duration-300 ${svc.id === 'guide' ? 'hover:border-[#D4AF37] hover:bg-black hover:text-white cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1' : 'hover:border-black/10 hover:bg-black hover:text-white cursor-default'}`}
              >
                <div className="w-14 h-14 bg-black group-hover:bg-[#D4AF37] text-white rounded-full flex items-center justify-center mb-4 transition-colors duration-300 shadow-sm">
                  <Icon size={24} />
                </div>
                <h3 className="font-heading font-semibold text-base mb-1">{svc.title}</h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-300 leading-relaxed transition-colors">
                  {svc.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
