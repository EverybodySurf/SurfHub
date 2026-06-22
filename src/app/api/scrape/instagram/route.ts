import { NextResponse } from 'next/server';
import { scrapeInstagram, browserService } from '@/lib/scrapers';
import { classifyFeed } from '@/lib/feed-classifier';
import { getMockItems } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf';
  const useCDP = searchParams.get('cdp') !== 'false';
  const forceMock = searchParams.get('mock') === 'true';

  if (useCDP && !forceMock) {
    const result = await scrapeInstagram(query);

    if (result.success && result.items.length > 0) {
      await browserService.disconnect();

      return NextResponse.json({
        success: true,
        source: 'instagram',
        query,
        method: result.method,
        real: true,
        items: result.items.map(p => ({
          id: p.id,
          feed: classifyFeed(p.content, p.source, p.title),
          size: 'horizontal',
          type: p.type,
          title: p.title,
          content: p.content,
          source: p.source,
          postUrl: p.postUrl,
          image: p.image,
          timestamp: p.timestamp,
          hasValidTimestamp: p.hasValidTimestamp,
          platform: 'instagram',
        })),
        scrapedAt: result.scrapedAt,
      });
    }

    await browserService.disconnect();
  }

  // Mock fallback
  const mockItems = getMockItems('instagram');
  return NextResponse.json({
    success: true,
    source: 'instagram',
    query,
    method: forceMock ? 'mock' : 'cdp-fallback',
    real: false,
    items: mockItems,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'Instagram CDP unavailable — using mock fallback',
  });
}
