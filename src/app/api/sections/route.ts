import { NextResponse } from 'next/server';
import { getSections } from '@/lib/database';

export async function GET() {
  try {
    const sections = getSections();
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
} 