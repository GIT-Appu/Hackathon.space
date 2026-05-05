import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/admin'];
const ADMIN_ONLY = ['/admin'];
const AUTH_PAGES = ['/login', '/register'];

// Lightweight base64url decode for edge runtime
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as { id: string; email: string; isAdmin: boolean; exp: number };
  } catch { return null; }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('mph_token')?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const isValid = payload && payload.exp * 1000 > Date.now();
  const session = isValid ? payload : null;

  if (AUTH_PAGES.some(p => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL(session.isAdmin ? '/admin' : '/dashboard', req.url));
  }

  if (PROTECTED.some(p => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (ADMIN_ONLY.some(p => pathname.startsWith(p)) && session && !session.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
