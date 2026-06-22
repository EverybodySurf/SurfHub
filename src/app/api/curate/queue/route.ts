import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { PendingItem } from '@/lib/curate/criteria';

const QUEUE_PATH = join(process.cwd(), 'data', 'queue.json');

interface QueueData {
  pending: PendingItem[];
  approved: PendingItem[];
  rejected: PendingItem[];
}

// GET: Fetch pending items
export async function GET() {
  try {
    const data = await readFile(QUEUE_PATH, 'utf-8');
    const queue: QueueData = JSON.parse(data);
    
    return NextResponse.json({
      pending: queue.pending.sort((a, b) => b.autoScore - a.autoScore), // Highest score first
      counts: {
        pending: queue.pending.length,
        approved: queue.approved.length,
        rejected: queue.rejected.length,
      },
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    // Return empty queue if file doesn't exist
    return NextResponse.json({
      pending: [],
      counts: { pending: 0, approved: 0, rejected: 0 },
    });
  }
}

// POST: Add new item to pending queue
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem: PendingItem = {
      id: `queue-${Date.now()}`,
      source: body.source,
      url: body.url,
      title: body.title,
      content: body.content,
      creator: body.creator,
      location: body.location,
      feed: body.feed,
      type: body.type,
      image: body.image,
      videoUrl: body.videoUrl,
      videoType: body.videoType,
      autoScore: body.autoScore || 0.5,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    
    // Read existing queue
    let queue: QueueData = { pending: [], approved: [], rejected: [] };
    try {
      const data = await readFile(QUEUE_PATH, 'utf-8');
      queue = JSON.parse(data);
    } catch {
      // File doesn't exist, use empty queue
    }
    
    // Add to pending
    queue.pending.push(newItem);
    
    // Write back
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
    
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}