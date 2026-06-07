import { NextResponse } from 'next/server';
import { scrapeTwitter } from '@/lib/scrapers';
import { classifyFeed } from '@/lib/feed-classifier';
import { getMockItems } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf waves Guadeloupe Caribbean';
  const useCDP = searchParams.get('cdp') !== 'false';
  const forceMock = searchParams.get('mock') === 'true';

  if (useCDP && !forceMock) {
    const result = await scrapeTwitter(query);

    if (result.success && result.items.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'twitter',
        query,
        method: result.method,
        real: true,
        items: result.items.map((t, i) => ({
          id: `tw_cdp_${i}`,
          feed: classifyFeed(t.content, t.source),
          size: 'small',
          type: 'tweet',
          content: t.content,
          source: t.source,
          link: t.link,
          timestamp: t.timestamp,
          hasValidTimestamp: t.hasValidTimestamp,
          platform: 'twitter',
        })),
        scrapedAt: result.scrapedAt,
      });
    }
  }

  // Mock fallback
  const mockItems = getMockItems('twitter');
  return NextResponse.json({
    success: true,
    source: 'twitter',
    query,
    method: forceMock ? 'mock' : 'cdp-fallback',
    real: false,
    items: mockItems,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'Twitter CDP unavailable — using mock fallback',
  });
}
