// Central API URL helper
// In production on Vercel: routes through /api/proxy to avoid CORS
// In development: routes directly to localhost backend

const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hazatsid-production.up.railway.app';

export function getApiUrl(): string {
  if (isDev || isServer) {
    return BACKEND_URL;
  }
  // Client-side in production: use our own proxy to bypass CORS
  return '/api/proxy';
}

export const API_URL = getApiUrl();

