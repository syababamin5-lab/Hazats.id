'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import { Trip, formatPrice, formatDate } from '@/components/TripCatalog';
import { Mountain, Calendar, Bus, Users, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function TripDetailPage() {
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`${API_URL}/trips/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setTrip(data);
        else setTrip(null);
      })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 w-1/2 rounded" />
                <div className="h-4 bg-gray-200 w-full rounded" />
                <div className="h-4 bg-gray-200 w-full rounded" />
                <div className="h-4 bg-gray-200 w-3/4 rounded" />
              </div>
              <div className="h-96 bg-gray-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Mountain size={64} className="text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Trip Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Jadwal trip yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
          <Link href="/#trips" className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#D4AF37] transition-colors">
            Lihat Trip Lainnya
          </Link>
        </div>
      </div>
    );
  }

  const isFull = trip.remaining_quota <= 0;
  const filled = trip.max_quota - trip.remaining_quota;
  const quotaPercent = Math.round((filled / trip.max_quota) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-[40vh] md:h-[50vh] w-full bg-black">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={trip.image_url ? { backgroundImage: `url(${trip.image_url})` } : {}}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <Link href="/#trips" className="inline-flex items-center gap-2 text-white/80 hover:text-[#D4AF37] mb-6 transition-colors text-sm font-medium">
                <ArrowLeft size={16} /> Kembali ke Katalog
              </Link>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {trip.difficulty}
                </span>
                {trip.trip_type && (
                  <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {trip.trip_type}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-2 leading-tight">
                {trip.mountain_name}
              </h1>
              {trip.via && (
                <p className="text-xl md:text-2xl text-gray-300 font-light">
                  via <span className="font-medium text-white">{trip.via}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column: Description */}
            <div className="lg:col-span-2 space-y-10">
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 font-heading border-b border-gray-100 pb-4">Tentang Perjalanan Ini</h2>
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {trip.description || 'Tidak ada deskripsi untuk trip ini.'}
                </div>
              </section>
            </div>

            {/* Right Column: Floating Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sticky top-24">
                <div className="text-3xl font-bold text-[#D4AF37] mb-6 border-b border-gray-100 pb-6 text-center">
                  {formatPrice(trip.price)}
                </div>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Tanggal</p>
                      <p className="font-medium text-gray-800 text-sm">
                        {formatDate(trip.departure_date)} 
                        {trip.return_date && ` — ${formatDate(trip.return_date)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Titik Kumpul</p>
                      <p className="font-medium text-gray-800 text-sm">{trip.meeting_point || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Bus size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Transportasi</p>
                      <p className="font-medium text-gray-800 text-sm">{trip.transport || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1 pr-2">
                      <div className="flex justify-between items-end mb-1.5">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Sisa Kuota</p>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : quotaPercent >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {trip.remaining_quota}/{trip.max_quota}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${quotaPercent >= 80 ? 'bg-red-500' : quotaPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => !isFull && setShowBooking(true)}
                  disabled={isFull}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                    isFull
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-[#D4AF37] hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {isFull ? 'KUOTA PENUH' : 'PESAN SEKARANG'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          trip={trip}
          onClose={() => setShowBooking(false)}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}

      {/* Basic Footer for layout completeness */}
      <footer className="bg-black text-white py-8 text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 Hazats Adventure. Dibuat dengan ❤️ untuk pendaki.</p>
      </footer>
    </div>
  );
}
