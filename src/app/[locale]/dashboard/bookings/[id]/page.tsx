'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, Calendar, Bus, MapPin, CheckCircle, Upload, FileText, User, AlertCircle, Clock } from 'lucide-react';
import { API_URL } from '@/lib/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface BookingDetail {
  id: number;
  status: string;
  payment_proof_url: string | null;
  created_at: string;
  meeting_point: string | null;
  package_name: string | null;
  price_paid: number | null;
  user: {
    name: string;
    email: string;
    phone: string;
    nik: string | null;
    emergency_contact: string | null;
  };
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
    via: string | null;
  };
}

import { use } from 'react';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id } = use(params);
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/bookings/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((data: BookingDetail[]) => {
        const found = data.find(b => b.id === Number(id));
        setBooking(found || null);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleUploadProof = async (file: File) => {
    const token = localStorage.getItem('token');
    if (!token || !booking) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/bookings/${booking.id}/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setBooking({ ...booking, payment_proof_url: data.payment_proof_url });
        alert('Bukti pembayaran berhasil diunggah.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || 'Gagal mengunggah bukti.');
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center items-center p-6">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold font-heading mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6 text-center">Mungkin ID pesanan salah atau Anda tidak memiliki akses.</p>
        <Link href="/dashboard" className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#D4AF37] transition-colors">
          Kembali ke Dasbor
        </Link>
      </div>
    );
  }

  const finalPrice = booking.price_paid || booking.trip.price;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <ChevronLeft size={16} className="mr-1" />
            Kembali ke Dasbor
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-md tracking-wider">
                INV-{booking.id.toString().padStart(5, '0')}
              </span>
              <span className="text-xs text-gray-400 font-medium">{new Date(booking.created_at).toLocaleString('id-ID')}</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">Rincian Pemesanan</h1>
            <p className="text-gray-500 mt-2 max-w-lg">Dokumen ini merupakan bukti sah pendaftaran Anda untuk trip di Hazats Adventure. Harap simpan informasi ini.</p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${
              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-red-50 text-red-500 border-red-200'
            }`}>
              {booking.status === 'confirmed' && <CheckCircle size={16} />}
              {booking.status === 'pending' && <Clock size={16} />}
              {booking.status === 'cancelled' && <AlertCircle size={16} />}
              
              {booking.status === 'confirmed' ? 'DIKONFIRMASI' :
               booking.status === 'pending' ? 'MENUNGGU KONFIRMASI' : 'DIBATALKAN'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trip Info Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Informasi Trip</h2>
                  <p className="text-xs text-gray-500">Destinasi dan jadwal pendakian</p>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6">
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-cover bg-center shrink-0 border border-gray-100"
                  style={{ backgroundImage: `url(${booking.trip.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400'})` }}
                ></div>
                
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl sm:text-2xl mb-1">{booking.trip.mountain_name}</h3>
                  <div className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-md mb-3">
                    {booking.trip.difficulty}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                    <div className="flex items-start gap-2">
                      <Calendar size={14} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Keberangkatan</p>
                        <p className="text-sm font-semibold">{formatDate(booking.trip.departure_date)}</p>
                      </div>
                    </div>
                    {booking.trip.return_date && (
                      <div className="flex items-start gap-2">
                        <Calendar size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Kepulangan</p>
                          <p className="text-sm font-semibold">{formatDate(booking.trip.return_date)}</p>
                        </div>
                      </div>
                    )}
                    {booking.trip.via && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Jalur Via</p>
                          <p className="text-sm font-semibold">{booking.trip.via}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Participant Info */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Data Peserta</h2>
                  <p className="text-xs text-gray-500">Informasi pendaftar utama</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                  <p className="font-semibold text-gray-900">{booking.user?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{booking.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor WhatsApp</p>
                  <p className="font-semibold text-gray-900">{booking.user?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">NIK KTP</p>
                  <p className="font-semibold text-gray-900">{booking.user?.nik || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kontak Darurat</p>
                  <p className="font-semibold text-gray-900">{booking.user?.emergency_contact || '-'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Payment Details */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h2 className="font-bold text-lg leading-tight">Tagihan</h2>
              </div>

              <div className="space-y-4">
                {booking.package_name && (
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Paket Dipilih</span>
                    <span className="font-bold">{booking.package_name}</span>
                  </div>
                )}
                
                {booking.meeting_point && (
                  <div className="flex justify-between items-start py-2 border-b border-dashed border-gray-200">
                    <span className="text-sm text-gray-500 font-medium shrink-0 mr-4">Titik Kumpul</span>
                    <span className="font-bold text-right text-sm">{booking.meeting_point}</span>
                  </div>
                )}

                {booking.trip.transport && (
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Transportasi</span>
                    <span className="font-bold text-right text-sm">{booking.trip.transport}</span>
                  </div>
                )}

                <div className="pt-4">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Biaya</span>
                  <div className="text-3xl font-black text-[#D4AF37]">{formatPrice(finalPrice)}</div>
                </div>
              </div>
            </div>

            {/* Payment Proof Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Bukti Pembayaran</h2>
              
              {booking.payment_proof_url ? (
                <div>
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 mb-4">
                    <CheckCircle className="shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-sm mb-0.5">Bukti Telah Diunggah</p>
                      <p className="text-xs opacity-90">Kami sedang melakukan verifikasi.</p>
                    </div>
                  </div>
                  <a 
                    href={`${API_URL.replace('/api/v1', '')}${booking.payment_proof_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 hover:border-black text-black font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <FileText size={16} /> Lihat Lampiran
                  </a>
                </div>
              ) : (
                <div>
                  <div className="bg-amber-50 text-amber-700 p-4 rounded-xl flex items-start gap-3 mb-5">
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-medium leading-relaxed">Harap unggah bukti transfer agar pendaftaran Anda dapat diverifikasi oleh admin.</p>
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadProof(file);
                    }}
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full bg-black hover:bg-[#D4AF37] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Upload size={18} /> Unggah Bukti Transfer
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
