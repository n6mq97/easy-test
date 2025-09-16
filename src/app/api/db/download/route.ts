import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    
    if (!fs.existsSync(dbPath)) {
      return new NextResponse('Database not found.', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="database.sqlite"');
    headers.append('Content-Type', 'application/x-sqlite3');

    return new Response(fileBuffer, {
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
