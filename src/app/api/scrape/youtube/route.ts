import { NextResponse } from 'next/server';
import { scrapeYouTube } from '@/lib/scrapers';
import { classifyFeed } from '@/lib/feed-classifier';
import { getMockItems } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'surf waves 2024';
  const forceMock = searchParams.get('mock') === 'true';

  if (!forceMock) {
    const result = await scrapeYouTube(query);

    if (result.success && result.items.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'youtube',
        query,
        method: result.method,
        real: true,
        items: result.items.map(v => ({
          id: `yt_${v.id}`,
          feed: classifyFeed(v.content, v.source, v.title),
          size: 'horizontal',
          type: 'video',
          title: v.title,
          content: v.content,
          source: v.source,
          videoUrl: v.videoUrl,
          image: v.image,
          timestamp: v.timestamp,
          hasValidTimestamp: v.hasValidTimestamp,
          platform: 'youtube',
        })),
        scrapedAt: result.scrapedAt,
      });
    }
  }

  // Mock fallback
  const mockItems = getMockItems('youtube');
  return NextResponse.json({
    success: true,
    source: 'youtube',
    query,
    method: forceMock ? 'mock' : 'api-fallback',
    real: false,
    items: mockItems,
    scrapedAt: new Date().toISOString(),
    note: forceMock ? 'Mock data requested' : 'YouTube API unavailable — using mock fallback',
  });
}
