'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ contact: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login gagal');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('pendaki_id', data.pendaki_id);
      localStorage.setItem('name', data.name);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <Link href="/" className="font-heading font-bold text-2xl tracking-tighter">
            HAZATS<span className="text-gray-400 font-light">ADVENTURE</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-heading">
            Masuk Akun
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Atau <Link href="/register" className="font-medium text-[#D4AF37] hover:text-[#b8952b]">daftar akun baru di sini</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="contact" className="sr-only">Email / No. WA</label>
              <input id="contact" name="contact" type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:z-10 sm:text-sm" placeholder="Email / Nomor WhatsApp" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:z-10 sm:text-sm" placeholder="Kata Sandi" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors">
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
