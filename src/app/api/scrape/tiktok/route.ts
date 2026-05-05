import { NextResponse } from 'next/server';
import { scrapeTikTokCDP, disconnectBrowser } from '@/lib/scraper-cdp';

// TikTok scraper — uses Playwright CDP (authenticated browser session)
// Falls back to mock data if CDP unavailable
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf waves';
  const useCDP = searchParams.get('cdp') !== 'false'; // Default: use CDP
  const forceMock = searchParams.get('mock') === 'true';
  
  // Try Playwright CDP scraping (VPS browser on port 9224)
  if (useCDP && !forceMock) {
    try {
      const videos = await scrapeTikTokCDP(query);
      
      if (videos.length > 0) {
        // Disconnect after successful scrape
        await disconnectBrowser();
        
        return NextResponse.json({
          success: true,
          source: 'tiktok',
          query,
          method: 'cdp-playwright',
          real: true,
          items: videos.map((v: any) => ({
            id: `tt_${v.id}`,
            feed: v.title?.toLowerCase().includes('guadeloupe') || v.source?.includes('gwada') ? 'local' :
                  v.title?.toLowerCase().includes('wsl') || v.title?.toLowerCase().includes('pro') ? 'global' : 'feelgood',
            size: 'horizontal',
            type: 'reel',
            title: v.title,
            content: v.title,
            source: `@${v.source}`,
            videoUrl: v.videoUrl,
            image: v.image,
            timestamp: v.timestamp,
            hasValidTimestamp: v.hasValidTimestamp || false,
            platform: 'tiktok',
          })),
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.log('TikTok CDP (Playwright) failed:', error.message);
      await disconnectBrowser();
    }
  }
  
  // Mock fallback (themed for surf content)
  const mockReels = [
    {
      id: 'tt_mock_1',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'reel',
      title: 'First Wave Tips for Beginners',
      content: '3 tips to catch your first wave. Paddle hard, pop up quick! 🏄‍♂️',
      source: '@surfschool',
      image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'tt_mock_2',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Guadeloupe Hidden Spots',
      content: 'Secret breaks only locals know. Caravelle at dawn. 🌅',
      source: '@gwadasurfer',
      location: 'Guadeloupe',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'tt_mock_3',
      feed: 'global',
      size: 'horizontal',
      type: 'reel',
      title: 'Teahupo\'o POV — The Heavy Barrel',
      content: 'Inside the barrel at Tahiti. Pure power. 🌊',
      source: '@wsl',
      image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'tt_mock_4',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'reel',
      title: 'Surf Yoga Flow — Pre-S Session',
      content: '5-min stretches for better pop-ups. Morning ritual. 🧘',
      source: '@surfyoga',
      image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'tt_mock_5',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Le Moule Dawn Patrol',
      content: 'East coast gem at sunrise. Empty lineup, glassy waves. 🌄',
      source: '@lemoulesurf',
      location: 'Le Moule, Guadeloupe',
      image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    source: 'tiktok',
    query,
    method: forceMock ? 'mock' : 'cdp-fallback',
    real: false,
    items: mockReels,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'TikTok CDP unavailable — using mock fallback',
  });
}