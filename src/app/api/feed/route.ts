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

// Unified feed endpoint — aggregates all scraped content with 24hr filter
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feed = searchParams.get('feed') || 'all'; // feelgood, local, global, all
  const useMock = searchParams.get('mock') === 'true';
  const filter24h = searchParams.get('filter24h') !== 'false'; // Default: true
  
  // Try real scraping from all platforms
  let youtubeItems: any[] = [];
  let tiktokItems: any[] = [];
  let instagramItems: any[] = [];
  let twitterItems: any[] = [];
  
  if (!useMock) {
    // YouTube - use YouTube Data API v3 (FREE, real timestamps)
    // Feed-specific queries for targeted content
    const youtubeQueries: Record<string, { query: string, feed: string }> = {
      feelgood: { query: 'Soul surfing', feed: 'feelgood' },
      global: { query: 'Surfing', feed: 'global' },
      globalFresh: { query: 'Surfing today', feed: 'global' },
      local: { query: 'Surfing guadeloupe', feed: 'local' },
    };
    
    // Determine which queries to run based on feed param
    const queriesToRun = feed === 'all' 
      ? Object.values(youtubeQueries) 
      : [youtubeQueries[feed] || youtubeQueries['feelgood']];
    
    console.log(`🎥 YouTube queries: ${queriesToRun.map(q => q.query).join(', ')}`);
    
    // Run YouTube queries (parallel or sequential to conserve quota)
    for (const { query, feed: targetFeed } of queriesToRun) {
      try {
        const result = await scrapeYouTube(query, 10);
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
          }));
          youtubeItems.push(...mappedVideos);
        } else {
          console.log(`🎥 "${query}" → no results`);
        }
      } catch (e) {
        console.log(`YouTube query "${query}" failed:`, e);
      }
    }
    
    // TikTok - try real
    try {
      const ttRes = await fetch(`http://localhost:3002/api/scrape/tiktok`);
      const ttData = await ttRes.json();
      if (ttData.success && ttData.items) {
        tiktokItems = ttData.real ? ttData.items : []; // Only use if real
      }
    } catch (e) {
      console.log('TikTok scraper failed');
    }
    
    // Instagram - try real
    try {
      const igRes = await fetch(`http://localhost:3002/api/scrape/instagram`);
      const igData = await igRes.json();
      if (igData.success && igData.items) {
        instagramItems = igData.real ? igData.items : []; // Only use if real
      }
    } catch (e) {
      console.log('Instagram scraper failed');
    }
    
    // Twitter - try real
    try {
      const twRes = await fetch(`http://localhost:3002/api/scrape/twitter`);
      const twData = await twRes.json();
      if (twData.success && twData.items) {
        twitterItems = twData.real ? twData.items : []; // Only use if real
      }
    } catch (e) {
      console.log('Twitter scraper failed');
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
    
    // INSTAGRAM REELS (if real scraping failed)
    ...(instagramItems.length === 0 ? [
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
    ] : []),
    
    // TIKTOK REELS (if real scraping failed)
    ...(tiktokItems.length === 0 ? [
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
    ] : []),
  ];
  
  // Merge: real scraped + mock fallback
  const allContent = [...youtubeItems, ...tiktokItems, ...instagramItems, ...twitterItems, ...mockContent];
  console.log(`📊 Merge: yt=${youtubeItems.length}, tt=${tiktokItems.length}, ig=${instagramItems.length}, tw=${twitterItems.length}, mock=${mockContent.length}, total=${allContent.length}`);
  
  // Apply 24hr filter
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
  
  const hasReal = youtubeItems.length > 0 || tiktokItems.length > 0 || instagramItems.length > 0 || twitterItems.length > 0;
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
      tiktok: tiktokItems.length,
      instagram: instagramItems.length,
      twitter: twitterItems.length,
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