import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'search-terms.json');

// GET current search terms
export async function GET() {
  try {
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({
        sources: {
          'unsplash-surfing': { searchQuery: 'Surfing & Ocean Style', active: true },
          'pexels-surfing': { searchQuery: 'Surfing & Ocean Style', active: true },
        },
        lastUpdated: null,
      });
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read search terms' }, { status: 500 });
  }
}

// PUT update search terms
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, searchQuery, active } = body;
    
    // Read current data
    let data: any = {
      sources: {},
      lastUpdated: null,
    };
    
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Update the specific source
    if (sourceId && data.sources[sourceId]) {
      if (searchQuery !== undefined) {
        data.sources[sourceId].searchQuery = searchQuery;
      }
      if (active !== undefined) {
        data.sources[sourceId].active = active;
      }
      data.lastUpdated = new Date().toISOString();
      
      // Write back
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      
      return NextResponse.json({ success: true, data });
    }
    
    return NextResponse.json({ error: 'Invalid source ID' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update search terms' }, { status: 500 });
  }
}

// POST add new source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, type, searchQuery } = body;
    
    if (!sourceId || !type || !searchQuery) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Read current data
    let data: any = { sources: {}, lastUpdated: null };
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Add new source
    data.sources[sourceId] = {
      type,
      searchQuery,
      active: true,
    };
    data.lastUpdated = new Date().toISOString();
    
    // Write back
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}