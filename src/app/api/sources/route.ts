import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SOURCES_PATH = join(process.cwd(), 'data', 'sources.json');

interface ContentSource {
  id: string;
  type: 'youtube-channel' | 'instagram-account' | 'tiktok-account' | 'rss-feed' | 'hashtag';
  label: string;
  url: string;
  feed: 'feelgood' | 'local' | 'global';
  active: boolean;
  addedAt: string;
  lastFetchedAt?: string;
}

// GET: List all sources
export async function GET() {
  try {
    const data = await readFile(SOURCES_PATH, 'utf-8');
    const sources: ContentSource[] = JSON.parse(data);
    return NextResponse.json({ sources }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ sources: [] });
  }
}

// POST: Add a new source
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSource: ContentSource = {
      id: `source-${Date.now()}`,
      type: body.type,
      label: body.label,
      url: body.url,
      feed: body.feed || 'feelgood',
      active: true,
      addedAt: new Date().toISOString(),
    };

    let sources: ContentSource[] = [];
    try {
      const data = await readFile(SOURCES_PATH, 'utf-8');
      sources = JSON.parse(data);
    } catch {
      // File doesn't exist
    }

    sources.push(newSource);
    await writeFile(SOURCES_PATH, JSON.stringify(sources, null, 2));

    return NextResponse.json({ success: true, source: newSource });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}

// DELETE: Remove a source by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const data = await readFile(SOURCES_PATH, 'utf-8');
    let sources: ContentSource[] = JSON.parse(data);
    sources = sources.filter((s) => s.id !== id);
    await writeFile(SOURCES_PATH, JSON.stringify(sources, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove source' }, { status: 500 });
  }
}
