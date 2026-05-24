'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LogOut, Map, CreditCard, ChevronRight, Upload, CheckCircle, Calendar, Bus, AlertCircle, Download, MapPin, User, FileText, Activity } from 'lucide-react';

import { API_URL } from '@/lib/api';


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
  meeting_point: string | null;
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

  const [user, setUser] = useState<{ name: string; pendaki_id: string; profile_image_url?: string } | null>(null);
  const [profile, setProfile] = useState<any>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [bookingLoading, setBookingLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadDoneId, setUploadDoneId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat' | 'profil'>('aktif');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const pendaki_id = localStorage.getItem('pendaki_id');

    if (!token || !pendaki_id) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser({ name: data.name, pendaki_id: data.pendaki_id, profile_image_url: data.profile_image_url });
        setProfile(data);
      });

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
        setBookings(prev => prev.map(b =>
          b.id === bookingId ? { ...b, payment_proof_url: 'uploaded' } : b
        ));
      }
    } catch { }
    setUploadingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'ktp_image_url' | 'profile_image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev: any) => ({ ...prev, [field]: reader.result as string }));
      if (field === 'profile_image_url' && user) {
        setUser({ ...user, profile_image_url: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert("Anda harus menyetujui Informed Consent untuk menyimpan profil.");
      return;
    }
    setSavingProfile(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert("Profil berhasil disimpan!");
      } else {
        alert("Gagal menyimpan profil.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
    setSavingProfile(false);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Memuat...</div>
    </div>
  );

  const memberYear = new Date().getFullYear();
  
  // Date Logic
  const today = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(b => b.trip.departure_date >= today);
  const historyBookings = bookings.filter(b => b.trip.departure_date < today);
  
  const displayBookings = activeTab === 'aktif' ? activeBookings : historyBookings;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-black flex-shrink-0 overflow-hidden shadow-sm">
                <img src="/logo.png" alt="Hazats Adventure" className="w-full h-full object-cover" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tighter hidden sm:block">
                HAZATS<span className="text-gray-400 font-light">ADVENTURE</span>
              </span>
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
              
              {user.profile_image_url && (
                <div className="absolute top-6 left-6 w-12 h-12 rounded-full border-2 border-[#D4AF37]/50 overflow-hidden z-20">
                  <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className={`font-heading font-bold text-base tracking-tighter text-[#D4AF37] ${user.profile_image_url ? 'ml-16' : ''}`}>
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

          {/* ── Kolom Kanan: TABS ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-6 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
              <button 
                onClick={() => setActiveTab('aktif')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'aktif' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                Riwayat Aktif
              </button>
              <button 
                onClick={() => setActiveTab('riwayat')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                Riwayat (Lalu)
              </button>
              <button 
                onClick={() => setActiveTab('profil')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'profil' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              >
                <User size={15}/> Profil & Data Medis
              </button>
            </div>

            {/* KONTEN TAB: AKTIF & RIWAYAT */}
            {(activeTab === 'aktif' || activeTab === 'riwayat') && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                  <Map size={16} className="text-gray-400" />
                  <span className="font-medium text-sm text-gray-700">Daftar Pemesanan</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-full font-medium">
                    {displayBookings.length} trip
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
                ) : displayBookings.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Map size={24} className="text-gray-200" />
                    </div>
                    <p className="text-sm">Belum ada trip di kategori ini.</p>
                    <Link
                      href="/#trips"
                      className="mt-4 inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#b8952b] font-medium text-sm"
                    >
                      {t('find_trips')} <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {displayBookings.map(booking => (
                      <div key={booking.id} className="p-5 flex gap-4 items-start hover:bg-gray-50/50 transition-colors">
                        <div
                          className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 shadow-sm"
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
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                            <Bus size={11} />
                            {booking.trip.transport}
                          </div>
                          {booking.meeting_point && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                              <MapPin size={11} />
                              {booking.meeting_point}
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            <span className="font-bold text-[#D4AF37] text-sm mr-2">
                              {formatPrice(booking.trip.price)}
                            </span>

                            {booking.status === 'pending' && !booking.payment_proof_url && uploadDoneId !== booking.id && (
                              <>
                                <input
                                  type="file" accept="image/*" className="hidden"
                                  ref={el => { fileInputRefs.current[booking.id] = el; }}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadProof(booking.id, file);
                                  }}
                                />
                                <button
                                  onClick={() => fileInputRefs.current[booking.id]?.click()}
                                  disabled={uploadingId === booking.id}
                                  className="flex items-center gap-1.5 text-xs bg-black hover:bg-[#D4AF37] text-white px-4 py-1.5 rounded-full transition-all font-medium disabled:opacity-50"
                                >
                                  <Upload size={12} />
                                  {uploadingId === booking.id ? 'Uploading...' : t('upload_proof')}
                                </button>
                              </>
                            )}

                            {(booking.payment_proof_url || uploadDoneId === booking.id) && booking.status === 'pending' && (
                              <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                                <CheckCircle size={12} /> Bukti sudah dikirim
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* KONTEN TAB: PROFIL */}
            {activeTab === 'profil' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="mb-8">
                  <h3 className="font-heading font-bold text-xl mb-1">Kelengkapan Data Diri</h3>
                  <p className="text-sm text-gray-500">Lengkapi data ini untuk keperluan SIMAKSI, asuransi, dan keselamatan (SAR).</p>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Foto Profil & KTP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Foto Profil</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {profile.profile_image_url ? (
                            <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-4 text-gray-400" />
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'profile_image_url')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Foto KTP / Identitas</label>
                      <div className="flex flex-col gap-2">
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'ktp_image_url')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                        {profile.ktp_image_url && (
                          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium mt-1"><CheckCircle size={12}/> KTP Tersimpan di Database</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Diri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nama Lengkap Sesuai KTP</label>
                      <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nomor Induk Kependudukan (NIK)</label>
                      <input type="text" value={profile.nik || ''} onChange={e => setProfile({...profile, nik: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tempat, Tanggal Lahir</label>
                      <input type="text" value={profile.birth_place_date || ''} onChange={e => setProfile({...profile, birth_place_date: e.target.value})} placeholder="Contoh: Bandung, 17 Agustus 1995" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Jenis Kelamin</label>
                      <select value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none bg-white" required>
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
                    <textarea rows={2} value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none resize-none" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Kontak Darurat (Nama & No HP)</label>
                      <input type="text" value={profile.emergency_contact || ''} onChange={e => setProfile({...profile, emergency_contact: e.target.value})} placeholder="Ibu Rina - 0812345678" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Akun Sosial Media (IG/Tiktok)</label>
                      <input type="text" value={profile.social_media || ''} onChange={e => setProfile({...profile, social_media: e.target.value})} placeholder="@username" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Riwayat Penyakit Kronis / Alergi</label>
                    <textarea rows={2} value={profile.medical_history || ''} onChange={e => setProfile({...profile, medical_history: e.target.value})} placeholder="Isi 'Tidak Ada' jika sehat" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black focus:outline-none resize-none" required />
                  </div>

                  {/* Informed Consent */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mt-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        checked={consentChecked}
                        onChange={e => setConsentChecked(e.target.checked)}
                      />
                      <span className="text-xs text-gray-800 leading-relaxed">
                        <strong className="text-amber-700">PERNYATAAN PERSETUJUAN:</strong> Saya menyatakan bahwa data diri dan riwayat kesehatan yang saya berikan adalah benar. Saya memahami dan memberikan persetujuan kepada pihak Penyelenggara (Open Trip) untuk mengumpulkan dan memproses data pribadi saya untuk keperluan administrasi SIMAKSI, asuransi, dan keselamatan pendakian (SAR) sesuai dengan perundang-undangan yang berlaku. Apabila saya memalsukan data, pihak Penyelenggara dibebaskan dari segala tuntutan hukum atas risiko fatal/kecelakaan yang timbul akibat kelalaian saya.
                      </span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingProfile || !consentChecked}
                    className="w-full bg-[#D4AF37] hover:bg-[#b8952b] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {savingProfile ? 'Menyimpan...' : 'Simpan Profil & Data Medis'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
