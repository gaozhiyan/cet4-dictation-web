import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Ensure public/data directory exists
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write data to file
    const filePath = path.join(dir, 'history-scores.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, count: data.length });
  } catch (error) {
    console.error('Error saving history data:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
