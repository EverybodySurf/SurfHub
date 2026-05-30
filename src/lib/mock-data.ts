/**
 * Mock Data Service — centralized mock data for all platforms
 *
 * Replaces inline mock data scattered across 4 route handlers.
 * Keeps mock data consistent and easy to update.
 */

import { classifyFeed } from './feed-classifier';
import type { InstagramPost, TwitterPost, TikTokVideo, YouTubeVideo } from './scrapers/types';

const scrapedAt = () => new Date().toISOString();

export function getMockInstagram(): Omit<InstagramPost, 'timestamp' | 'hasValidTimestamp'>[] {
  return [
    {
      id: 'ig_mock_1',
      platform: 'instagram',
      type: 'reel',
      title: 'Golden Hour Session',
      content: 'Last light at the beach. Perfect end to the day. 🌅',
      caption: 'Last light at the beach. Perfect end to the day. 🌅',
      source: '@surferlife',
      image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format',
      postUrl: 'https://instagram.com/p/mock1',
    },
    {
      id: 'ig_mock_2',
      platform: 'instagram',
      type: 'reel',
      title: 'Pointe des Châteaux — Raw Power',
      content: 'Wild eastern tip of Guadeloupe. Atlantic energy. 🌊',
      caption: 'Wild eastern tip of Guadeloupe. Atlantic energy. 🌊',
      source: '@gwadaphoto',
      image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=800&auto=format',
      postUrl: 'https://instagram.com/p/mock2',
    },
    {
      id: 'ig_mock_3',
      platform: 'instagram',
      type: 'reel',
      title: 'Bali Dreaming — Uluwatu',
      content: "Perfect lines at Bali's iconic break. Dream trip. ✨",
      caption: "Perfect lines at Bali's iconic break. Dream trip. ✨",
      source: '@surftravel',
      image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=800&auto=format',
      postUrl: 'https://instagram.com/p/mock3',
    },
    {
      id: 'ig_mock_4',
      platform: 'instagram',
      type: 'photo',
      title: 'The Quiver — Board Stories',
      content: 'Each board has a soul. Stories in fiberglass. 🏄‍♂️',
      caption: 'Each board has a soul. Stories in fiberglass. 🏄‍♂️',
      source: '@boardcollector',
      image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=800&auto=format',
      postUrl: 'https://instagram.com/p/mock4',
    },
    {
      id: 'ig_mock_5',
      platform: 'instagram',
      type: 'reel',
      title: 'Anse Bertrand — North Coast',
      content: 'When the north swell hits. Heavy walls, few souls. 🌄',
      caption: 'When the north swell hits. Heavy walls, few souls. 🌄',
      source: '@gwadasurfclub',
      image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=800&auto=format',
      postUrl: 'https://instagram.com/p/mock5',
    },
  ];
}

export function getMockTikTok(): Omit<TikTokVideo, 'timestamp' | 'hasValidTimestamp'>[] {
  return [
    { id: 'tt_mock_1', platform: 'tiktok', title: 'Morning glass at Le Moule', content: 'Morning glass at Le Moule', source: '@gwadasurf', image: '', videoUrl: '' },
    { id: 'tt_mock_2', platform: 'tiktok', title: 'WSL highlights — Finals day', content: 'WSL highlights — Finals day', source: '@wsl', image: '', videoUrl: '' },
    { id: 'tt_mock_3', platform: 'tiktok', title: 'Shaping a new board', content: 'Shaping a new board', source: '@shaperlife', image: '', videoUrl: '' },
  ];
}

export function getMockTwitter(): Omit<TwitterPost, 'timestamp' | 'hasValidTimestamp'>[] {
  return [
    {
      id: 'tw_mock_1',
      platform: 'twitter',
      content: 'Surf forecast looking solid for Guadeloupe this weekend! 🏄‍♂️ #surf #gwada',
      source: '@gwadasurfreport',
      link: 'https://twitter.com/gwadasurfreport/status/mock1',
    },
    {
      id: 'tw_mock_2',
      platform: 'twitter',
      content: 'New swell incoming! Check your local breaks.',
      source: '@surfnews',
      link: 'https://twitter.com/surfnews/status/mock2',
    },
  ];
}

export function getMockYouTube(): Omit<YouTubeVideo, 'timestamp' | 'hasValidTimestamp'>[] {
  return [
    {
      id: 'yt_mock_1',
      platform: 'youtube',
      title: 'Best Surf Spots in Guadeloupe',
      content: 'Exploring the best waves in Guadeloupe...',
      source: 'Surf Travel TV',
      image: 'https://i.ytimg.com/vi/mock1/maxresdefault.jpg',
      videoUrl: 'https://youtube.com/watch?v=mock1',
    },
    {
      id: 'yt_mock_2',
      platform: 'youtube',
      title: 'WSL Championship Tour 2026 Highlights',
      content: 'Best moments from the 2026 CT...',
      source: 'World Surf League',
      image: 'https://i.ytimg.com/vi/mock2/maxresdefault.jpg',
      videoUrl: 'https://youtube.com/watch?v=mock2',
    },
  ];
}

/**
 * Get mock posts for any platform.
 * Maps platform items through classifyFeed for consistent feed labeling.
 */
export function getMockItems(platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube') {
  const now = scrapedAt();

  switch (platform) {
    case 'instagram':
      return getMockInstagram().map(p => ({
        ...p,
        timestamp: now,
        hasValidTimestamp: false,
        feed: classifyFeed(p.content, p.source, p.title),
      }));

    case 'tiktok':
      return getMockTikTok().map(v => ({
        ...v,
        timestamp: now,
        hasValidTimestamp: false,
        feed: classifyFeed(v.content, v.source, v.title),
      }));

    case 'twitter':
      return getMockTwitter().map(t => ({
        ...t,
        timestamp: now,
        hasValidTimestamp: false,
        feed: classifyFeed(t.content, t.source),
      }));

    case 'youtube':
      return getMockYouTube().map(v => ({
        ...v,
        timestamp: now,
        hasValidTimestamp: false,
        feed: classifyFeed(v.content, v.source, v.title),
      }));
  }
}
