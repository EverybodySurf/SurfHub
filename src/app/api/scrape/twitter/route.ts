import { NextResponse } from 'next/server';
import { scrapeTwitterCDP } from '@/lib/scraper-cdp';

// Twitter/X scraper — tries CDP (authenticated) first
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf waves Guadeloupe Caribbean';
  const useCDP = searchParams.get('cdp') !== 'false'; // Default: try CDP
  
  // Try authenticated CDP scraping (VPS browser logged into Twitter)
  if (useCDP) {
    try {
      const tweets = await scrapeTwitterCDP(query);
      
      if (tweets.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'twitter',
          query,
          method: 'cdp',
          real: true,
          items: tweets.map((t: any, i: number) => ({
            id: `tw_cdp_${i}`,
            feed: t.content?.toLowerCase().includes('guadeloupe') || t.content?.includes('Gwada') ? 'local' :
                  t.content?.toLowerCase().includes('wsl') || t.content?.includes('WSL') ? 'global' : 'feelgood',
            size: 'small',
            type: 'tweet',
            content: t.content,
            source: t.source,
            link: t.link,
            timestamp: t.timestamp,
            hasValidTimestamp: t.hasValidTimestamp || false,
            platform: 'twitter',
          })),
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.log('Twitter CDP failed:', error);
    }
  }
  
  // No fallback — Twitter blocks headless completely
  return NextResponse.json({
    success: true,
    source: 'twitter',
    query,
    method: 'none',
    real: false,
    items: [],
    note: 'Twitter requires CDP (authenticated browser). Start VPS browser on port 9225 and login.',
    scrapedAt: new Date().toISOString(),
  });
}