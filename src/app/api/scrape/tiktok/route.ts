import { NextResponse } from 'next/server';
import { scrapeTikTok, browserService } from '@/lib/scrapers';
import { classifyFeed } from '@/lib/feed-classifier';
import { getMockItems } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf waves';
  const useCDP = searchParams.get('cdp') !== 'false';
  const forceMock = searchParams.get('mock') === 'true';

  if (useCDP && !forceMock) {
    const result = await scrapeTikTok(query);

    if (result.success && result.items.length > 0) {
      await browserService.disconnect();

      return NextResponse.json({
        success: true,
        source: 'tiktok',
        query,
        method: result.method,
        real: true,
        items: result.items.map(v => ({
          id: v.id,
          feed: classifyFeed(v.content, v.source, v.title),
          size: 'horizontal',
          type: 'reel',
          title: v.title,
          content: v.content,
          source: v.source,
          videoUrl: v.videoUrl,
          image: v.image,
          timestamp: v.timestamp,
          hasValidTimestamp: v.hasValidTimestamp,
          platform: 'tiktok',
        })),
        scrapedAt: result.scrapedAt,
      });
    }

    await browserService.disconnect();
  }

  // Mock fallback
  const mockItems = getMockItems('tiktok');
  return NextResponse.json({
    success: true,
    source: 'tiktok',
    query,
    method: forceMock ? 'mock' : 'cdp-fallback',
    real: false,
    items: mockItems,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'TikTok CDP unavailable — using mock fallback',
  });
}
