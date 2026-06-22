// Hero image sources configuration
// Auto-fetch surfing/ocean photography from Unsplash & Pexels

export interface HeroSource {
  id: string;
  name: string;
  type: 'unsplash' | 'pexels';
  searchQuery: string;
  active: boolean;
  apiKeyEnv?: string; // Environment variable name for API key
  maxResults: number;
}

export const heroSources: HeroSource[] = [
  {
    id: 'unsplash-surfing',
    name: 'Unsplash Surfing & Ocean Style',
    type: 'unsplash',
    searchQuery: 'Surfing & Ocean Style',
    active: true,
    apiKeyEnv: 'UNSPLASH_ACCESS_KEY',
    maxResults: 30,
  },
  {
    id: 'pexels-surfing',
    name: 'Pexels Surfing & Ocean Style',
    type: 'pexels',
    searchQuery: 'Surfing & Ocean Style',
    active: true,
    apiKeyEnv: 'PEXELS_API_KEY',
    maxResults: 30,
  },
];

// Hero image structure
export interface HeroImage {
  id: string;
  source: 'unsplash' | 'pexels';
  sourceId: string; // Original photo ID from provider
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  photographerName: string;
  photographerUsername?: string;
  photographerProfileUrl?: string;
  photoUrl?: string; // Link to original photo page
  altDescription?: string;
  addedAt: string; // ISO timestamp
  status: 'approved' | 'removed';
  removedAt?: string;
  removedReason?: string;
}