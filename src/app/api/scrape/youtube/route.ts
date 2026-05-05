import { NextResponse } from 'next/server';
import { scrapeYouTubeAPI } from '@/lib/scraper-cdp';

// YouTube scraper — uses YouTube Data API v3 (FREE, real timestamps)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'Surfing today';
  const maxResults = parseInt(searchParams.get('max') || '10');
  
  // Try YouTube Data API first
  const videos = await scrapeYouTubeAPI(query, maxResults);
  
  if (videos.length > 0) {
    return NextResponse.json({
      success: true,
      source: 'youtube',
      query,
      method: 'youtube-data-api-v3',
      real: true,
      items: videos.map((v: any) => ({
        id: `yt_${v.id}`,
        feed: v.title?.toLowerCase().includes('guadeloupe') || v.source?.toLowerCase().includes('gwada') ? 'local' :
              v.title?.toLowerCase().includes('wsl') || v.title?.toLowerCase().includes('championship') ? 'global' : 'feelgood',
        size: 'horizontal',
        type: 'video',
        title: v.title,
        content: v.title?.slice(0, 100),
        source: v.source,
        videoUrl: v.videoUrl,
        image: v.image,
        timestamp: v.timestamp,
        hasValidTimestamp: v.hasValidTimestamp,
        publishedAt: v.publishedAt,
        platform: 'youtube',
      })),
      scrapedAt: new Date().toISOString(),
      note: 'YouTube Data API v3 — requires YOUTUBE_API_KEY env var',
    });
  }
  
  // No API key or API failed
  return NextResponse.json({
    success: false,
    source: 'youtube',
    query,
    method: 'none',
    real: false,
    items: [],
    error: 'YouTube Data API failed or YOUTUBE_API_KEY not set',
    help: 'Get free API key: https://console.cloud.google.com/apis/api/youtube.googleapis.com',
    scrapedAt: new Date().toISOString(),
  });
}