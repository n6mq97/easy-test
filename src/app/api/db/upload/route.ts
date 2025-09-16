import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('No file uploaded.', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dbPath = path.join(process.cwd(), 'database.sqlite');

    fs.writeFileSync(dbPath, buffer);

    return new NextResponse('Database uploaded successfully.', { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
