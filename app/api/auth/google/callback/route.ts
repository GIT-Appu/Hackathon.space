import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, generateId } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${APP_URL}/login?error=google_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_code`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Token exchange failed:', err);
      return NextResponse.redirect(`${APP_URL}/login?error=token exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=user_info_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const email = googleUser.email.toLowerCase();

    // Check if user exists, if not create them
    let user = await db.getUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      // Create new user with Google OAuth
      const userId = 'user-' + generateId();
      const teamId = 'team-' + generateId();

      await db.addUser({
        id: userId,
        email,
        password: 'google-oauth', // Placeholder - not used for Google users
        isAdmin: false,
        teamId,
        googleId: googleUser.id,
      });

      // Create a default team for Google users
      await db.addTeam({
        id: teamId,
        teamName: googleUser.name?.replace(/\s+/g, '') || 'Google User',
        collegeName: '',
        leaderName: googleUser.name || '',
        leaderEmail: email,
        leaderPhone: '',
        members: [{ name: googleUser.name || '', email, phone: '', role: 'leader' }],
        paymentStatus: 'pending',
        submissionStatus: 'not_submitted',
        registeredAt: new Date().toISOString(),
      });

      user = await db.getUserByEmail(email);
      isNewUser = true;
    }

    if (!user) {
      return NextResponse.redirect(`${APP_URL}/login?error=user_creation_failed`);
    }

    // Generate our JWT token
    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      teamId: user.teamId,
    });

    // Check if this is a new Google user who needs to complete registration
    const team = user.teamId ? await db.getTeamById(user.teamId) : null;
    const needsRegistration = !team || !team.collegeName;

    // Set cookie and redirect
    const res = NextResponse.redirect(
      needsRegistration 
        ? `${APP_URL}/register/google-complete` 
        : `${APP_URL}/dashboard`
    );

    res.cookies.set('mph_token', jwtToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return res;
  } catch (e) {
    console.error('Google OAuth callback error:', e);
    return NextResponse.redirect(`${APP_URL}/login?error=server_error`);
  }
}