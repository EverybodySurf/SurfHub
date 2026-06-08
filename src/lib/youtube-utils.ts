/**
 * Shared YouTube utilities for feed components.
 * Extracted to avoid duplication across GoodVibesFeed, GuadeloupeFeed, GlobalSurfFeed.
 */

import type { FeedItem } from '@/hooks/use-feed';

/**
 * Extract YouTube video ID from various URL formats.
 *
 * @example
 *   extractYoutubeId('https://youtu.be/okE2130c4Xw')          → 'okE2130c4Xw'
 *   extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9') → 'dQw4w9'
 *   extractYoutubeId('https://www.youtube.com/embed/abc123')   → 'abc123'
 */
export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/
  );
  return match ? match[1] : null;
}

/**
 * Extract video ID from any platform URL (YouTube, Instagram, TikTok).
 * Used in GuadeloupeFeed for multi-platform embeds.
 */
export function extractVideoId(url: string, videoType: string): string | null {
  if (videoType === 'youtube') {
    return extractYoutubeId(url);
  }
  if (videoType === 'instagram') {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
  if (videoType === 'tiktok') {
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Check if a feed item is a YouTube video with a playable URL.
 */
export function isYoutubeItem(item: FeedItem): boolean {
  return item.platform === 'youtube' && !!item.videoUrl;
}

/**
 * Map a FeedItem to YouTubePlayer props.
 * Returns null if the item isn't a valid YouTube video.
 */
export function toYoutubePlayerProps(item: FeedItem): {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  isShort?: boolean;
} | null {
  if (!isYoutubeItem(item) || !item.videoUrl) return null;

  const videoId = extractYoutubeId(item.videoUrl);
  if (!videoId) return null;

  return {
    videoId,
    title: item.title || item.content || '',
    channelTitle: (item as any).channelTitle || item.source || 'YouTube',
    channelId: (item as any).channelId || '',
    thumbnail: item.image || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    isShort: item.isShort,
  };
}
