import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null, team: null });
  const team = session.teamId ? await db.getTeamById(session.teamId) : null;
  return NextResponse.json({ user: session, team: team || null });
}
