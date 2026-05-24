'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Users, Bus } from 'lucide-react';
import { useEffect, useState } from 'react';
import BookingModal from './BookingModal';

export interface Trip {
  id: number;
  mountain_name: string;
  via?: string;
  description: string;
  difficulty: string;
  departure_date: string;
  return_date: string;
  max_quota: number;
  remaining_quota: number;
  transport: string;
  price: number;
  meeting_point: string;
  image_url: string;
  is_active: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;

export function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(price);
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function difficultyStyle(d: string) {
  if (d === 'Pemula') return 'bg-emerald-500 text-white';
  if (d === 'Menengah') return 'bg-amber-500 text-white';
  return 'bg-red-500 text-white';
}

export default function TripCatalog() {
  const t = useTranslations('Trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/trips`)
      .then(res => res.json())
      .then(data => { setTrips(Array.isArray(data) ? data : []); })
      .catch(() => { setTrips([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-[#FAFAFA]" id="trips">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37]">
            Open Trip · Jawa Barat
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 mb-4">
            {t('title')}
          </h2>
          <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto" />
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-4/5" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Belum ada jadwal trip aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => {
              const filled = trip.max_quota - trip.remaining_quota;
              const quotaPercent = Math.round((filled / trip.max_quota) * 100);
              const isFull = trip.remaining_quota <= 0;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Trip Image */}
                  <div className="h-56 overflow-hidden relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${trip.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070'})`,
                        filter: 'grayscale(20%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Difficulty badge */}
                    <div className={`absolute top-4 left-4 ${difficultyStyle(trip.difficulty)} px-3 py-1 rounded-full text-xs font-semibold shadow`}>
                      {trip.difficulty}
                    </div>

                    {/* Full overlay */}
                    {isFull && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl tracking-widest">PENUH</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-xl font-bold leading-tight">{trip.mountain_name} {trip.via && <span className="text-base font-normal text-gray-500">via {trip.via}</span>}</h3>
                      <span className="font-bold text-[#D4AF37] text-base whitespace-nowrap ml-3">
                        {formatPrice(trip.price)}
                      </span>
                    </div>

                    {trip.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>
                    )}

                    <div className="space-y-2.5 mb-5 text-gray-600 text-sm flex-1">
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                        <span>
                          {formatDate(trip.departure_date)}
                          {trip.return_date && ` — ${formatDate(trip.return_date)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Bus size={14} className="text-gray-400 flex-shrink-0" />
                        <span>{trip.transport}</span>
                      </div>

                      {/* Quota progress */}
                      <div className="flex items-start gap-2.5">
                        <Users size={14} className="text-gray-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span>{t('quota')}</span>
                            <span className={`font-semibold ${isFull ? 'text-red-500' : quotaPercent >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {trip.remaining_quota}/{trip.max_quota} tersisa
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${quotaPercent >= 80 ? 'bg-red-400' : quotaPercent >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                              style={{ width: `${quotaPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => !isFull && setSelectedTrip(trip)}
                      disabled={isFull}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-black hover:bg-[#D4AF37] text-white hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {isFull ? t('quota_full') : t('book')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedTrip && (
        <BookingModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}
    </section>
  );
}
