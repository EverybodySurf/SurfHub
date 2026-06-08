import { NextResponse } from 'next/server';
import { scrapeYouTube } from '@/lib/scrapers';

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
 * Detect whether YouTube videos are Shorts by querying the videos API
 * with part=player and checking embed height vs width.
 */
async function detectShorts(videoIds: string[]): Promise<Map<string, boolean>> {
  const shortsMap = new Map<string, boolean>();
  if (videoIds.length === 0) return shortsMap;

  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return shortsMap;

  try {
    // YouTube API accepts up to 50 IDs per request
    const chunkSize = 50;
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize);
      const url = `https://www.googleapis.com/youtube/v3/videos?part=player&id=${chunk.join(',')}&key=${API_KEY}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const data = await res.json();
      if (!data.items) continue;

      for (const video of data.items) {
        const player = video.player;
        // If embed height > width, it's a portrait/short video
        const isShort = player?.embedHeight > player?.embedWidth;
        shortsMap.set(video.id, !!isShort);
      }
    }
  } catch (e) {
    console.log('Failed to detect shorts:', e);
  }

  return shortsMap;
}

// Unified feed endpoint — aggregates all scraped content with 24hr filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feed = searchParams.get('feed') || 'all'; // feelgood, local, global, all
  const useMock = searchParams.get('mock') === 'true';
  const filter24h = searchParams.get('filter24h') !== 'false'; // Default: true
  
  // YouTube scraping only — browser scrapers removed for reliability
  let youtubeItems: any[] = [];
  
  if (!useMock) {
    // YouTube - use YouTube Data API v3 (FREE, real timestamps)
    // Feed-specific queries for targeted content — more queries & more results per query
    const MAX_RESULTS = 30;
    const youtubeQueries: Record<string, { query: string, feed: string }> = {
      feelgood: { query: 'Soul surfing', feed: 'feelgood' },
      feelgoodNature: { query: 'surfing nature ocean relaxation', feed: 'feelgood' },
      global: { query: 'Surfing', feed: 'global' },
      globalFresh: { query: 'Surfing today', feed: 'global' },
      globalBig: { query: 'big wave surfing', feed: 'global' },
      globalTravel: { query: 'surf travel vlog', feed: 'global' },
      local: { query: 'Surfing guadeloupe', feed: 'local' },
      localGwada: { query: 'Guadeloupe surf', feed: 'local' },
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
          const mappedVideos = result.items.map((v: any) => ({
            id: `yt_${v.id}`,
            feed: targetFeed,
            size: 'horizontal',
            type: 'video',
            title: v.title || '',
            content: v.title?.slice(0, 100) || '',
            source: v.source || '',
            videoUrl: v.videoUrl || '',
            image: v.image || `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
            timestamp: v.timestamp,
            hasValidTimestamp: v.hasValidTimestamp,
            platform: 'youtube',
            channelId: v.channelId || '',
            channelTitle: v.channelTitle || v.source || '',
          }));
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

        return { ...item, isShort: !!isShort };
      });
    }
  }
  
  // Mock fallback content (used when scrapers fail - marked as no timestamp)
  const mockContent = [
    // TWITTER TWEETS
    {
      id: 'mock_tw_1',
      feed: 'local',
      size: 'small',
      type: 'tweet',
      content: 'Caravelle was firing this morning! Clean 3ft sets, light offshore 🌊',
      source: '@GwadaSurfReport',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'twitter',
    },
    {
      id: 'mock_tw_2',
      feed: 'feelgood',
      size: 'small',
      type: 'tweet',
      content: 'Nothing beats that first wave feeling. Saltwater therapy is real.',
      source: '@SurferDaily',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'twitter',
    },
    {
      id: 'mock_tw_3',
      feed: 'global',
      size: 'small',
      type: 'tweet',
      content: 'WSL announces carbon-neutral tour for 2027. Big step for ocean conservation 🌍',
      source: '@WSLUpdates',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'twitter',
    },
    {
      id: 'mock_tw_4',
      feed: 'local',
      size: 'small',
      type: 'tweet',
      content: 'Pointe des Châteaux sunrise session. 5 surfers, empty waves, spiritual morning.',
      source: '@GwadaLocals',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'twitter',
    },
    
    // INSTAGRAM REELS (fallback)
    {
      id: 'mock_ig_1',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'reel',
      title: 'First Wave Forever',
      content: 'That magical first wave moment. Pure joy. 🎬 Instagram',
      source: '@surfstories',
      image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'instagram',
    },
    {
      id: 'mock_ig_2',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Anse Bertrand Raw',
      content: 'North coast powerhouse. Fast, hollow waves. 🎬 Instagram',
      location: 'Anse-Bertrand',
      source: '@gwadasurf',
      image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=800&auto=format',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'instagram',
    },
    
    // TIKTOK REELS (fallback)
    {
      id: 'mock_tt_1',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'reel',
      title: 'Zen Surfer Tips',
      content: 'Paddle out. Catch waves. Reset mind. 🎬 TikTok',
      source: '@zensurfer',
      image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'tiktok',
    },
    {
      id: 'mock_tt_2',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Gwada Dawn Patrol',
      content: '5AM sessions. Empty waves. Pure bliss. 🎬 TikTok',
      location: 'Le Moule',
      source: '@gwadasurfer',
      image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=800&auto=format',
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'tiktok',
    },
  ];
  
  // Merge: real scraped + mock fallback
  const allContent = [...youtubeItems, ...mockContent];
  console.log(`📊 Merge: yt=${youtubeItems.length}, mock=${mockContent.length}, total=${allContent.length}`);
  
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
  
  return NextResponse.json({
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
  });
}