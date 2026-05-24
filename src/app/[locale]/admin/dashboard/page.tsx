'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';
import {
  LogOut, Mountain, Users, BookOpen, Image as ImageIcon,
  Plus, Edit2, Trash2, Check, X, Eye, Upload, ChevronDown,
  RefreshCw, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;

// ─── Types ──────────────────────────────────────────────────────────────
interface Trip {
  id: number; mountain_name: string; description: string; difficulty: string;
  departure_date: string; return_date: string; max_quota: number; remaining_quota: number;
  transport: string; price: number; meeting_point: string; image_url: string; is_active: boolean;
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
  const [form, setForm] = useState({
    mountain_name: '', description: '', difficulty: 'Pemula', departure_date: '',
    return_date: '', max_quota: 15, transport: '', price: 0, meeting_point: '', image_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTrips = () => {
    setLoading(true);
    fetch(`${API_URL}/trips/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setTrips).catch(() => setTrips([]))
      .finally(() => setLoading(false));
  };
  const fetchGallery = () => {
    fetch(`${API_URL}/gallery`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setGallery(Array.isArray(data) ? data : [])).catch(() => { });
  };

  useEffect(() => { fetchTrips(); fetchGallery(); }, []);

  const openCreate = () => {
    setEditTrip(null);
    setForm({ mountain_name: '', description: '', difficulty: 'Pemula', departure_date: '', return_date: '', max_quota: 15, transport: '', price: 0, meeting_point: '', image_url: '' });
    setError('');
    setShowForm(true);
  };
  const openEdit = (trip: Trip) => {
    setEditTrip(trip);
    setForm({
      mountain_name: trip.mountain_name, description: trip.description || '',
      difficulty: trip.difficulty, departure_date: trip.departure_date, return_date: trip.return_date || '',
      max_quota: trip.max_quota, transport: trip.transport || '', price: trip.price,
      meeting_point: trip.meeting_point || '', image_url: trip.image_url || ''
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const url = editTrip ? `${API_URL}/trips/${editTrip.id}` : `${API_URL}/trips`;
      const method = editTrip ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), max_quota: Number(form.max_quota) })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Gagal menyimpan'); }
      setShowForm(false); fetchTrips();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Nonaktifkan trip ini?')) return;
    await fetch(`${API_URL}/trips/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    fetchTrips();
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
              <div className="w-14 h-14 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${trip.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200'})` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-sm truncate">{trip.mountain_name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${trip.difficulty === 'Pemula' ? 'bg-emerald-50 text-emerald-600' : trip.difficulty === 'Menengah' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {trip.difficulty}
                  </span>
                  {!trip.is_active && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Nonaktif</span>}
                </div>
                <p className="text-xs text-gray-500">{formatDate(trip.departure_date)} · {trip.remaining_quota}/{trip.max_quota} sisa · {formatPrice(trip.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(trip)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(trip.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
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
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nama Gunung *</label>
                  <input value={form.mountain_name} onChange={e => setForm({ ...form, mountain_name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="contoh: Gunung Papandayan" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Deskripsi</label>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Harga (IDR) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="450000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Transportasi</label>
                  <input value={form.transport} onChange={e => setForm({ ...form, transport: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Hiace Commuter (AC)" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Titik Kumpul</label>
                  <input value={form.meeting_point} onChange={e => setForm({ ...form, meeting_point: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Alun-Alun Soreang, Kab. Bandung" />
                </div>

                {/* Image URL + Gallery Picker */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Foto Trip</label>
                  <div className="flex gap-2">
                    <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="https://... atau pilih dari galeri" />
                    <button type="button" onClick={() => setShowGalleryPicker(true)}
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
              <button onClick={() => setShowGalleryPicker(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
            </div>
            <div className="p-4">
              {gallery.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Belum ada foto di galeri. Upload dulu di tab Galeri.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.map(img => (
                    <button key={img.id} onClick={() => { setForm({ ...form, image_url: `${API_URL}${img.url}` }); setShowGalleryPicker(false); }}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#D4AF37] transition-all">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${API_URL}${img.url})` }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Check className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                      </div>
                      {img.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">{img.description}</div>
                      )}
                    </button>
                  ))}
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
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.pendaki_id.toLowerCase().includes(search.toLowerCase()) ||
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
    navigator.clipboard.writeText(`${API_URL}${url}`);
    alert('URL disalin!');
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
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${API_URL}${img.url})` }} />
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
          ))}
        </div>
      )}
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-heading font-bold text-base tracking-tighter">
                HAZATS<span className="text-[#D4AF37]">ADVENTURE</span>
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
      </main>
    </div>
  );
}
