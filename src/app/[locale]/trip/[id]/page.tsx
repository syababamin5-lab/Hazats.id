'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import { Trip, formatPrice, formatDate } from '@/components/TripCatalog';
import { Mountain, Calendar, Bus, Users, MapPin, ArrowLeft, ClipboardList, Map, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function TripDetailPage() {
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showInclude, setShowInclude] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  const getDaysCount = () => {
    if (!trip || !trip.departure_date || !trip.return_date) return 1;
    const dep = new Date(trip.departure_date);
    const ret = new Date(trip.return_date);
    const diffTime = Math.abs(ret.getTime() - dep.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const daysCount = getDaysCount();

  const renderItineraryContent = () => {
    if (!trip) return null;
    if (daysCount <= 1) {
      return (
        <div className="space-y-6">
          <div className="border-l-2 border-[#D4AF37] ml-3 pl-6 space-y-6 relative">
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">06.00 - 07.00</p>
              <h5 className="font-semibold text-gray-800 text-sm">Kumpul di Meeting Point & Briefing</h5>
              <p className="text-xs text-gray-500 mt-1">Registrasi peserta, perkenalan tim, dan briefing singkat keselamatan.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">07.00 - 09.00</p>
              <h5 className="font-semibold text-gray-800 text-sm">Perjalanan ke Basecamp Pendakian</h5>
              <p className="text-xs text-gray-500 mt-1">Perjalanan darat menuju titik awal pendakian via jalur resmi.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">09.00 - 09.30</p>
              <h5 className="font-semibold text-gray-800 text-sm">Registrasi Simaksi & Persiapan Akhir</h5>
              <p className="text-xs text-gray-500 mt-1">Pengecekan perlengkapan kelompok & perizinan pendakian.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">09.30 - 13.00</p>
              <h5 className="font-semibold text-gray-800 text-sm">Pendakian Menuju Puncak / Spot Utama</h5>
              <p className="text-xs text-gray-500 mt-1">Pendakian santai ditemani guide profesional, menikmati pemandangan alam.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">13.00 - 14.30</p>
              <h5 className="font-semibold text-gray-800 text-sm">Makan Siang & Sesi Foto di Puncak</h5>
              <p className="text-xs text-gray-500 mt-1">Istirahat makan siang hangat, bersantai, dan mendokumentasikan momen.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">14.30 - 17.30</p>
              <h5 className="font-semibold text-gray-800 text-sm">Turun Kembali ke Basecamp</h5>
              <p className="text-xs text-gray-500 mt-1">Perjalanan turun dengan tetap mengutamakan faktor keselamatan.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
              <p className="text-xs font-bold text-[#D4AF37]">17.30 - 19.30</p>
              <h5 className="font-semibold text-gray-800 text-sm">Kembali ke Meeting Point Awal</h5>
              <p className="text-xs text-gray-500 mt-1">Perjalanan pulang dan perpisahan. Trip selesai!</p>
            </div>
          </div>
        </div>
      );
    } else if (daysCount === 2) {
      return (
        <div className="space-y-6">
          <div>
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Hari 1 - Pendakian & Camp</span>
            <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-5 relative">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-black w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">07.00 - 08.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Kumpul di Meeting Point & Registrasi</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">08.00 - 11.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Perjalanan Menuju Basecamp {trip.mountain_name}</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">11.00 - 13.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Makan Siang & Pembagian Perlengkapan</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">13.00 - 17.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Pendakian Menuju Camp Area</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">17.00 - 19.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Mendirikan Tenda & Sunset Momen</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">19.00 - Selesai</p>
                <h5 className="font-semibold text-gray-800 text-sm">Makan Malam Bersama & Istirahat</h5>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Hari 2 - Summit & Kembali</span>
            <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-5 relative">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-emerald-500 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-emerald-600">03.30 - 04.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Bangun & Persiapan Summit Attack</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">04.00 - 06.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Perjalanan ke Puncak & Sunrise Momen</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">06.00 - 07.30</p>
                <h5 className="font-semibold text-gray-800 text-sm">Sesi Dokumentasi di Puncak</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">07.30 - 09.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Turun ke Tenda, Sarapan, & Packing</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">09.00 - 13.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Perjalanan Turun ke Basecamp</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-[#D4AF37]">13.00 - Selesai</p>
                <h5 className="font-semibold text-gray-800 text-sm">Makan Siang Basecamp & Pulang ke Mepo</h5>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div>
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Hari 1 - Basecamp & Camp Awal</span>
            <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-4 relative">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-black w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">08.00 - 14.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Mepo, Perjalanan & Registrasi Simaksi</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">14.00 - 15.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Packing & Briefing Akhir</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">15.00 - 18.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Pendakian Santai ke Camp Awal</h5>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Hari 2 - Pendakian ke Camp Utama</span>
            <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-4 relative">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-amber-500 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-amber-600">07.30 - 13.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Pendakian Menuju Camp Utama</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">13.00 - 14.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Makan Siang di Jalur Pendakian</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">14.00 - 16.30</p>
                <h5 className="font-semibold text-gray-800 text-sm">Tiba di Campsite Utama & Camp Rest</h5>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Hari 3 - Summit & Perjalanan Pulang</span>
            <div className="border-l-2 border-gray-100 ml-3 pl-6 space-y-4 relative">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-emerald-500 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-emerald-600">03.00 - 06.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Summit Attack ke Puncak {trip.mountain_name}</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">06.00 - 08.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Sunrise & Foto Bersama di Puncak</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-gray-300 w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-gray-400">10.00 - 14.00</p>
                <h5 className="font-semibold text-gray-800 text-sm">Packing Tenda & Turun Ke Basecamp</h5>
              </div>
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 bg-[#D4AF37] w-4 h-4 rounded-full border-4 border-white" />
                <p className="text-xs font-bold text-[#D4AF37]">14.00 - Selesai</p>
                <h5 className="font-semibold text-gray-800 text-sm">Makan Siang & Perjalanan Pulang ke Mepo</h5>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

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

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => setShowInclude(true)}
                    className="py-3 px-2 rounded-xl border border-gray-200 hover:border-black text-gray-700 hover:text-black font-semibold text-xs transition-all duration-200 text-center flex items-center justify-center gap-1.5"
                  >
                    <ClipboardList size={14} className="text-[#D4AF37]" />
                    Include & Exclude
                  </button>
                  <button
                    onClick={() => setShowItinerary(true)}
                    className="py-3 px-2 rounded-xl border border-gray-200 hover:border-black text-gray-700 hover:text-black font-semibold text-xs transition-all duration-200 text-center flex items-center justify-center gap-1.5"
                  >
                    <Map size={14} className="text-[#D4AF37]" />
                    Itinerary
                  </button>
                </div>
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

      {/* Include & Exclude Modal */}
      {showInclude && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInclude(false)} />
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-black text-white px-6 py-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Fasilitas Trip</p>
                <h3 className="font-heading font-bold text-xl">Include & Exclude</h3>
              </div>
              <button
                onClick={() => setShowInclude(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="font-bold text-sm text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">✓</span>
                  Fasilitas Termasuk (Include)
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Tiket masuk (Simaksi) resmi Taman Nasional Gunung {trip.mountain_name}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Guide / Pemandu berlisensi resmi & Porter Kelompok</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Peralatan Camp kelompok (Tenda kapasitas 4 isi 3, alat masak lengkap)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Makan & logistik selama pendakian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Transportasi PP ({trip.transport || 'Avanza/Elf'}) dari Meeting Point</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>P3K Standar & penanganan emergency awal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>Dokumentasi perjalanan (foto & video selama trip)</span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h4 className="font-bold text-sm text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">✕</span>
                  Tidak Termasuk (Exclude)
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>Perlengkapan pribadi (sleeping bag, matras, jaket tebal, jas hujan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>Cemilan/snack pribadi & air minum tambahan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>Obat-obatan pribadi yang bersifat khusus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>Porter Pribadi (jika ingin barang pribadinya dibawakan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span>
                    <span>Tips sukarela untuk Guide dan Driver</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowInclude(false)}
                className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Modal */}
      {showItinerary && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowItinerary(false)} />
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-black text-white px-6 py-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Rencana Perjalanan</p>
                <h3 className="font-heading font-bold text-xl">Trip Itinerary</h3>
              </div>
              <button
                onClick={() => setShowItinerary(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {renderItineraryContent()}
            </div>
            
            <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowItinerary(false)}
                className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Footer for layout completeness */}
      <footer className="bg-black text-white py-8 text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 Hazats Adventure. Dibuat dengan ❤️ untuk pendaki.</p>
      </footer>
    </div>
  );
}
