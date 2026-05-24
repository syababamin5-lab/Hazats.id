import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import TripCatalog from '@/components/TripCatalog';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-white bg-black overflow-hidden shadow-sm flex-shrink-0">
                <img src="/logo.png" alt="Hazats Adventure" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading font-bold text-2xl tracking-tighter">
                HAZATS<span className="text-[#D4AF37] font-light">ADVENTURE</span>
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{t('tagline')}</p>
            <div className="mt-5 flex gap-3">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] flex items-center justify-center text-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] flex items-center justify-center text-gray-400 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-5">{t('quick_links')}</h4>
            <ul className="space-y-3">
              {[
                { label: t('home'), href: '/' },
                { label: t('trips'), href: '/#trips' },
                { label: t('register'), href: '/register' },
                { label: t('login'), href: '/login' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-5">{t('contact')}</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">📍</span>
                <span>Kabupaten Bandung, Jawa Barat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">📱</span>
                <a href="https://wa.me/6281234567890" className="hover:text-white transition-colors">+62 812-3456-7890</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4AF37] mt-0.5">✉️</span>
                <a href="mailto:info@hazats.id" className="hover:text-white transition-colors">info@hazats.id</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">© 2026 Hazats Adventure. {t('rights')}</p>
          <p className="text-gray-600 text-xs">Dibuat dengan ❤️ untuk para pendaki Jawa Barat</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Services />
        <TripCatalog />
      </main>
      <Footer />
    </>
  );
}
