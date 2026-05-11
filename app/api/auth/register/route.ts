import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, generateId, getSession, generateTempPassword } from '@/lib/auth';
import { sendWelcomeEmail, sendMemberInvitationEmail, sendAdminRegistrationNotification } from '@/lib/email';

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

    const memberList = (members || []).filter((m: { name?: string; email?: string }) => m.name?.trim() && m.email?.trim()).map((m: { name: string; email: string; phone?: string }) => ({
      ...m,
      email: m.email.toLowerCase().trim(),
      role: 'member' as const,
    }));

    const team = await db.addTeam({
      id: teamId, teamName, collegeName, leaderName,
      leaderEmail: email.toLowerCase().trim(), leaderPhone,
      members: [{ name: leaderName, email: email.toLowerCase().trim(), phone: leaderPhone, role: 'leader' }, ...memberList],
      paymentStatus: 'pending', submissionStatus: 'not_submitted',
      registeredAt: new Date().toISOString(),
    });

    await db.addUser({ id: userId, email: email.toLowerCase().trim(), password: hashedPw, isAdmin: false, teamId });

    // Create login users for team members and email them credentials
    for (const member of memberList) {
      const existingMemberUser = await db.getUserByEmail(member.email.toLowerCase().trim());
      if (existingMemberUser) {
        continue;
      }

      const tempPassword = generateTempPassword(10);
      const memberUserId = 'user-' + generateId();
      const hashedMemberPw = await hashPassword(tempPassword);
      await db.addUser({ id: memberUserId, email: member.email.toLowerCase().trim(), password: hashedMemberPw, isAdmin: false, teamId });
      await sendMemberInvitationEmail(member.name, member.email.toLowerCase().trim(), teamName, leaderName, tempPassword);
    }

    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), isAdmin: false, teamId });

    // Send automated emails
    await sendWelcomeEmail(teamName, email.toLowerCase().trim(), leaderName);
    
    // Notify admin about new registration
    await sendAdminRegistrationNotification(teamName, leaderName, email.toLowerCase().trim(), memberList.length + 1);

    const res = NextResponse.json({ user: { id: userId, email, isAdmin: false, teamId }, team });
    res.cookies.set('mph_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
