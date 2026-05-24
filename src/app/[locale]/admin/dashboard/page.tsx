'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';
import {
  LogOut, Mountain, Users, BookOpen, Image as ImageIcon,
  Plus, Edit2, Trash2, Check, X, Eye, Upload, ChevronDown,
  RefreshCw, AlertCircle, Settings, UserCheck
} from 'lucide-react';

import { API_URL } from '@/lib/api';


// ─── Types ──────────────────────────────────────────────────────────────
interface Trip {
  id: number; mountain_name: string; via: string; description: string; trip_type: string;
  difficulty: string; departure_date: string; return_date: string; max_quota: number;
  remaining_quota: number; transport: string; price: number; meeting_point: string; image_url: string; packages?: string; is_active: boolean;
}
interface BookingUser { name: string; pendaki_id: string; email: string; phone: string; }
interface BookingTrip { id: number; mountain_name: string; departure_date: string; price: number; }
interface Booking {
  id: number; status: string; payment_proof_url: string | null;
  created_at: string; user: BookingUser; trip: BookingTrip;
}
interface Member {
  id: number; name: string; pendaki_id: string; email: string; phone: string;
  is_active: boolean; created_at: string; total_bookings: number;
}
interface GalleryImage { id: number; filename: string; url: string; description: string; uploaded_at: string; }

// ─── Helpers ────────────────────────────────────────────────────────────
function formatPrice(p: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p);
}
function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-red-50 text-red-500 border-red-100',
  };
  const label: Record<string, string> = {
    pending: 'Menunggu', confirmed: 'Dikonfirmasi', cancelled: 'Dibatalkan',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {label[status] || status}
    </span>
  );
}

