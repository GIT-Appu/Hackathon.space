import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { teamId, scores, rank } = await req.json();
  const total = (scores.innovation + scores.relevance + scores.technical + scores.uiux);
  await db.updateTeam(teamId, { scores: { ...scores, total }, rank: rank || undefined });
  return NextResponse.json({ success: true });
}
