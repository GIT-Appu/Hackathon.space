import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await db.getSettings();
  if (!settings.problemRevealEnabled) return NextResponse.json({ error: 'Submissions not open yet' }, { status: 403 });
  const { videoLink, zipUrl, pdfUrl } = await req.json();
  await db.updateTeam(session.teamId, { submissionStatus: 'submitted', videoLink, zipUrl: zipUrl || undefined, pdfUrl: pdfUrl || undefined, submittedAt: new Date().toISOString() });
  return NextResponse.json({ success: true });
}
