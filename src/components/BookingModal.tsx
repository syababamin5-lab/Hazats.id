'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { X, CheckCircle, Upload, MapPin, Bus, Calendar, AlertCircle } from 'lucide-react';
import { Trip } from './TripCatalog';

interface BookingModalProps {
  trip: Trip;
  selectedPackage?: string;
  currentPrice?: number;
  onClose: () => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

import { API_URL } from '@/lib/api';

export default function BookingModal({ trip, selectedPackage, currentPrice, onClose, formatPrice, formatDate }: BookingModalProps) {
  const t = useTranslations('Booking');
  const router = useRouter();
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const points = trip.meeting_point ? trip.meeting_point.split('|').filter(p => p.trim() !== '') : [];
  const [selectedPoint, setSelectedPoint] = useState(points.length === 1 ? points[0] : '');

  const finalPrice = currentPrice || trip.price;

  const handleBook = async () => {
    if (points.length > 0 && !selectedPoint) {
      setError('Silakan pilih titik kumpul keberangkatan Anda.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const packageParam = selectedPackage ? `&package_name=${encodeURIComponent(selectedPackage)}&price_paid=${finalPrice}` : '';
      const res = await fetch(`${API_URL}/bookings?trip_id=${trip.id}${selectedPoint ? `&meeting_point=${encodeURIComponent(selectedPoint)}` : ''}${packageParam}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Gagal memesan trip');
      }

      const data = await res.json();
      setBookingId(data.id);
      setStep('success');
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Koneksi ke server gagal. Pastikan internet Anda stabil dan coba lagi dalam beberapa detik.');
      } else {
        setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bookingId) return;

    const token = localStorage.getItem('token');
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) setUploadDone(true);
    } catch { }
    setUploadLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
              {step === 'confirm' ? t('confirm_title') : t('success_title')}
            </p>
            <h3 className="font-heading font-bold text-xl">{trip.mountain_name} {trip.via && <span className="text-gray-400 font-normal text-lg">via {trip.via}</span>}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* ── Step: Konfirmasi ── */}
          {step === 'confirm' && (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <Calendar size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{t('departure')}</p>
                    <p className="font-medium text-sm">{formatDate(trip.departure_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <Bus size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{t('transport')}</p>
                    <p className="font-medium text-sm">{trip.transport}</p>
                  </div>
                </div>

                {points.length > 0 && (
                  <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <MapPin size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs text-gray-400 mb-1.5">{t('meeting_point')}</p>
                      <select
                        value={selectedPoint}
                        onChange={(e) => setSelectedPoint(e.target.value)}
                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] bg-white transition-all cursor-pointer"
                      >
                        {points.length > 1 && !selectedPoint && <option value="" disabled>Pilih Titik Kumpul</option>}
                        {points.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t('price')}</span>
                  <span className="font-bold text-2xl text-[#D4AF37]">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-200 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleBook}
                  disabled={loading}
                  className="flex-1 bg-black hover:bg-[#D4AF37] text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : t('submit')}
                </button>
              </div>
            </>
          )}

          {/* ── Step: Sukses ── */}
          {step === 'success' && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <h4 className="font-heading font-bold text-xl mb-2">{t('success_title')}</h4>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t('success_desc')}</p>

              {!uploadDone ? (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadProof}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadLoading}
                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-[#D4AF37] text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 mb-3"
                  >
                    <Upload size={16} />
                    {uploadLoading ? 'Mengupload...' : t('upload_proof')}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full border border-gray-200 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    {t('later')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center text-emerald-600 bg-emerald-50 p-3 rounded-xl mb-4">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">{t('upload_done')}</span>
                  </div>
                  <button
                    onClick={() => { onClose(); router.push('/dashboard'); }}
                    className="w-full bg-black hover:bg-[#D4AF37] text-white py-3.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    {t('go_dashboard')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
