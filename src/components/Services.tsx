import {useTranslations} from 'next-intl';
import {Map, Tent, Utensils, Car} from 'lucide-react';

export default function Services() {
  const t = useTranslations('Services');
  
  const services = [
    { id: 'guide', icon: Map, title: t('guide') },
    { id: 'tent', icon: Tent, title: t('tent') },
    { id: 'cooking', icon: Utensils, title: t('cooking') },
    { id: 'transport', icon: Car, title: t('transport') },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.id} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                  <Icon size={28} />
                </div>
                <h3 className="font-heading font-semibold text-lg">{svc.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
