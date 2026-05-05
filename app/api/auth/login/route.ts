import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await db.getUserByEmail(email.toLowerCase().trim());
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const team = user.teamId ? await db.getTeamById(user.teamId) : null;
    const token = generateToken({ id: user.id, email: user.email, isAdmin: user.isAdmin, teamId: user.teamId });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, isAdmin: user.isAdmin, teamId: user.teamId }, team: team || null });
    res.cookies.set('mph_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
