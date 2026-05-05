import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { teamId, verified } = await req.json();
  
  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
  }

  const team = await db.getTeamById(teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Update payment status
  const newStatus = verified ? 'paid' : 'rejected';
  await db.updateTeam(teamId, { 
    paymentStatus: newStatus,
    // paymentVerifiedAt: verified ? new Date().toISOString() : undefined,  // Removed - column doesn't exist in DB
  });

  return NextResponse.json({ 
    success: true, 
    message: verified ? 'Payment verified' : 'Payment rejected',
    paymentStatus: newStatus,
  });
}