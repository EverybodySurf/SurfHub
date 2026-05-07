/**
 * Auto-fetch script for SurfHub content curation
 * 
 * Run: npx tsx scripts/auto-fetch.ts
 * 
 * This script fetches content from configured sources and adds to the queue.
 * Note: Instagram/YouTube/TikTok require API access or scraping tools.
 * For now, this is a placeholder that demonstrates the structure.
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { PendingItem, FeedType, scoreContent, matchesCriteria } from '../src/lib/curate/criteria';
import { SOURCES, getActiveSources, needsFetch, SourceConfig } from '../src/lib/curate/sources';

const QUEUE_PATH = join(process.cwd(), 'data', 'queue.json');

interface QueueData {
  pending: PendingItem[];
  approved: PendingItem[];
  rejected: PendingItem[];
}

// Placeholder fetch functions (would need real API integration)
async function fetchFromInstagram(handle: string): Promise<Partial<PendingItem>[]> {
  // TODO: Implement with Instagram API or Firecrawl scraping
  console.log(`[Instagram] Would fetch from ${handle}...`);
  return [];
}

async function fetchFromYouTube(channel: string): Promise<Partial<PendingItem>[]> {
  // TODO: Implement with YouTube Data API
  console.log(`[YouTube] Would fetch from ${channel}...`);
  return [];
}

async function fetchFromTikTok(handle: string): Promise<Partial<PendingItem>[]> {
  // TODO: Implement with TikTok API or scraping
  console.log(`[TikTok] Would fetch from ${handle}...`);
  return [];
}

async function fetchFromTwitter(handle: string): Promise<Partial<PendingItem>[]> {
  // TODO: Implement with Twitter/X API
  console.log(`[Twitter] Would fetch from ${handle}...`);
  return [];
}

// Fetch from a source based on platform
async function fetchFromSource(source: SourceConfig): Promise<Partial<PendingItem>[]> {
  switch (source.platform) {
    case 'instagram':
      return fetchFromInstagram(source.handle);
    case 'youtube':
      return fetchFromYouTube(source.handle);
    case 'tiktok':
      return fetchFromTikTok(source.handle);
    case 'twitter':
      return fetchFromTwitter(source.handle);
    default:
      return [];
  }
}

// Add items to queue
async function addToQueue(items: Partial<PendingItem>[], source: SourceConfig): Promise<number> {
  // Read existing queue
  let queue: QueueData = { pending: [], approved: [], rejected: [] };
  try {
    const data = await readFile(QUEUE_PATH, 'utf-8');
    queue = JSON.parse(data);
  } catch {
    // File doesn't exist
  }
  
  // Filter and score items
  const addedCount = 0;
  
  for (const item of items) {
    // Check if already in queue (avoid duplicates)
    const existing = queue.pending.find(p => p.url === item.url);
    if (existing) {
      console.log(`[Skip] Already in queue: ${item.url}`);
      continue;
    }
    
    // Check if matches criteria
    const pendingItem: PendingItem = {
      id: `fetch-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source: source.platform,
      url: item.url || '',
      title: item.title || '',
      content: item.content || '',
      creator: source.handle,
      location: item.location,
      feed: source.feed,
      type: item.type || 'reel',
      image: item.image,
      videoUrl: item.videoUrl,
      videoType: item.videoType,
      autoScore: 0.5, // Will be calculated
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    
    // Calculate score
    pendingItem.autoScore = scoreContent(pendingItem, source.feed);
    
    // Only add if score > threshold
    if (pendingItem.autoScore > 0.3 && matchesCriteria(pendingItem, source.feed)) {
      queue.pending.push(pendingItem);
      console.log(`[Added] ${pendingItem.title} (score: ${pendingItem.autoScore.toFixed(2)})`);
    } else {
      console.log(`[Filtered] ${pendingItem.title} (score: ${pendingItem.autoScore.toFixed(2)}, criteria: false)`);
    }
  }
  
  // Write back queue
  await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
  
  return queue.pending.length;
}

// Main fetch loop
async function main() {
  console.log('\n🌊 SurfHub Auto-Fetch\n');
  console.log('Checking sources...\n');
  
  const activeSources = getActiveSources();
  console.log(`Active sources: ${activeSources.length}`);
  
  let totalAdded = 0;
  
  for (const source of activeSources) {
    if (!needsFetch(source)) {
      console.log(`[Skip] ${source.handle} - not due for fetch`);
      continue;
    }
    
    console.log(`\n[Fetch] ${source.platform}/${source.handle} → ${source.feed} feed`);
    
    const items = await fetchFromSource(source);
    
    if (items.length > 0) {
      const added = await addToQueue(items, source);
      totalAdded += added;
    }
    
    // Update lastFetch time
    source.lastFetch = new Date().toISOString();
  }
  
  console.log(`\n✅ Done. Total items in queue: ${totalAdded}`);
}

// Run
main().catch(console.error);