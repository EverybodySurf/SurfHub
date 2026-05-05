import { NextResponse } from 'next/server';
import { scrapeInstagramCDP, disconnectBrowser } from '@/lib/scraper-cdp';

// Instagram scraper — uses Playwright CDP (authenticated browser session)
// Falls back to mock data if CDP unavailable
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf';
  const useCDP = searchParams.get('cdp') !== 'false'; // Default: use CDP
  const forceMock = searchParams.get('mock') === 'true';
  
  // Try Playwright CDP scraping (VPS browser on port 9224)
  if (useCDP && !forceMock) {
    try {
      const posts = await scrapeInstagramCDP(query);
      
      if (posts.length > 0) {
        // Disconnect after successful scrape
        await disconnectBrowser();
        
        return NextResponse.json({
          success: true,
          source: 'instagram',
          query,
          method: 'cdp-playwright',
          real: true,
          items: posts.map((p: any) => ({
            id: `ig_${p.id}`,
            feed: p.title?.toLowerCase().includes('guadeloupe') || p.title?.toLowerCase().includes('gwada') ? 'local' :
                  p.title?.toLowerCase().includes('wsl') || p.title?.toLowerCase().includes('pro') ? 'global' : 'feelgood',
            size: 'horizontal',
            type: p.isVideo ? 'reel' : 'photo',
            title: p.title,
            content: p.title,
            source: p.source,
            postUrl: p.postUrl,
            image: p.image,
            timestamp: p.timestamp,
            hasValidTimestamp: p.hasValidTimestamp || false,
            platform: 'instagram',
          })),
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.log('Instagram CDP (Playwright) failed:', error.message);
      await disconnectBrowser();
    }
  }
  
  // Mock fallback (themed for surf content)
  const mockPosts = [
    {
      id: 'ig_mock_1',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'reel',
      title: 'Golden Hour Session',
      content: 'Last light at the beach. Perfect end to the day. 🌅',
      source: '@surferlife',
      image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'ig_mock_2',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Pointe des Châteaux — Raw Power',
      content: 'Wild eastern tip of Guadeloupe. Atlantic energy. 🌊',
      source: '@gwadaphoto',
      location: 'Pointe des Châteaux',
      image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'ig_mock_3',
      feed: 'global',
      size: 'horizontal',
      type: 'reel',
      title: 'Bali Dreaming — Uluwatu',
      content: 'Perfect lines at Bali\'s iconic break. Dream trip. ✨',
      source: '@surftravel',
      image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'ig_mock_4',
      feed: 'feelgood',
      size: 'horizontal',
      type: 'photo',
      title: 'The Quiver — Board Stories',
      content: 'Each board has a soul. Stories in fiberglass. 🏄‍♂️',
      source: '@boardcollector',
      image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
    {
      id: 'ig_mock_5',
      feed: 'local',
      size: 'horizontal',
      type: 'reel',
      title: 'Anse Bertrand — North Coast',
      content: 'When the north swell hits. Heavy walls, few souls. 🌄',
      source: '@gwadasurfclub',
      location: 'Anse-Bertrand',
      image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=800&auto=format',
      scrapedAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    source: 'instagram',
    query,
    method: forceMock ? 'mock' : 'cdp-fallback',
    real: false,
    items: mockPosts,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'Instagram CDP unavailable — using mock fallback',
  });
}