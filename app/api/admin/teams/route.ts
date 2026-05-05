import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const teams = await db.getAllTeams();
  return NextResponse.json(teams);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('id');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
  }

  const team = await db.getTeamById(teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Delete the team
  const success = await db.deleteTeam(teamId);

  if (success) {
    return NextResponse.json({ success: true, message: 'Team deleted' });
  } else {
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
