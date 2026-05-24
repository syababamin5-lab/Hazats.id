'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {Globe, User, LayoutDashboard} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-heading font-bold text-2xl tracking-tighter">
              HAZATS<span className="text-gray-400 font-light">ADVENTURE</span>
            </Link>
          </div>

          {/* Right section: Lang Toggle & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => handleLanguageChange('id')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                  locale === 'id' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                  locale === 'en' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                EN
              </button>
            </div>

            {/* Login / Sign Up Button */}
            {mounted && isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hidden sm:flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                
                {/* Mobile Dashboard Button */}
                <Link href="/dashboard" className="sm:hidden flex items-center justify-center bg-black hover:bg-gray-800 text-white w-10 h-10 rounded-full transition-colors">
                  <LayoutDashboard size={18} />
                </Link>
              </>
            ) : mounted && !isLoggedIn ? (
              <>
                <Link href="/login" className="hidden sm:flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors">
                  <User size={18} />
                  <span>{t('login')}</span>
                </Link>
                
                {/* Mobile Login Button */}
                <Link href="/login" className="sm:hidden flex items-center justify-center bg-black hover:bg-gray-800 text-white w-10 h-10 rounded-full transition-colors">
                  <User size={18} />
                </Link>
              </>
            ) : (
              <div className="w-28 h-10 bg-gray-100 animate-pulse rounded-full hidden sm:block"></div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
