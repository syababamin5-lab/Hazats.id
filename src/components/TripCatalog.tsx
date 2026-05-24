import {useTranslations} from 'next-intl';
import {Calendar, Users, Bus} from 'lucide-react';

export default function TripCatalog() {
  const t = useTranslations('Trips');

  const trips = [
    {
      id: 1,
      name: 'Gunung Papandayan',
      difficulty: 'Pemula',
      date: '10 - 11 Agustus 2026',
      quota: '12 / 15 Orang',
      transport: 'Hiace Commuter (AC)',
      price: 'Rp 450.000',
      image: 'https://images.unsplash.com/photo-1544605051-fb18e9a265b4?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Gunung Gede',
      difficulty: 'Menengah',
      date: '17 - 18 Agustus 2026',
      quota: '5 / 10 Orang',
      transport: 'Elf Long (AC)',
      price: 'Rp 550.000',
      image: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?q=80&w=2134&auto=format&fit=crop'
    }
  ];

  return (
    <section className="py-20 bg-[#FAFAFA]" id="trips">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-4xl font-bold text-center mb-12">{t('title')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all group">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" style={{backgroundImage: `url(${trip.image})`}} />
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                  {trip.difficulty}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading text-2xl font-bold">{trip.name}</h3>
                  <span className="font-bold text-xl text-[#D4AF37]">{trip.price}</span>
                </div>
                
                <div className="space-y-3 mb-6 text-gray-600">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-400" />
                    <span>{trip.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-gray-400" />
                    <span>{t('quota')}: <strong className="text-black">{trip.quota}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bus size={18} className="text-gray-400" />
                    <span>{t('transport')}: <strong className="text-black">{trip.transport}</strong></span>
                  </div>
                </div>
                
                <button className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-colors">
                  {t('book')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
