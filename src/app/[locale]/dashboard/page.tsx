'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LogOut, Map, CreditCard, ChevronRight, Upload, CheckCircle, Calendar, Bus, AlertCircle, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Booking {
  id: number;
  status: string;
  payment_proof_url: string | null;
  created_at: string;
  trip: {
    id: number;
    mountain_name: string;
    difficulty: string;
    departure_date: string;
    return_date: string;
    price: number;
    transport: string;
    meeting_point: string;
    image_url: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('Dashboard');
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-red-50 text-red-500 border-red-200',
  };
  const labels: Record<string, string> = {
    pending: t('status_pending'),
    confirmed: t('status_confirmed'),
    cancelled: t('status_cancelled'),
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ name: string; pendaki_id: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadDoneId, setUploadDoneId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendaki_id = localStorage.getItem('pendaki_id');
    const name = localStorage.getItem('name');

    if (!token || !pendaki_id) {
      router.push('/login');
      return;
    }
    setUser({ name: name || 'Pendaki', pendaki_id });

    // Fetch bookings
    fetch(`${API_URL}/bookings/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setBookingLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || !user) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `kartu-hazats-${user.pendaki_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Gagal mengunduh kartu. Coba screenshot manual.');
    }
  };

  const handleUploadProof = async (bookingId: number, file: File) => {
    const token = localStorage.getItem('token');
    setUploadingId(bookingId);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setUploadDoneId(bookingId);
        // Update local state
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, payment_proof_url: 'uploaded' } : b
        ));
      }
    } catch { }
    setUploadingId(null);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Memuat...</div>
    </div>
  );

  const memberYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="font-heading font-bold text-xl tracking-tighter">
              HAZATS<span className="text-gray-400 font-light">ADVENTURE</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-500">
                Hai, <strong className="text-black">{user.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:block">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Kolom Kiri: Kartu Anggota ── */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold font-heading mb-4">{t('member_card')}</h2>

            {/* Kartu Digital */}
            <div
              ref={cardRef}
              className="bg-black text-white p-6 rounded-2xl shadow-2xl relative overflow-hidden"
              style={{ aspectRatio: '1.586' }}
            >
              {/* Dekorasi */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 -ml-10 -mb-10" />
              <div className="absolute bottom-6 right-6 w-20 h-20 rounded-full border border-[#D4AF37]/20" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="font-heading font-bold text-base tracking-tighter text-[#D4AF37]">
                    HAZATS<span className="text-gray-500 font-light">ADVENTURE</span>
                  </div>
                  <CreditCard size={20} className="text-[#D4AF37] opacity-70" />
                </div>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">
                    {t('official_id')}
                  </p>
                  <p className="font-mono text-xl md:text-2xl tracking-widest font-bold">
                    {user.pendaki_id}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-0.5">
                      Pemegang Kartu
                    </p>
                    <p className="font-bold text-base uppercase tracking-wide">
                      {user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">{t('member_since')}</p>
                    <p className="text-sm font-semibold text-[#D4AF37]">{memberYear}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCard}
              className="mt-4 w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-black hover:text-white hover:border-black text-black py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
            >
              <Download size={15} />
              {t('download_card')}
            </button>
          </div>

          {/* ── Kolom Kanan: Riwayat Trip ── */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold font-heading mb-4">{t('my_trips')}</h2>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Map size={16} className="text-gray-400" />
                <span className="font-medium text-sm text-gray-700">{t('active_orders')}</span>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {bookings.length} trip
                </span>
              </div>

              {bookingLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Map size={24} className="text-gray-200" />
                  </div>
                  <p className="text-sm">{t('no_trips')}</p>
                  <Link
                    href="/#trips"
                    className="mt-4 inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#b8952b] font-medium text-sm"
                  >
                    {t('find_trips')} <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map(booking => (
                    <div key={booking.id} className="p-5 flex gap-4 items-start hover:bg-gray-50/50 transition-colors">
                      {/* Thumbnail */}
                      <div
                        className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${booking.trip.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400'})` }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-heading font-bold text-base truncate">
                            {booking.trip.mountain_name}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                          <Calendar size={11} />
                          {formatDate(booking.trip.departure_date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                          <Bus size={11} />
                          {booking.trip.transport}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#D4AF37] text-sm">
                            {formatPrice(booking.trip.price)}
                          </span>

                          {/* Upload bukti bayar */}
                          {booking.status === 'pending' && !booking.payment_proof_url && uploadDoneId !== booking.id && (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={el => { fileInputRefs.current[booking.id] = el; }}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadProof(booking.id, file);
                                }}
                              />
                              <button
                                onClick={() => fileInputRefs.current[booking.id]?.click()}
                                disabled={uploadingId === booking.id}
                                className="flex items-center gap-1 text-xs bg-black hover:bg-[#D4AF37] text-white px-3 py-1.5 rounded-full transition-all font-medium disabled:opacity-50"
                              >
                                <Upload size={11} />
                                {uploadingId === booking.id ? 'Uploading...' : t('upload_proof')}
                              </button>
                            </>
                          )}

                          {(booking.payment_proof_url || uploadDoneId === booking.id) && booking.status === 'pending' && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle size={12} />
                              Bukti sudah dikirim
                            </div>
                          )}

                          {booking.payment_proof_url && booking.status !== 'pending' && (
                            <a
                              href={`${API_URL}${booking.payment_proof_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black underline"
                            >
                              {t('view_proof')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
