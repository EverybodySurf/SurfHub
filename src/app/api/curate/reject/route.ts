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

// POST: Reject an item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, reason, reviewer } = body;
    
    // Read queue
    const data = await readFile(QUEUE_PATH, 'utf-8');
    const queue: QueueData = JSON.parse(data);
    
    // Find item in pending
    const itemIndex = queue.pending.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in pending queue' }, { status: 404 });
    }
    
    // Move from pending to rejected
    const item = queue.pending[itemIndex];
    item.status = 'rejected';
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewer || 'admin';
    item.rejectionReason = reason;
    
    queue.pending.splice(itemIndex, 1);
    queue.rejected.push(item);
    
    // Write back
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
    
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
  }
}