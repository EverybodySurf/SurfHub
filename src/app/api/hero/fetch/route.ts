import { NextResponse } from 'next/server';
import { heroSources, HeroImage } from '@/lib/curate/hero-sources';
import fs from 'fs';
import path from 'path';

const HERO_POOL_PATH = path.join(process.cwd(), 'data', 'hero-pool.json');
const SEARCH_TERMS_PATH = path.join(process.cwd(), 'data', 'search-terms.json');

interface HeroPoolData {
  images: HeroImage[];
  removedLog: HeroImage[];
  lastFetch: string | null;
  fetchStats: {
    totalAdded: number;
    totalRemoved: number;
    sources: { unsplash: number; pexels: number };
  };
}

function loadHeroPool(): HeroPoolData {
  try {
    const data = fs.readFileSync(HERO_POOL_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      images: [],
      removedLog: [],
      lastFetch: null,
      fetchStats: { totalAdded: 0, totalRemoved: 0, sources: { unsplash: 0, pexels: 0 } },
    };
  }
}

function saveHeroPool(data: HeroPoolData) {
  fs.writeFileSync(HERO_POOL_PATH, JSON.stringify(data, null, 2));
}

// Load dynamic search terms
function loadSearchTerms(): Record<string, { searchQuery: string; active: boolean }> {
  try {
    if (fs.existsSync(SEARCH_TERMS_PATH)) {
      const data = JSON.parse(fs.readFileSync(SEARCH_TERMS_PATH, 'utf-8'));
      return data.sources;
    }
  } catch {
    // Fallback to defaults from heroSources
  }
  
  // Default fallback
  const defaults: Record<string, { searchQuery: string; active: boolean }> = {};
  for (const source of heroSources) {
    defaults[source.id] = { searchQuery: source.searchQuery, active: source.active };
  }
  return defaults;
}

// Fetch from Unsplash API
async function fetchUnsplash(query: string, maxResults: number): Promise<HeroImage[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  console.log('UNSPLASH_ACCESS_KEY check:', apiKey ? 'SET (length: ' + apiKey.length + ')' : 'NOT SET');
  
  if (!apiKey) {
    console.log('UNSPLASH_ACCESS_KEY not set, skipping');
    return [];
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${maxResults}`,
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      console.error('Unsplash API error:', res.status);
      return [];
    }

    const data = await res.json();
    
    return data.results.map((photo: any) => ({
      id: `unsplash-${photo.id}`,
      source: 'unsplash',
      sourceId: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      width: photo.width,
      height: photo.height,
      orientation: photo.width > photo.height ? 'landscape' : photo.width < photo.height ? 'portrait' : 'square',
      photographerName: photo.user.name,
      photographerUsername: photo.user.username,
      photographerProfileUrl: `https://unsplash.com/@${photo.user.username}`,
      photoUrl: photo.links.html,
      altDescription: photo.alt_description || photo.description || 'Surfing photography',
      addedAt: new Date().toISOString(),
      status: 'approved',
    }));
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return [];
  }
}

// Fetch from Pexels API
async function fetchPexels(query: string, maxResults: number): Promise<HeroImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.log('PEXELS_API_KEY not set, skipping');
    return [];
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${maxResults}`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!res.ok) {
      console.error('Pexels API error:', res.status);
      return [];
    }

    const data = await res.json();
    
    return data.photos.map((photo: any) => ({
      id: `pexels-${photo.id}`,
      source: 'pexels',
      sourceId: photo.id.toString(),
      url: photo.src.large,
      thumbnailUrl: photo.src.medium,
      width: photo.width,
      height: photo.height,
      orientation: photo.width > photo.height ? 'landscape' : photo.width < photo.height ? 'portrait' : 'square',
      photographerName: photo.photographer,
      photographerProfileUrl: photo.photographer_url,
      photoUrl: photo.url,
      altDescription: photo.alt || 'Surfing photography',
      addedAt: new Date().toISOString(),
      status: 'approved',
    }));
  } catch (error) {
    console.error('Pexels fetch error:', error);
    return [];
  }
}

export async function POST() {
  const pool = loadHeroPool();
  const searchTerms = loadSearchTerms();
  const newImages: HeroImage[] = [];

  for (const source of heroSources) {
    const termConfig = searchTerms[source.id] || { searchQuery: source.searchQuery, active: source.active };
    if (!termConfig.active) continue;

    let images: HeroImage[] = [];
    if (source.type === 'unsplash') {
      images = await fetchUnsplash(termConfig.searchQuery, source.maxResults);
    } else if (source.type === 'pexels') {
      images = await fetchPexels(termConfig.searchQuery, source.maxResults);
    }

    // Filter out duplicates (already in pool)
    const existingIds = new Set(pool.images.map((img) => img.id));
    const uniqueImages = images.filter((img) => !existingIds.has(img.id));

    newImages.push(...uniqueImages);
    pool.fetchStats.sources[source.type] += uniqueImages.length;
  }

  // Add new images to pool
  pool.images.push(...newImages);
  pool.fetchStats.totalAdded += newImages.length;
  pool.lastFetch = new Date().toISOString();

  saveHeroPool(pool);

  return NextResponse.json({
    success: true,
    added: newImages.length,
    total: pool.images.length,
    message: `Added ${newImages.length} new hero images from ${heroSources.filter(s => searchTerms[s.id]?.active).map(s => `${s.type}: "${searchTerms[s.id]?.searchQuery || s.searchQuery}"`).join(', ')}`,
  });
}

export async function GET() {
  const pool = loadHeroPool();
  return NextResponse.json({
    success: true,
    images: pool.images.filter(img => img.status === 'approved'),
    total: pool.images.length,
    lastFetch: pool.lastFetch,
    stats: pool.fetchStats,
  });
}