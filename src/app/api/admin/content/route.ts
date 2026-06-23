// /api/admin/content — Review all scraped + curated content
import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const HIDDEN_FILE = join(DATA_DIR, 'hidden-content.json');

async function readJSON(path: string): Promise<any[]> {
  try {
    if (!existsSync(path)) return [];
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch { return []; }
}

async function getHiddenIds(): Promise<Set<string>> {
  const hidden = await readJSON(HIDDEN_FILE);
  return new Set(hidden.map((h: any) => h.id));
}

/** Map a source-tagged item to a review card shape */
function toReviewItem(item: any, source: string, hiddenIds: Set<string>) {
  return {
    id: item.id,
    title: item.title || item.content?.slice(0, 80) || '',
    content: item.content || '',
    image: item.image || '',
    feed: item.feed || 'global',
    platform: item.platform || source,
    source: source,
    timestamp: item.timestamp || '',
    hidden: hiddenIds.has(item.id),
  };
}

export async function GET() {
  const hiddenIds = await getHiddenIds();

  // Gather from all sources
  const youtube = (await readJSON(join(DATA_DIR, 'feed-cache.json'))).slice(0, 50);
  const instagram = await readJSON(join(DATA_DIR, 'ig-feed.json'));
  const twitter = await readJSON(join(DATA_DIR, 'x-feed.json'));

  // Queue.json curated items
  let curated: any[] = [];
  let pendingItems: any[] = [];
  try {
    const q = JSON.parse(await readFile(join(DATA_DIR, 'queue.json'), 'utf-8'));
    curated = [...(q.approved || [])];
    pendingItems = [...(q.pending || [])];
  } catch {}

  const items = [
    ...pendingItems.map((i: any) => ({ ...toReviewItem(i, 'curated', hiddenIds), status: 'pending' })),
    ...curated.map((i: any) => ({ ...toReviewItem(i, 'curated', hiddenIds), status: 'approved' })),
    ...instagram.map((i: any) => ({ ...toReviewItem(i, 'instagram', hiddenIds), status: 'auto' })),
    ...twitter.map((i: any) => ({ ...toReviewItem(i, 'twitter', hiddenIds), status: 'auto' })),
  ];

  return NextResponse.json({
    success: true,
    count: items.length,
    stats: {
      total: items.length,
      pending: pendingItems.length,
      visible: items.filter(i => !i.hidden).length,
      hidden: items.filter(i => i.hidden).length,
      bySource: {
        curated: curated.length,
        pending: pendingItems.length,
        instagram: instagram.length,
        twitter: twitter.length,
      },
    },
    items,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, itemId, newFeed } = body;

    let hidden = await readJSON(HIDDEN_FILE);

    if (action === 'hide') {
      if (!hidden.find((h: any) => h.id === itemId)) {
        hidden.push({ id: itemId, hiddenAt: new Date().toISOString() });
      }
    } else if (action === 'unhide') {
      hidden = hidden.filter((h: any) => h.id !== itemId);
    } else if (action === 'approve') {
      // Approve a pending queue item
      const q = JSON.parse(await readFile(join(DATA_DIR, 'queue.json'), 'utf-8'));
      const idx = q.pending.findIndex((i: any) => i.id === itemId);
      if (idx >= 0) {
        const item = q.pending.splice(idx, 1)[0];
        item.status = 'approved';
        item.reviewedAt = new Date().toISOString();
        item.reviewedBy = 'admin';
        q.approved.push(item);
        await writeFile(join(DATA_DIR, 'queue.json'), JSON.stringify(q, null, 2));
      }
    } else if (action === 'reject') {
      const q = JSON.parse(await readFile(join(DATA_DIR, 'queue.json'), 'utf-8'));
      const idx = q.pending.findIndex((i: any) => i.id === itemId);
      if (idx >= 0) {
        const item = q.pending.splice(idx, 1)[0];
        item.status = 'rejected';
        item.reviewedAt = new Date().toISOString();
        item.reviewedBy = 'admin';
        q.rejected.push(item);
        await writeFile(join(DATA_DIR, 'queue.json'), JSON.stringify(q, null, 2));
      }
    } else if (action === 'move-feed') {
      // Move item between feeds — we store feed overrides
      const overrides = await readJSON(join(DATA_DIR, 'feed-overrides.json'));
      const existing = overrides.findIndex((o: any) => o.id === itemId);
      if (existing >= 0) overrides[existing].feed = newFeed;
      else overrides.push({ id: itemId, feed: newFeed });
      await writeFile(join(DATA_DIR, 'feed-overrides.json'), JSON.stringify(overrides, null, 2));
    }

    await writeFile(HIDDEN_FILE, JSON.stringify(hidden, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
