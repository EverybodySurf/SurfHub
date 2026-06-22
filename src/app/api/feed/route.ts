import { NextResponse } from 'next/server';
import { scrapeYouTube } from '@/lib/scrapers';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { PendingItem } from '@/lib/curate/criteria';

const CURATE_PATH = join(process.cwd(), 'data', 'queue.json');

/** Read approved curation items from queue.json */
async function getApprovedItems(): Promise<PendingItem[]> {
  try {
    const data = await readFile(CURATE_PATH, 'utf-8');
    const queue = JSON.parse(data);
    return queue.approved || [];
  } catch {
    return [];
  }
}

/** Map a curated PendingItem to a feed item shape */
function curatedToFeedItem(item: PendingItem) {
  return {
    id: `curated_${item.id}`,
    feed: item.feed,
    size: item.type === 'reel' ? 'tall' : 'horizontal',
    type: item.type === 'video' || item.type === 'reel' ? 'video' : item.type,
    title: item.title,
    content: item.content,
    source: item.creator || 'Curated',
    location: item.location,
    image: item.image,
    videoUrl: item.videoUrl,
    videoType: item.videoType || 'youtube',
    timestamp: item.submittedAt,
    hasValidTimestamp: true,
    platform: item.source,
    curated: true,
    isShort: item.type === 'reel',
  };
}

// Filter items to only those within last 72 hours (3 days for broader content)
function filterBy72Hours(items: any[]): { filtered: any[], warnings: string[] } {
  const now = new Date();
  const hoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours
  
  const warnings: string[] = [];
  
  const filtered = items.filter(item => {
    // Check if item has valid timestamp
    if (!item.timestamp) {
      warnings.push(`${item.id || 'unknown'}: no timestamp (included with warning)`);
      return true; // Include with warning
    }
    
    const publishedAt = new Date(item.timestamp);
    
    // Check if timestamp is valid
    if (isNaN(publishedAt.getTime())) {
      warnings.push(`${item.id}: invalid timestamp "${item.timestamp}" (included with warning)`);
      return true; // Include with warning
    }
    
    // Check if within 72 hours
    if (publishedAt >= hoursAgo) {
      return true; // Fresh content (within 72hr)
    }
    
    return false; // Older than 24 hours - exclude
  });
  
  return { filtered, warnings };
}

/**
 * Detect YouTube Shorts using duration + tags. No extra API calls.
 * Avoids YouTube rate limiting entirely.
 *
 * Heuristic:
 * - Duration < 60s AND (title has #shorts OR duration < 40s)
 * - Under 40s without #shorts tag is still likely a short
 * - Over 60s = definitely not a short
 */
async function detectShorts(videoIds: string[]): Promise<Map<string, boolean>> {
  const shortsMap = new Map<string, boolean>();
  if (videoIds.length === 0) return shortsMap;

  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return shortsMap;

  try {
    const chunkSize = 50;
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize);
      const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${chunk.join(',')}&key=${API_KEY}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.items) continue;

      for (const video of data.items) {
        const title = video.snippet?.title || '';
        const hasShortTag = title.toLowerCase().includes('#shorts');

        const duration = video.contentDetails?.duration || 'PT0S';
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        const totalSeconds = (parseInt(match?.[1] || '0') * 60) + parseInt(match?.[2] || '0');

        // Short = under 60s AND (has #shorts OR under 40s)
        // Under 40s without tag is still very likely a short
        const isShort = totalSeconds < 60 && (hasShortTag || totalSeconds < 40);
        shortsMap.set(video.id, isShort);
      }
    }
  } catch (e) {
    console.log('Failed to detect shorts:', e);
    videoIds.forEach(id => shortsMap.set(id, false));
  }

  return shortsMap;
}
// ── Simple in-memory cache (6 hour TTL — refreshed by cron every 3hr) ──
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const feedCache = new Map<string, { data: any; timestamp: number }>();

