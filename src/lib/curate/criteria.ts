// Content approval criteria for each feed type

export const feedCriteria = {
  feelgood: {
    keywords: ['surf', 'ocean', 'waves', 'peaceful', 'calm', 'nature', 'magic', 'soul', 'beauty', 'sunrise', 'sunset', 'glassy', 'serene'],
    excludeKeywords: ['competition', 'fight', 'aggressive', 'negative', 'contest', 'battle'],
    sentimentScore: 0.7, // Minimum positivity threshold
    sources: ['instagram', 'youtube', 'tiktok'],
    minDuration: 30, // seconds for videos
    requireLocation: false,
    requireCredit: true, // Must credit original creator
    maxSize: 'horizontal', // Prefer horizontal cards for videos
  },
  
  local: {
    keywords: ['guadeloupe', 'gwada', 'caravelle', 'le moule', 'sainte-anne', 'anse', 'port-louis', 'pointe', 'surf', 'waves', 'beach'],
    excludeKeywords: ['competition', 'contest'], // Can include events though
    sentimentScore: 0.5,
    sources: ['instagram', 'youtube', 'tiktok', 'twitter'],
    minDuration: 15,
    requireLocation: true, // Must have Guadeloupe location
    requireCredit: true,
    maxSize: 'horizontal',
  },
  
  global: {
    keywords: ['surf', 'wsl', 'world', 'championship', 'travel', 'indonesia', 'hawaii', 'australia', 'portugal', 'france', 'tahiti', 'teahupoo'],
    excludeKeywords: [],
    sentimentScore: 0.3, // Allow more variety
    sources: ['instagram', 'youtube', 'tiktok', 'twitter'],
    minDuration: 30,
    requireLocation: false,
    requireCredit: true,
    maxSize: 'horizontal',
  },
};

export type FeedType = 'feelgood' | 'local' | 'global';
export type CriteriaConfig = typeof feedCriteria[FeedType];

// Check if content matches feed criteria
export function matchesCriteria(item: PendingItem, feed: FeedType): boolean {
  const criteria = feedCriteria[feed];
  const contentLower = (item.title + ' ' + item.content).toLowerCase();
  
  // Check keywords (at least one must match)
  const hasKeyword = criteria.keywords.some(kw => contentLower.includes(kw.toLowerCase()));
  if (!hasKeyword) return false;
  
  // Check exclude keywords
  const hasExcluded = criteria.excludeKeywords.some(kw => contentLower.includes(kw.toLowerCase()));
  if (hasExcluded) return false;
  
  // Check source
  if (item.source && !criteria.sources.includes(item.source.toLowerCase())) {
    return false;
  }
  
  // Check credit requirement
  if (criteria.requireCredit && !item.creator) {
    return false;
  }
  
  return true;
}

// Auto-score content for a feed
export function scoreContent(item: PendingItem, feed: FeedType): number {
  const criteria = feedCriteria[feed];
  const contentLower = (item.title + ' ' + item.content).toLowerCase();
  
  let score = 0;
  
  // Count matching keywords
  criteria.keywords.forEach(kw => {
    if (contentLower.includes(kw.toLowerCase())) score += 0.1;
  });
  
  // Bonus for location match
  if (item.location && criteria.requireLocation) {
    score += 0.2;
  }
  
  // Bonus for credit
  if (item.creator && criteria.requireCredit) {
    score += 0.15;
  }
  
  // Bonus for video content (engaging)
  if (item.videoUrl) {
    score += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(score, 1.0);
}

// Pending item structure
export interface PendingItem {
  id: string;
  source: string; // 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  url: string;
  title: string;
  content: string;
  creator?: string; // @handle or name
  location?: string;
  feed: FeedType;
  type: 'photo' | 'video' | 'reel' | 'quote' | 'spot' | 'event' | 'news' | 'tweet';
  image?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'instagram' | 'tiktok';
  autoScore: number; // 0-1, calculated by scoreContent()
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO timestamp (when submitted to queue)
  originalPublishedAt?: string; // ISO timestamp (when posted on original platform)
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}