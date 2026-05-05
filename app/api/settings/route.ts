import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET() {
  const settings = await db.getSettings();
  return NextResponse.json(settings);
}
