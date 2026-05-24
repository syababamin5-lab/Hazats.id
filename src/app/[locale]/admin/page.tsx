'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { API_URL } from '@/lib/api';


export default function AdminLoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login gagal');
      }

      const data = await res.json();

      if (data.role !== 'admin') {
        throw new Error('Akun ini tidak memiliki akses admin');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('pendaki_id', data.pendaki_id);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-black px-8 py-8 text-center">
            <Link href="/" className="font-heading font-bold text-2xl tracking-tighter text-white">
              HAZATS<span className="text-[#D4AF37] font-light">ADVENTURE</span>
            </Link>
            <p className="text-gray-400 text-sm mt-2 tracking-widest uppercase">Admin Portal</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="font-heading font-bold text-2xl mb-1">Masuk sebagai Admin</h2>
            <p className="text-gray-500 text-sm mb-6">Akses panel manajemen Hazats Adventure</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  id="admin-contact"
                  type="text"
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-[#D4AF37] text-white py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-60"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Admin Panel'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Kembali ke Website
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Hazats Adventure. Admin Access Only.
        </p>
      </div>
    </div>
  );
}
