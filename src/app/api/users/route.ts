import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/database';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const userId = createUser(username.trim());
    return NextResponse.json({ id: userId, username: username.trim() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 