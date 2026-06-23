import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Extract Instagram shortcode from URL
 */
function extractInstagramCode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Extract tweet ID from X/Twitter URL
 */
function extractTweetId(url: string): string | null {
  const match = url.match(/x\.com\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): 'youtube' | 'instagram' | 'twitter' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('x.com') || url.includes('twitter.com')) return 'twitter';
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const platform = detectPlatform(url);
  
  switch (platform) {
    case 'youtube': {
      const videoId = extractYoutubeId(url);
      if (!videoId) {
        return NextResponse.json({
          platform: 'youtube',
          title: '',
          image: `https://i.ytimg.com/vi/${videoId || 'unknown'}/mqdefault.jpg`,
          creator: '',
        });
      }

      let title = '';
      let creator = '';

      // Try Data API for metadata
      if (YOUTUBE_API_KEY) {
        try {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
          );
          const data = await res.json();
          if (data.items?.[0]) {
            title = data.items[0].snippet.title || '';
            creator = data.items[0].snippet.channelTitle || '';
          }
        } catch {
          // API failed, use URL-based fallback
        }
      }

      return NextResponse.json({
        platform: 'youtube',
        title,
        image: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        creator,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    case 'instagram': {
      // Instagram oEmbed — no auth needed for public posts
      try {
        const res = await fetch(
          `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`,
        );
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            platform: 'instagram',
            title: data.title || '',
            image: data.thumbnail_url || '',
            creator: data.author_name || '',
          });
        }
      } catch {
        // oEmbed failed
      }

      // Fallback: return the URL as-is, user can fill manually
      return NextResponse.json({
        platform: 'instagram',
        title: '',
        image: '',
        creator: '',
      });
    }

    case 'twitter': {
      // X/Twitter oEmbed
      try {
        const res = await fetch(
          `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
        );
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            platform: 'twitter',
            title: data.title || '',
            image: data.thumbnail_url || '',
            creator: data.author_name || '',
          });
        }
      } catch {
        // oEmbed failed
      }

      return NextResponse.json({
        platform: 'twitter',
        title: '',
        image: '',
        creator: '',
      });
    }

    default:
      return NextResponse.json({
        platform: null,
        title: '',
        image: '',
        creator: '',
      });
  }
}
