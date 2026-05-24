import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  matcher: [
    // Redirect root dan semua path tanpa locale prefix, KECUALI /api/
    '/',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
