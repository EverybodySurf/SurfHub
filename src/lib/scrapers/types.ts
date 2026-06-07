/**
 * Shared types for all scraper services
 */

export interface ScrapedPost {
  id: string;
  content: string;
  source: string;
  timestamp: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube';
  /** Original publishedAt in any format (ISO string, relative, or null) */
  publishedAt?: string | null;
  /** Whether the timestamp came from a real source or was generated as fallback */
  hasValidTimestamp?: boolean;
}

export interface InstagramPost extends ScrapedPost {
  platform: 'instagram';
  type: 'photo' | 'reel';
  caption: string;
  title: string;
  image: string;
  postUrl: string;
}

export interface TwitterPost extends ScrapedPost {
  platform: 'twitter';
  link: string;
  hasValidTimestamp: boolean;
}

export interface TikTokVideo extends ScrapedPost {
  platform: 'tiktok';
  title: string;
  image: string;
  videoUrl: string;
  hasValidTimestamp: boolean;
}

export interface YouTubeVideo extends ScrapedPost {
  platform: 'youtube';
  title: string;
  image: string;
  videoUrl: string;
  hasValidTimestamp: boolean;
}

export type ScrapeResult<T> = {
  success: true;
  items: T[];
  method: string;
  scrapedAt: string;
} | {
  success: false;
  method: string;
  error: string;
  scrapedAt: string;
};