function getCachedFeed(feed: string): any | null {
  const cached = feedCache.get(feed);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedFeed(feed: string, data: any) {
  feedCache.set(feed, { data, timestamp: Date.now() });
}

/** Force-refresh the cache — called by cron every 3 hours */
export async function refreshFeedCache(): Promise<void> {
  feedCache.clear();
}

// Unified feed endpoint — aggregates all scraped content with 24hr filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feed = searchParams.get('feed') || 'all'; // feelgood, local, global, all
  const forceRefresh = searchParams.get('refresh') === 'true';

  // Check cache first (skip if force refresh)
  if (!forceRefresh) {
    const cached = getCachedFeed(feed);
    if (cached) {
      return NextResponse.json(cached);
    }
  }
  const useMock = searchParams.get('mock') === 'true';
  const filter24h = searchParams.get('filter24h') !== 'false'; // Default: true
  
  // YouTube scraping only — browser scrapers removed for reliability
  let youtubeItems: any[] = [];
  
  if (!useMock) {
    // YouTube - use YouTube Data API v3 (FREE, real timestamps)
    // Feed-specific queries for targeted content — more queries & more results per query
    const MAX_RESULTS = 50;
    // Single query per feed to stay within YouTube API rate limits
    const youtubeQueries: Record<string, { query: string, feed: string }> = {
      feelgood: { query: 'soul surfing waves ocean', feed: 'feelgood' },
      global: { query: 'surfing big waves', feed: 'global' },
      local: { query: 'Guadeloupe surf', feed: 'local' },
    };
    
    // Determine which queries to run based on feed param
    const queriesToRun = feed === 'all' 
      ? Object.values(youtubeQueries) 
      : Object.values(youtubeQueries).filter(q => q.feed === feed);
    
    console.log(`🎥 YouTube queries: ${queriesToRun.map(q => q.query).join(', ')}`);
    
    // Run YouTube queries (parallel or sequential to conserve quota)
    for (const { query, feed: targetFeed } of queriesToRun) {
      try {
        const result = await scrapeYouTube(query, MAX_RESULTS);
        if (result.success && result.items.length > 0) {
          console.log(`🎥 "${query}" → ${result.items.length} videos for ${targetFeed}`);
          const mappedVideos = result.items.map((v: any) => {
            const videoId = v.id;
            return {
              id: `yt_${videoId}`,
              feed: targetFeed,
              size: 'horizontal',
              type: 'video',
              title: v.title || '',
              content: v.title?.slice(0, 100) || '',
              source: v.source || '',
              videoUrl: v.videoUrl || '',
              image: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
              thumbnailFallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              timestamp: v.timestamp,
              hasValidTimestamp: v.hasValidTimestamp,
              platform: 'youtube',
              channelId: v.channelId || '',
              channelTitle: v.channelTitle || v.source || '',
            };
          });
          youtubeItems.push(...mappedVideos);
        } else {
          console.log(`🎥 "${query}" → no results`);
        }
      } catch (e) {
        console.log(`YouTube query "${query}" failed:`, e);
      }
    }
    
    // Deduplicate by video ID (same video may appear in multiple queries)
    const seenIds = new Set<string>();
    youtubeItems = youtubeItems.filter(item => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
    console.log(`🎥 After dedup: ${youtubeItems.length} unique videos`);

    // Detect shorts via batch videos API
    if (youtubeItems.length > 0) {
      const videoIds = youtubeItems
        .map(item => item.id.replace(/^yt_/, ''))
        .filter(Boolean) as string[];

      const shortsMap = await detectShorts(videoIds);

      youtubeItems = youtubeItems.map(item => {
        const videoId = item.id.replace(/^yt_/, '');
        let isShort = shortsMap.get(videoId);

        // Fallback: check title for #Shorts if API didn't return info
        if (isShort === undefined) {
          isShort = (item.title || '').toLowerCase().includes('#shorts');
        }

        return { ...item, isShort: !!isShort, size: isShort ? 'tall' : 'horizontal' };
      });
    }
  }
  
  // Mock fallback content (used when scrapers fail — included with platform='youtube'
  // so the feed components treat them as real video cards)
  const mockContent = [
    // HARDCODED YOUTUBE VIDEOS (fallback when API quota exhausted)
    { id: 'fb_yt_1', feed: 'feelgood', size: 'horizontal', type: 'video', title: 'Morning Glass', content: 'Perfect morning surf session', source: 'SurfVision', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_2', feed: 'feelgood', size: 'horizontal', type: 'video', title: 'Soul Surfing', content: 'Let the ocean heal your soul', source: 'WaveRider', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_3', feed: 'feelgood', size: 'horizontal', type: 'video', title: 'Wave Wisdom', content: 'What the ocean teaches us', source: 'CoastalVibes', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_4', feed: 'feelgood', size: 'tall', type: 'video', title: 'Empty Lineup', content: 'Just you and the swell', source: 'SurfStories', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_5', feed: 'feelgood', size: 'tall', type: 'video', title: 'Golden Hour', content: 'When light hits the water just right', source: 'OceanVibes', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_6', feed: 'feelgood', size: 'tall', type: 'video', title: 'Drift Days', content: 'Where time slows down', source: 'SurfLife', image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_7', feed: 'feelgood', size: 'tall', type: 'video', title: 'Ocean Breath', content: 'Breathe in the salt air', source: 'CoastalCalm', image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_8', feed: 'feelgood', size: 'horizontal', type: 'video', title: 'Sunrise Paddle', content: 'Dawn patrol at its finest', source: 'SurfVision', image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_9', feed: 'global', size: 'horizontal', type: 'video', title: 'Pipeline Masters', content: 'Best rides from the North Shore', source: 'WSL', image: 'https://images.unsplash.com/photo-1659927005364-9ba5f84af96d?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_10', feed: 'global', size: 'horizontal', type: 'video', title: 'Teahupo\'o 2026', content: 'Heavy barrels from Tahiti', source: 'SurfWorld', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_11', feed: 'global', size: 'tall', type: 'video', title: 'Barrel of the Year', content: 'Riding the wave of a lifetime', source: 'BigWaveTV', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_12', feed: 'global', size: 'tall', type: 'video', title: 'Surfing Mentawai', content: 'Paradise found in Indonesia', source: 'SurfTribe', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_13', feed: 'global', size: 'tall', type: 'video', title: 'Jaws at Sunset', content: 'Big wave legends charging', source: 'MegaSwell', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_14', feed: 'local', size: 'horizontal', type: 'video', title: 'Caravelle Session', content: 'Morning waves in Sainte-Anne', source: 'GwadaSurf', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_15', feed: 'local', size: 'tall', type: 'video', title: 'Anse Bertrand', content: 'North coast powerhouse', source: 'LocalSurf', image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_16', feed: 'local', size: 'tall', type: 'video', title: 'La Chapelle', content: 'Reef break at its best', source: 'GwadaWaves', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
    { id: 'fb_yt_17', feed: 'local', size: 'horizontal', type: 'video', title: 'Pointe des Châteaux', content: 'Epic sunrise session', source: 'GwadaShots', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: false },
    { id: 'fb_yt_18', feed: 'local', size: 'tall', type: 'video', title: 'Port Louis', content: 'Afternoon offshore glass', source: 'GwadaLocals', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=800&auto=format', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', timestamp: new Date().toISOString(), hasValidTimestamp: false, platform: 'youtube', isShort: true },
  ];
  
  // Merge: real scraped + mock fallback
  // Merge curated approved content (takes priority)
  const allCurated = await getApprovedItems();
  const curatedItems = allCurated.map(curatedToFeedItem);

  const allContent = [...curatedItems, ...youtubeItems, ...mockContent];
  console.log(`📊 Merge: curated=${curatedItems.length}, yt=${youtubeItems.length}, mock=${mockContent.length}, total=${allContent.length}`);
  
  // Apply 72hr filter
  let filteredContent = allContent;
  let warnings: string[] = [];
  
  if (filter24h) {
    const result = filterBy72Hours(allContent);
    filteredContent = result.filtered;
    warnings = result.warnings;
  }
  
  // Filter by feed if specified
  if (feed !== 'all') {
    filteredContent = filteredContent.filter(item => item.feed === feed);
  }
  
  const hasReal = youtubeItems.length > 0;
  const itemsWithoutTimestamp = filteredContent.filter(item => !item.hasValidTimestamp).length;
  
  const responseBody = {
    success: true,
    feed,
    real: hasReal,
    filter24h,
    items: filteredContent,
    count: filteredContent.length,
    counts: {
      youtube: youtubeItems.length,
      mock: mockContent.length,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
    timestampStatus: {
      withValidTimestamp: filteredContent.length - itemsWithoutTimestamp,
      withoutValidTimestamp: itemsWithoutTimestamp,
    },
    scrapedAt: new Date().toISOString(),
    note: hasReal ? 'Real scraping + mock fallback' : 'All mock data',
  };

  // Cache the response
  setCachedFeed(feed, responseBody);

  return NextResponse.json(responseBody);
}