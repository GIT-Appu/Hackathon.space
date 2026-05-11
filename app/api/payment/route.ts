import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { paymentId, paymentScreenshot } = await req.json();
  const fakePaymentId = paymentId || 'upi_' + Date.now();

  const team = await db.getTeamById(session.teamId);
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

  const updated = await db.updateTeam(session.teamId, {
    paymentStatus: 'pending_verification',
  });

  if (!updated) {
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: 'pending_verification' });
}
