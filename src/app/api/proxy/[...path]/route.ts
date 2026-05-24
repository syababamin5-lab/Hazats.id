import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://hazatsid-production.up.railway.app';

async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathStr = path.join('/');
  const url = new URL(req.url);
  const targetUrl = `${BACKEND}/${pathStr}${url.search}`;

  const headers: Record<string, string> = {};
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  const ct = req.headers.get('content-type');
  if (ct) headers['Content-Type'] = ct;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try { body = await req.text(); } catch {}
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body || undefined,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch (e: any) {
    console.error('PROXY ERROR:', e);
    return NextResponse.json({ detail: 'Server tidak dapat dijangkau. Coba lagi.' }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
