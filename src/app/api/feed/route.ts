import { NextResponse } from 'next/server';
import { scrapeYouTube, scrapeInstagram } from '@/lib/scrapers';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { PendingItem } from '@/lib/curate/criteria';

const CURATE_PATH = join(process.cwd(), 'data', 'queue.json');

/** Read items from VPS-scraped data files (no browser needed) */
async function readVpsScrapeFile(filename: string): Promise<any[]> {
  try {
    const path = join(process.cwd(), 'data', filename);
    if (!existsSync(path)) return [];
    const data = await readFile(path, 'utf-8');
    const items = JSON.parse(data);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

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
const CURATED_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format';

/** Map a curated PendingItem to a feed item shape */
function curatedToFeedItem(item: PendingItem) {
  // Use the submitted image, or fall back to a default surf image
  const image = item.image || CURATED_FALLBACK_IMAGE;

  return {
    id: `curated_${item.id}`,
    feed: item.feed,
    size: item.type === 'reel' ? 'tall' : 'horizontal',
    type: item.type === 'video' || item.type === 'reel' ? 'video' : item.type,
    title: item.title,
    content: item.content,
    source: item.creator || 'Curated',
    location: item.location,
    image,
    thumbnailFallback: image,
    videoUrl: item.videoUrl,
    videoType: item.videoType || 'youtube',
    timestamp: item.originalPublishedAt || item.submittedAt,
    hasValidTimestamp: !!item.originalPublishedAt,
    platform: item.source,
    curated: true,
    isShort: item.type === 'reel',
  };
}

// Filter items to only those within last 90 days
function filterByAge(items: any[]): { filtered: any[], warnings: string[] } {
  const now = new Date();
  const maxAge = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
  
  const warnings: string[] = [];
  
  const filtered = items.filter(item => {
    // No timestamp = include (mock/curated items)
    if (!item.timestamp) return true;
    
    const publishedAt = new Date(item.timestamp);
    
    // Invalid timestamp = include with warning
    if (isNaN(publishedAt.getTime())) {
      warnings.push(`${item.id}: invalid timestamp "${item.timestamp}" (included with warning)`);
      return true;
    }
    
    // Outside 90-day window = exclude
    if (publishedAt < maxAge) return false;
    
    return true;
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

  // Always load curated items fresh (never cached — approvals must appear immediately)
  const allCurated = await getApprovedItems();
  const curatedItems = allCurated.map(curatedToFeedItem);

  // Check cache first (skip if force refresh)
  if (!forceRefresh) {
    const cached = getCachedFeed(feed);
    if (cached) {
      // Merge curated items into cached response (sorted by recency)
      const curatedIds = new Set(curatedItems.map(i => i.id));
      const nonCurated = cached.items.filter((i: any) => !curatedIds.has(i.id));
      const merged = [...curatedItems, ...nonCurated].sort((a: any, b: any) => {
        return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
      });
      return NextResponse.json({ ...cached, items: merged, count: merged.length });
    }
  }
  const useMock = searchParams.get('mock') === 'true';
  const filter24h = searchParams.get('filter24h') !== 'false'; // Default: true (90 days)
  
  // YouTube scraping
  let youtubeItems: any[] = [];
  
  if (!useMock) {
    // YouTube - use YouTube Data API v3 (FREE, real timestamps)
    // Feed-specific queries for targeted content — more queries & more results per query
    const MAX_RESULTS = 50;
    // Single query per feed to stay within YouTube API rate limits
    const youtubeQueries: Record<string, { query: string, feed: string }> = {
      feelgood: { query: 'soul surfing', feed: 'feelgood' },
      global: { query: 'surfing', feed: 'global' },
      local: { query: 'surfing guadeloupe', feed: 'local' },
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
  
  // Instagram — try VPS scraped data first, fall back to browser
  let instagramItems: any[] = [];
  
  if (!useMock) {
    // Try VPS-scraped data file first (no browser needed)
    const vpsItems = await readVpsScrapeFile('ig-feed.json');
    if (vpsItems.length > 0) {
      instagramItems = vpsItems.filter((p: any) => feed === 'all' || p.feed === feed);
      console.log(`📸 VPS data: ${instagramItems.length} Instagram posts for ${feed}`);
    }
    
    // Fall back to browser scraping
    if (instagramItems.length === 0) {
      const instagramQueries: Record<string, string> = {
        feelgood: 'soulsurfing',
        global: 'surfing',
        local: 'surfingguadeloupe',
      };
      const queriesToRun = feed === 'all'
        ? Object.values(instagramQueries)
        : [instagramQueries[feed]].filter(Boolean);
      for (const hashtag of queriesToRun) {
        try {
          const result = await scrapeInstagram(hashtag);
          if (result.success && result.items.length > 0) {
            console.log(`📸 Browser Instagram "${hashtag}" → ${result.items.length} posts`);
            instagramItems.push(...result.items.map((p: any) => ({
              id: `ig_${p.id}`,
              feed: feed !== 'all' ? feed : 'global',
              size: 'tall',
              type: p.type || 'photo',
              title: p.caption?.slice(0, 80) || 'Instagram Post',
              content: p.caption || '',
              source: p.source || '@instagram',
              image: p.image || '',
              timestamp: p.timestamp,
              hasValidTimestamp: p.hasValidTimestamp,
              platform: 'instagram',
              instagram: true,
            })));
          }
        } catch (e) {
          console.log(`📸 Instagram query "${hashtag}" failed:`, e);
        }
      }
      // Deduplicate by image URL
      const seenImgs = new Set<string>();
      instagramItems = instagramItems.filter((item: any) => {
        if (seenImgs.has(item.image)) return false;
        seenImgs.add(item.image);
        return true;
      });
    }
  }
  
  // Twitter/X — from VPS scraped data (no browser needed)
  let twitterItems: any[] = [];
  const vpsTwitter = await readVpsScrapeFile('x-feed.json');
  if (vpsTwitter.length > 0) {
    twitterItems = vpsTwitter.filter((p: any) => feed === 'all' || p.feed === feed);
    console.log(`🐦 VPS data: ${twitterItems.length} Tweets for ${feed}`);
  }
  
  // Blend everything sorted by publish date
  let allContent = [...curatedItems, ...youtubeItems, ...instagramItems, ...twitterItems].sort((a: any, b: any) => {
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });
  console.log(`📊 Feed: curated=${curatedItems.length}, yt=${youtubeItems.length}, ig=${instagramItems.length}, tw=${twitterItems.length}, total=${allContent.length}`);
  

  
  // Apply 90-day age filter
  let filteredContent = allContent;
  let warnings: string[] = [];
  
  if (filter24h) {
    const result = filterByAge(allContent);
    filteredContent = result.filtered;
    warnings = result.warnings;
  }
  
  // Filter by feed if specified
  if (feed !== 'all') {
    filteredContent = filteredContent.filter(item => item.feed === feed);
  }
  
  // Apply hidden items + feed overrides
  const [hiddenIds, feedOverrides] = await Promise.all([
    readVpsScrapeFile('hidden-content.json').then(h => new Set(h.map((x: any) => x.id))).catch(() => new Set()),
    readVpsScrapeFile('feed-overrides.json').catch(() => []),
  ]);
  const feedOverrideMap = new Map(feedOverrides.map((o: any) => [o.id, o.feed]));
  
  filteredContent = filteredContent
    .filter((item: any) => !hiddenIds.has(item.id))
    .map((item: any) => {
      // Apply feed override if exists
      const overrideFeed = feedOverrideMap.get(item.id);
      if (overrideFeed) item.feed = overrideFeed;
      return item;
    });
  
  // Sanitize images — replace video page URLs with proper thumbnails
  filteredContent = filteredContent.map((item: any) => {
    const img = item.image || '';
    // If image is a YouTube video URL (not a thumbnail), derive thumbnail
    if (img.includes('youtube.com/watch') || img.includes('youtu.be/') || img.includes('youtube.com/embed')) {
      const vid = img.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&]|$)/)?.[1];
      if (vid) {
        item.image = `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`;
      } else {
        item.image = ''; // clear bad URL, component will handle
      }
    }
    return item;
  });
  
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
      instagram: instagramItems.length,
      twitter: twitterItems.length,
    },
    warnings: warnings.length > 0 ? warnings : undefined,
    timestampStatus: {
      withValidTimestamp: filteredContent.length - itemsWithoutTimestamp,
      withoutValidTimestamp: itemsWithoutTimestamp,
    },
    scrapedAt: new Date().toISOString(),
    note: hasReal ? 'Real YouTube + curated' : 'Curated only',
  };

  // Cache the response
  setCachedFeed(feed, responseBody);

  return NextResponse.json(responseBody);
}