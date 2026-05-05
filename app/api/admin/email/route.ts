import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { subject, message, recipientFilter } = await req.json();
  if (!subject || !message) return NextResponse.json({ error: 'Subject and message required' }, { status: 400 });

  const teams = await db.getAllTeams();
  const recipients = teams.filter(t => {
    if (recipientFilter === 'paid') return t.paymentStatus === 'paid';
    if (recipientFilter === 'unpaid') return t.paymentStatus !== 'paid';
    if (recipientFilter === 'submitted') return t.submissionStatus === 'submitted';
    return true; // 'all'
  }).map(t => t.leaderEmail);

  // Send emails to all recipients
  const results = await Promise.all(
    recipients.map(email => sendEmail(email, subject, message))
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`[EMAIL] Sent to ${successful}/${recipients.length} recipients`);

  return NextResponse.json({ 
    success: true, 
    sent: successful, 
    failed,
    total: recipients.length,
    recipients 
  });
}
