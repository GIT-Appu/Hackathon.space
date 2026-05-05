import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, generateId, getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, teamName, collegeName, leaderName, leaderPhone, members, googleComplete } = body;
    
    // Check for Google OAuth users - they already have a user account
    let session = null;
    if (googleComplete) {
      session = await getSession();
    }

    // If Google complete flag is set, update the existing user's team
    if (googleComplete && session) {
      const user = await db.getUserByEmail(session.email);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const allTeams = await db.getAllTeams();
      const teamByName = allTeams.find(t => t.teamName.toLowerCase() === teamName.toLowerCase() && t.id !== user.teamId);
      if (teamByName) return NextResponse.json({ error: 'Team name already taken' }, { status: 409 });

      // Update the existing team
      const updatedTeam = await db.updateTeam(user.teamId, {
        teamName,
        collegeName,
        leaderName: leaderName || 'Google User',
        leaderPhone,
        members: [{ name: leaderName || 'Google User', email: user.email, phone: leaderPhone, role: 'leader' }, ...(members || []).map((m: { name: string; email: string; phone?: string }) => ({ ...m, role: 'member' as const }))],
      });

      if (!updatedTeam) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

      return NextResponse.json({ user: { id: user.id, email: user.email, isAdmin: user.isAdmin, teamId: user.teamId }, team: updatedTeam });
    }

    // Normal registration flow
    if (!email || !password || !teamName || !leaderName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const existing = await db.getUserByEmail(email.toLowerCase().trim());
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const allTeams = await db.getAllTeams();
    const teamByName = allTeams.find(t => t.teamName.toLowerCase() === teamName.toLowerCase());
    if (teamByName) return NextResponse.json({ error: 'Team name already taken' }, { status: 409 });

    const teamId = 'team-' + generateId();
    const userId = 'user-' + generateId();
    const hashedPw = await hashPassword(password);

    const team = await db.addTeam({
      id: teamId, teamName, collegeName, leaderName,
      leaderEmail: email.toLowerCase().trim(), leaderPhone,
      members: [{ name: leaderName, email: email.toLowerCase().trim(), phone: leaderPhone, role: 'leader' }, ...(members || []).map((m: { name: string; email: string; phone?: string }) => ({ ...m, role: 'member' as const }))],
      paymentStatus: 'pending', submissionStatus: 'not_submitted',
      registeredAt: new Date().toISOString(),
    });

    await db.addUser({ id: userId, email: email.toLowerCase().trim(), password: hashedPw, isAdmin: false, teamId });
    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), isAdmin: false, teamId });

    const res = NextResponse.json({ user: { id: userId, email, isAdmin: false, teamId }, team });
    res.cookies.set('mph_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
