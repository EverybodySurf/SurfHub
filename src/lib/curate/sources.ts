// Content source configurations for auto-fetch

export interface SourceConfig {
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter';
  handle: string; // @username or channel ID
  feed: 'feelgood' | 'local' | 'global';
  priority: number; // 1-5, higher = more important
  active: boolean;
  lastFetch?: string; // ISO timestamp
  fetchInterval: number; // minutes
}

// Known Guadeloupe surf content creators
export const SOURCES: SourceConfig[] = [
  // Instagram creators
  {
    platform: 'instagram',
    handle: '@gwadashots',
    feed: 'local',
    priority: 5,
    active: true,
    fetchInterval: 60, // Check every hour
  },
  {
    platform: 'instagram',
    handle: '@romain_alexis_surf',
    feed: 'local',
    priority: 4,
    active: true,
    fetchInterval: 120,
  },
  {
    platform: 'instagram',
    handle: '@gwadasurfreport',
    feed: 'local',
    priority: 3,
    active: true,
    fetchInterval: 60,
  },
  
  // YouTube channels
  {
    platform: 'youtube',
    handle: 'RomainAlexis',
    feed: 'local',
    priority: 4,
    active: true,
    fetchInterval: 240, // 4 hours
  },
  
  // Twitter/X accounts
  {
    platform: 'twitter',
    handle: '@gwadasurfreport',
    feed: 'local',
    priority: 3,
    active: true,
    fetchInterval: 60,
  },
  
  // Feel-good global surf accounts (future)
  {
    platform: 'instagram',
    handle: '@surf',
    feed: 'global',
    priority: 2,
    active: false, // Disabled until API access
    fetchInterval: 120,
  },
];

// Get active sources for a specific feed
export function getSourcesForFeed(feed: 'feelgood' | 'local' | 'global'): SourceConfig[] {
  return SOURCES.filter(s => s.active && s.feed === feed);
}

// Get all active sources
export function getActiveSources(): SourceConfig[] {
  return SOURCES.filter(s => s.active);
}

// Check if source needs fetching
export function needsFetch(source: SourceConfig): boolean {
  if (!source.lastFetch) return true;
  
  const lastFetch = new Date(source.lastFetch);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastFetch.getTime()) / (1000 * 60);
  
  return diffMinutes >= source.fetchInterval;
}