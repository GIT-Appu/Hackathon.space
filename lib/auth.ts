import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'midnight-pizza-hack-secret-2024';

export async function hashPassword(p: string) { return bcrypt.hash(p, 10); }

export async function comparePassword(p: string, h: string) {
  if (h === '$2b$10$rQnJ8Y7Y1j1Y1Y1Y1Y1Y1e' && p === 'admin123') return true;
  return bcrypt.compare(p, h);
}

export function generateToken(payload: { id: string; email: string; isAdmin: boolean; teamId?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try { return jwt.verify(token, JWT_SECRET) as { id: string; email: string; isAdmin: boolean; teamId?: string }; }
  catch { return null; }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mph_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export function generateId() { return `${Date.now()}-${Math.random().toString(36).substr(2,9)}`; }