// ─── Tab: Kelola Trip ────────────────────────────────────────────────────
function TripTab({ token }: { token: string }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [transports, setTransports] = useState<{ id: number, name: string }[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<{ id: number, name: string }[]>([]);
  const [form, setForm] = useState({
    mountain_name: '', via: '', description: '', trip_type: '', difficulty: 'Pemula', departure_date: '',
    return_date: '', max_quota: 15, transport: '', price: 0, meeting_point: '', image_url: '',
    paketA: '', paketB: '', mepoBC: '', isPackage: false, hasTransport: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const handleGenerateDescription = async () => {
    if (!form.mountain_name) return;
    setGeneratingDesc(true);
    try {
      const res = await fetch(`${API_URL}/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mountain_name: form.mountain_name, via: form.via || null })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Server AI sedang tidak tersedia.');
      }
      const data = await res.json();
      if (data.description) {
        setForm({ ...form, description: data.description });
      } else {
        alert('Gagal memformulasikan kalimat. Coba lagi.');
      }
    } catch (err: any) {
      alert('Gagal Generate AI: ' + err.message);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const fetchTrips = () => {
    setLoading(true);
    fetch(`${API_URL}/trips/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setTrips).catch(() => setTrips([]))
      .finally(() => setLoading(false));
  };
  const [galleryLoading, setGalleryLoading] = useState(false);
  const fetchGallery = () => {
    setGalleryLoading(true);
    fetch(`${API_URL}/gallery`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setGallery(Array.isArray(data) ? data : []))
      .catch(() => setGallery([]))
      .finally(() => setGalleryLoading(false));
  };
  const fetchOptions = () => {
    fetch(`${API_URL}/admin/config/transports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setTransports(Array.isArray(data) ? data : [])).catch(() => { });
    fetch(`${API_URL}/admin/config/meeting-points`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setMeetingPoints(Array.isArray(data) ? data : [])).catch(() => { });
  };

  useEffect(() => { fetchTrips(); fetchGallery(); fetchOptions(); }, []);

  const openCreate = () => {
    setEditTrip(null);
    setForm({ mountain_name: '', via: '', description: '', trip_type: '', difficulty: 'Pemula', departure_date: '', return_date: '', max_quota: 15, transport: '', price: 0, meeting_point: '', image_url: '', paketA: '', paketB: '', mepoBC: '', isPackage: false, hasTransport: false });
    setError('');
    setShowForm(true);
  };
  const openEdit = (trip: Trip) => {
    setEditTrip(trip);
    let pA = '', pB = '', mBC = '';
    let hasPackages = false;
    if (trip.packages) {
      try {
        const pkgs = JSON.parse(trip.packages);
        if (pkgs.length > 0) hasPackages = true;
        pkgs.forEach((p: any) => {
          if (p.name === 'Paket A') pA = p.price.toString();
          if (p.name === 'Paket B') pB = p.price.toString();
          if (p.name === 'Mepo BC') mBC = p.price.toString();
        });
      } catch (e) {}
    }
    setForm({
      mountain_name: trip.mountain_name, via: trip.via || '', description: trip.description || '', trip_type: trip.trip_type || '',
      difficulty: trip.difficulty, departure_date: trip.departure_date, return_date: trip.return_date || '',
      max_quota: trip.max_quota, transport: trip.transport || '', price: trip.price,
      meeting_point: trip.meeting_point || '', image_url: trip.image_url || '',
      paketA: pA, paketB: pB, mepoBC: mBC, isPackage: hasPackages, hasTransport: !!trip.transport
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      let lowestPrice = Number(form.price);
      let pkgs: any[] = [];
      if (form.isPackage) {
        if (form.paketA) pkgs.push({ name: 'Paket A', price: Number(form.paketA) });
        if (form.paketB) pkgs.push({ name: 'Paket B', price: Number(form.paketB) });
        if (form.mepoBC) pkgs.push({ name: 'Mepo BC', price: Number(form.mepoBC) });
        if (pkgs.length > 0) {
          lowestPrice = Math.min(...pkgs.map(p => p.price));
        }
      }

      const payload: any = { ...form, price: lowestPrice, max_quota: Number(form.max_quota), packages: pkgs.length > 0 ? JSON.stringify(pkgs) : null };
      if (!form.hasTransport) payload.transport = null;
      delete payload.paketA; delete payload.paketB; delete payload.mepoBC; delete payload.isPackage; delete payload.hasTransport;

      const url = editTrip ? `${API_URL}/trips/${editTrip.id}` : `${API_URL}/trips`;
      const method = editTrip ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Gagal menyimpan'); }
      setShowForm(false); fetchTrips();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number, tripName: string) => {
    const trip = trips.find(t => t.id === id);
    const hasBookings = trip && (trip.max_quota - trip.remaining_quota) > 0;
    
    if (hasBookings) {
      const confirmForce = confirm(
        `⚠️ Trip "${tripName}" sudah ada peserta yang mendaftar.\n\nTrip ini tidak bisa dihapus. Gunakan tombol Edit untuk menonaktifkan trip ini saja.\n\nTekan OK untuk membuka form edit.`
      );
      if (confirmForce) openEdit(trip!);
      return;
    }
    
    if (!confirm(`Hapus trip "${tripName}" secara permanen?\nTindakan ini tidak dapat dibatalkan.`)) return;
    
    try {
      const res = await fetch(`${API_URL}/trips/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        let errStr = text;
        try { errStr = JSON.parse(text).detail || text; } catch {}
        alert(`❌ Gagal menghapus (Status ${res.status}): ` + errStr);
        return;
      }
      fetchTrips();
    } catch (e: any) {
      alert('❌ Gagal menghapus: ' + e.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-xl">Kelola Trip</h3>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black hover:bg-[#D4AF37] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <Plus size={16} /> Tambah Trip Baru
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => (
            <div key={trip.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow ${!trip.is_active ? 'opacity-50' : ''}`}>
              <div className="w-14 h-14 rounded-lg bg-cover bg-center flex-shrink-0 bg-gray-100 flex items-center justify-center"
                style={trip.image_url ? { backgroundImage: `url(${trip.image_url.startsWith('http') ? trip.image_url : 'https://hazatsid-production.up.railway.app' + trip.image_url})` } : {}}>
                {!trip.image_url && <ImageIcon size={20} className="text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-sm truncate">{trip.mountain_name} {trip.via ? <span className="font-normal text-gray-500">via {trip.via}</span> : ''}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${trip.difficulty === 'Pemula' ? 'bg-emerald-50 text-emerald-600' : trip.difficulty === 'Menengah' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {trip.difficulty}
                  </span>
                  {!trip.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Nonaktif</span>}
                </div>
                <p className="text-xs text-gray-500">{formatDate(trip.departure_date)} {trip.trip_type ? `· ${trip.trip_type} ` : ''}· {trip.remaining_quota}/{trip.max_quota} sisa · {formatPrice(trip.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(trip)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(trip.id, trip.mountain_name)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="font-heading font-bold text-lg">{editTrip ? 'Edit Trip' : 'Tambah Trip Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm"><AlertCircle size={16} />{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nama Gunung *</label>
                    <input value={form.mountain_name} onChange={e => setForm({ ...form, mountain_name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="contoh: Gunung Papandayan" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Via (Opsional)</label>
                    <input value={form.via || ''} onChange={e => setForm({ ...form, via: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="contoh: Cibodas" />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Deskripsi</label>
                    <button type="button" onClick={handleGenerateDescription} disabled={generatingDesc || !form.mountain_name} className="text-xs bg-[#D4AF37] hover:bg-yellow-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors disabled:opacity-50">
                      <RefreshCw size={12} className={generatingDesc ? "animate-spin" : ""} /> {generatingDesc ? 'Mencari...' : 'Generate AI ✨'}
                    </button>
                  </div>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" placeholder="Deskripsi singkat trip ini..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tingkat Kesulitan</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                    <option>Pemula</option><option>Menengah</option><option>Sulit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Kuota Maks</label>
                  <input type="number" value={form.max_quota} onChange={e => setForm({ ...form, max_quota: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tanggal Berangkat *</label>
                  <input type="date" value={form.departure_date} onChange={e => setForm({ ...form, departure_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tanggal Kembali</label>
                  <input type="date" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Jenis Trip</label>
                  <select value={form.trip_type} onChange={e => setForm({ ...form, trip_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                    <option value="">-- Pilih Jenis --</option>
                    <option value="1D (ODT)">1D (ODT)</option>
                    <option value="2D1N (Camp)">2D1N (Camp)</option>
                  </select>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Pengaturan Harga</label>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
                      <button type="button" onClick={() => setForm({ ...form, isPackage: false })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${!form.isPackage ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        Harga Tunggal
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, isPackage: true })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${form.isPackage ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        Pilihan Paket
                      </button>
                    </div>
                  </div>
                  
                  {!form.isPackage ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga Trip (Rp)</label>
                      <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Contoh: 750000" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 mb-3 font-medium">Isi paket yang tersedia. Biarkan kosong jika paket tersebut tidak ada.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga Paket A</label>
                          <input type="number" value={form.paketA} onChange={e => setForm({ ...form, paketA: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Contoh: 750000" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga Paket B</label>
                          <input type="number" value={form.paketB} onChange={e => setForm({ ...form, paketB: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Kosongkan" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga Mepo BC</label>
                          <input type="number" value={form.mepoBC} onChange={e => setForm({ ...form, mepoBC: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Kosongkan" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Pengaturan Transportasi</label>
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
                      <button type="button" onClick={() => setForm({ ...form, hasTransport: true })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${form.hasTransport ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        Dengan Transport
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, hasTransport: false, transport: '' })}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${!form.hasTransport ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}>
                        Tanpa Transport
                      </button>
                    </div>
                  </div>
                  {form.hasTransport && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Pilih Transportasi</label>
                      <select value={form.transport} onChange={e => setForm({ ...form, transport: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                        <option value="">Pilih Transportasi...</option>
                        {transports.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Titik Kumpul</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {meetingPoints.map(m => {
                      const isSelected = form.meeting_point?.split('|').includes(m.name);
                      return (
                        <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="checkbox" className="hidden" checked={isSelected}
                            onChange={() => {
                              const points = form.meeting_point ? form.meeting_point.split('|') : [];
                              if (isSelected) {
                                setForm({ ...form, meeting_point: points.filter(p => p !== m.name).join('|') });
                              } else {
                                setForm({ ...form, meeting_point: [...points, m.name].join('|') });
                              }
                            }}
                          />
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Image URL + Gallery Picker */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Foto Trip</label>
                  <div className="flex gap-2">
                    <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="https://... atau pilih dari galeri" />
                    <button type="button" onClick={() => { fetchGallery(); setShowGalleryPicker(true); }}
                      className="flex items-center gap-1.5 border border-gray-200 hover:border-black px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                      <ImageIcon size={14} /> Galeri
                    </button>
                  </div>
                  {form.image_url && (
                    <div className="mt-2 w-full h-32 rounded-xl bg-cover bg-center border border-gray-100"
                      style={{ backgroundImage: `url(${form.image_url})` }} />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-black hover:bg-[#D4AF37] text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
                  {saving ? 'Menyimpan...' : (editTrip ? 'Simpan Perubahan' : 'Tambah Trip')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Picker Modal */}
      {showGalleryPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGalleryPicker(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg">Pilih Foto dari Galeri</h3>
              <div className="flex items-center gap-2">
                <button onClick={fetchGallery} className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors" title="Refresh galeri">
                  <RefreshCw size={16} className={galleryLoading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setShowGalleryPicker(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
              </div>
            </div>
            <div className="p-4">
              {galleryLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
              ) : gallery.length === 0 ? (
                <div className="text-center py-10">
                  <ImageIcon size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Belum ada foto di galeri</p>
                  <p className="text-gray-400 text-xs mt-1">Upload dulu di tab Galeri, lalu klik refresh di atas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map(img => {
                    const imgUrl = img.url?.startsWith('http') ? img.url : `${API_URL}${img.url}`;
                    return (
                      <button key={img.id} onClick={() => { setForm({ ...form, image_url: imgUrl }); setShowGalleryPicker(false); }}
                        className="relative group aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#D4AF37] transition-all">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgUrl})` }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <Check className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                        </div>
                        {img.description && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">{img.description}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Verifikasi Booking ─────────────────────────────────────────────
function BookingTab({ token }: { token: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setBookings(Array.isArray(data) ? data : [])).catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    await fetch(`${API_URL}/bookings/${id}/status`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchBookings();
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-xl">Verifikasi Booking</h3>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'Semua' : f === 'pending' ? 'Menunggu' : f === 'confirmed' ? 'Dikonfirmasi' : 'Dibatalkan'}
              {f === 'pending' && (
                <span className="ml-1.5 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Tidak ada booking {filter !== 'all' ? filter : ''}.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-heading font-bold text-sm">{b.trip.mountain_name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    <strong>Pendaki:</strong> {b.user.name} · <span className="font-mono">{b.user.pendaki_id}</span>
                  </p>
                  <p className="text-xs text-gray-500 mb-0.5">
                    <strong>Kontak:</strong> {b.user.email || b.user.phone}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Berangkat:</strong> {formatDate(b.trip.departure_date)} · <strong>Harga:</strong> {formatPrice(b.trip.price)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Booking #{b.id} · {formatDate(b.created_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Bukti Bayar */}
                  {b.payment_proof_url ? (
                    <a href={`${API_URL}${b.payment_proof_url}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full font-medium transition-colors">
                      <Eye size={12} /> Lihat Bukti Bayar
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">Belum ada bukti</span>
                  )}

                  {/* Action buttons */}
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updatingId === b.id}
                        className="flex items-center gap-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
                        <X size={12} /> Tolak
                      </button>
                      <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updatingId === b.id}
                        className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50">
                        <Check size={12} /> Konfirmasi
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updatingId === b.id}
                      className="text-xs border border-red-200 text-red-400 hover:bg-red-50 px-3 py-1.5 rounded-full font-medium transition-colors">
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Database Anggota ───────────────────────────────────────────────
function MemberTab({ token }: { token: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setMembers(Array.isArray(data) ? data : [])).catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(m =>
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.pendaki_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.phone || '').includes(search)
  );

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-xl">Database Anggota</h3>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, ID, atau kontak..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-64" />
      </div>
      <p className="text-xs text-gray-400 mb-4">{filtered.length} anggota ditemukan</p>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID Pendaki</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kontak</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Trip</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium">{m.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-[#D4AF37] font-bold">{m.pendaki_id}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs hidden md:table-cell">{m.email || m.phone}</td>
                  <td className="px-5 py-3 text-center hidden lg:table-cell">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">{m.total_bookings}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">Tidak ada anggota ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Galeri Foto ────────────────────────────────────────────────────
function GalleryTab({ token }: { token: string }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [desc, setDesc] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = () => {
    setLoading(true);
    fetch(`${API_URL}/gallery`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setImages(Array.isArray(data) ? data : [])).catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', desc);
    try {
      await fetch(`${API_URL}/gallery`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      setDesc('');
      fetchImages();
    } catch { }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus foto ini?')) return;
    await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    fetchImages();
  };

  const copyUrl = (url: string) => {
    const fullUrl = url.startsWith('data:') ? url : `${API_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    alert('URL gambar disalin!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-xl">Galeri Foto</h3>
        <div className="flex items-center gap-2">
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Deskripsi foto..."
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-48" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-black hover:bg-[#D4AF37] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60">
            <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload Foto'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada foto. Upload foto pertama Anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => {
            const bgUrl = img.url.startsWith('data:') ? img.url : `${API_URL}${img.url}`;
            return (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(img.url)}
                  className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium hover:bg-[#D4AF37] hover:text-white transition-colors">
                  Salin URL
                </button>
                <button onClick={() => handleDelete(img.id)}
                  className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-medium hover:bg-red-600 transition-colors">
                  Hapus
                </button>
              </div>
              {img.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                  {img.description}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Konfigurasi ──────────────────────────────────────────────────────
function ConfigTab({ token }: { token: string }) {
  const [transports, setTransports] = useState<{ id: number, name: string }[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<{ id: number, name: string }[]>([]);
  const [siteConfig, setSiteConfig] = useState({ include_exclude: '', itinerary: '' });
  const [loading, setLoading] = useState(true);
  const [savingSiteConfig, setSavingSiteConfig] = useState(false);
  
  const [newTransport, setNewTransport] = useState('');
  const [newMeetingPoint, setNewMeetingPoint] = useState('');

  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) setApiKey(key);
  }, []);
  const saveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    alert('API Key Gemini berhasil disimpan di browser!');
  };
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes, sRes] = await Promise.all([
        fetch(`${API_URL}/admin/config/transports`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/config/meeting-points`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/config/site`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const tData = await tRes.json();
      const mData = await mRes.json();
      const sData = await sRes.json();
      setTransports(Array.isArray(tData) ? tData : []);
      setMeetingPoints(Array.isArray(mData) ? mData : []);
      if (sData) setSiteConfig({ include_exclude: sData.include_exclude || '', itinerary: sData.itinerary || '' });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveSiteConfig = async () => {
    setSavingSiteConfig(true);
    try {
      await fetch(`${API_URL}/admin/config/site`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig)
      });
      alert('Konfigurasi Global berhasil disimpan!');
    } catch (e) {
      alert('Gagal menyimpan konfigurasi.');
    }
    setSavingSiteConfig(false);
  };

  const addTransport = async () => {
    if (!newTransport.trim()) return;
    await fetch(`${API_URL}/admin/config/transports`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTransport })
    });
    setNewTransport('');
    fetchData();
  };

  const deleteTransport = async (id: number) => {
    if (!confirm('Hapus opsi transportasi ini?')) return;
    await fetch(`${API_URL}/admin/config/transports/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const addMeetingPoint = async () => {
    if (!newMeetingPoint.trim()) return;
    await fetch(`${API_URL}/admin/config/meeting-points`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMeetingPoint })
    });
    setNewMeetingPoint('');
    fetchData();
  };

  const deleteMeetingPoint = async (id: number) => {
    if (!confirm('Hapus opsi titik kumpul ini?')) return;
    await fetch(`${API_URL}/admin/config/meeting-points/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-40 bg-gray-100 rounded-xl"></div><div className="h-40 bg-gray-100 rounded-xl"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading font-bold text-xl">Pengaturan Konfigurasi Dropdown</h3>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h4 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
           Integrasi Google Gemini AI
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          Masukkan API Key Gemini Anda agar fitur "Generate AI" dapat menyusun deskripsi cerdas secara otomatis. Dapatkan kunci gratis di <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-500 underline font-medium">Google AI Studio</a>. Kunci disimpan aman di peramban ini.
        </p>
        <div className="flex gap-3 max-w-lg">
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="AIzaSy***" 
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm" 
          />
          <button 
            onClick={saveKey} 
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors"
          >
            Simpan Key
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h4 className="font-heading font-bold text-lg mb-2 flex items-center gap-2">
           Konfigurasi Trip (Global)
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          Isi ini akan ditampilkan saat pengguna mengklik tombol "Include & Exclude" atau "Itinerary" di halaman pemesanan trip.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Include & Exclude</label>
            <textarea 
              value={siteConfig.include_exclude} 
              onChange={e => setSiteConfig({...siteConfig, include_exclude: e.target.value})}
              rows={5}
              placeholder="Fasilitas yang didapatkan dan tidak didapatkan..." 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Itinerary (Rencana Perjalanan)</label>
            <textarea 
              value={siteConfig.itinerary} 
              onChange={e => setSiteConfig({...siteConfig, itinerary: e.target.value})}
              rows={5}
              placeholder="Jadwal perjalanan dari hari pertama sampai selesai..." 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm" 
            />
          </div>
          <button 
            onClick={saveSiteConfig} 
            disabled={savingSiteConfig}
            className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
          >
            {savingSiteConfig ? 'Menyimpan...' : 'Simpan Konfigurasi Trip'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-heading font-bold text-lg mb-4">Opsi Transportasi</h4>
          <div className="flex gap-2 mb-4">
            <input value={newTransport} onChange={e => setNewTransport(e.target.value)} placeholder="Tambah Transportasi Baru"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <button onClick={addTransport} className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors">Tambah</button>
          </div>
          <ul className="space-y-2">
            {transports.map(t => (
              <li key={t.id} className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
                <span className="text-sm font-medium">{t.name}</span>
                <button onClick={() => deleteTransport(t.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </li>
            ))}
            {transports.length === 0 && <li className="text-center text-sm text-gray-400 py-4">Belum ada opsi transportasi.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-heading font-bold text-lg mb-4">Opsi Titik Kumpul</h4>
          <div className="flex gap-2 mb-4">
            <input value={newMeetingPoint} onChange={e => setNewMeetingPoint(e.target.value)} placeholder="Tambah Titik Kumpul Baru"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <button onClick={addMeetingPoint} className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#D4AF37] transition-colors">Tambah</button>
          </div>
          <ul className="space-y-2">
            {meetingPoints.map(m => (
              <li key={m.id} className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100">
                <span className="text-sm font-medium">{m.name}</span>
                <button onClick={() => deleteMeetingPoint(m.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </li>
            ))}
            {meetingPoints.length === 0 && <li className="text-center text-sm text-gray-400 py-4">Belum ada opsi titik kumpul.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Kelola Pemandu ──────────────────────────────────────────────
function GuideTab({ token }: { token: string }) {
  const [guides, setGuides] = useState<{id: number, name: string, photo_url: string, history: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', photo_url: '', history: '' });
  const [saving, setSaving] = useState(false);

  const fetchGuides = () => {
    setLoading(true);
    fetch(`${API_URL}/guides`).then(r => r.json()).then(setGuides).catch(() => setGuides([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchGuides(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`${API_URL}/guides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setForm({ name: '', photo_url: '', history: '' });
    fetchGuides();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Hapus pemandu ini?')) return;
    await fetch(`${API_URL}/guides/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchGuides();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat Pemandu...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <h2 className="font-bold text-lg mb-4">Tambah Pemandu</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Nama Pemandu</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full border rounded-xl px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">URL Foto (Opsional)</label>
              <input type="text" value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Daftar Gunung yang Pernah Didaki</label>
            <textarea value={form.history} onChange={e => setForm({...form, history: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm h-24" />
          </div>
          <button disabled={saving} className="bg-black text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Tambah Pemandu'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Pemandu</th>
              <th className="p-4">Gunung yang Pernah Didaki</th>
              <th className="p-4 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {guides.map(g => (
              <tr key={g.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${g.photo_url || 'https://via.placeholder.com/150'})` }} />
                    <span className="font-medium text-sm">{g.name}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-gray-500 max-w-xs truncate">
                  {g.history}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('trips');
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const t = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    if (!t || role !== 'admin') {
      router.push('/admin');
      return;
    }
    setToken(t);
    setAdminName(name || 'Admin');
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin');
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse text-sm">Memuat panel admin...</div>
    </div>
  );

  const tabs = [
    { id: 'trips', label: 'Kelola Trip', icon: Mountain },
    { id: 'bookings', label: 'Verifikasi Booking', icon: BookOpen },
    { id: 'members', label: 'Database Anggota', icon: Users },
    { id: 'gallery', label: 'Galeri Foto', icon: ImageIcon },
    { id: 'config', label: 'Konfigurasi', icon: Settings },
    { id: 'guides', label: 'Pemandu', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white bg-black overflow-hidden shadow-sm flex-shrink-0">
                  <img src="/logo.png" alt="Hazats Adventure" className="w-full h-full object-cover" />
                </div>
                <span className="font-heading font-bold text-base tracking-tighter hidden sm:block">
                  HAZATS<span className="text-[#D4AF37]">ADVENTURE</span>
                </span>
              </Link>
              <span className="text-gray-600 text-xs hidden sm:block">/ Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 hidden sm:block">Hai, <strong className="text-white">{adminName}</strong></span>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
                <LogOut size={14} /> Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-1 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all rounded-lg ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black bg-gray-50'
                      : 'text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'trips' && <TripTab token={token} />}
        {activeTab === 'bookings' && <BookingTab token={token} />}
        {activeTab === 'members' && <MemberTab token={token} />}
        {activeTab === 'gallery' && <GalleryTab token={token} />}
        {activeTab === 'config' && <ConfigTab token={token} />}
        {activeTab === 'guides' && <GuideTab token={token} />}
      </main>
    </div>
  );
}
