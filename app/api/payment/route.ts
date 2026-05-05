import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { paymentId, paymentScreenshot } = await req.json();
  const fakePaymentId = paymentId || 'upi_' + Date.now();
  await db.updateTeam(session.teamId, {
    paymentStatus: 'pending_verification',  // Changed from 'paid' - needs admin verification
    // paymentId: fakePaymentId,  // Removed - column doesn't exist in DB
  });
  return NextResponse.json({ success: true, status: 'pending_verification' });
}
