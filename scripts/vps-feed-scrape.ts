// ──────────────────────────────────────────────
// vps-feed-scrape.ts — Scrape Instagram & X/Twitter via VPS browser
// ──────────────────────────────────────────────
// Runs standalone via: npx tsx scripts/vps-feed-scrape.ts
// Called by vps-feed-scrape.sh (which manages browser lifecycle)
// ──────────────────────────────────────────────

import { scrapeInstagram, scrapeTwitter } from '../src/lib/scrapers';
import { writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '..', 'data');

interface ScrapedFeedItem {
  id: string;
  content: string;
  source: string;
  timestamp: string;
  platform: 'instagram' | 'twitter';
  feed: string;
  image?: string;
  videoUrl?: string;
  title?: string;
  hasValidTimestamp?: boolean;
}

async function main() {
  const results: { instagram: ScrapedFeedItem[]; twitter: ScrapedFeedItem[]; scrapedAt: string } = {
    instagram: [],
    twitter: [],
    scrapedAt: new Date().toISOString(),
  };

  // Scrape Instagram — surf hashtags
  const igHashtags: Record<string, string> = {
    feelgood: 'surfingwaves',
    local: 'guadeloupesurf',
    global: 'surfing',
  };

  for (const [feed, tag] of Object.entries(igHashtags)) {
    try {
      const result = await scrapeInstagram(tag);
      if (result.success && result.items.length > 0) {
        const mapped = result.items.map((p: any) => ({
          ...p,
          feed,
          platform: 'instagram' as const,
        }));
        results.instagram.push(...mapped);
        console.log(`📸 Instagram #${tag} → ${result.items.length} posts for ${feed}`);
      }
    } catch (e: any) {
      console.log(`📸 Instagram #${tag} failed: ${e.message}`);
    }
  }

  // Scrape X/Twitter
  const xQueries: Record<string, string> = {
    feelgood: 'surf waves soul surfing',
    local: 'Guadeloupe surf',
    global: 'big waves surfing',
  };

  for (const [feed, query] of Object.entries(xQueries)) {
    try {
      const result = await scrapeTwitter(query);
      if (result.success && result.items.length > 0) {
        const mapped = result.items.map((p: any) => ({
          ...p,
          feed,
          platform: 'twitter' as const,
        }));
        results.twitter.push(...mapped);
        console.log(`🐦 X "${query}" → ${result.items.length} tweets for ${feed}`);
      }
    } catch (e: any) {
      console.log(`🐦 X "${query}" failed: ${e.message}`);
    }
  }

  // Write data files
  writeFileSync(join(DATA_DIR, 'ig-feed.json'), JSON.stringify(results.instagram, null, 2));
  writeFileSync(join(DATA_DIR, 'x-feed.json'), JSON.stringify(results.twitter, null, 2));
  writeFileSync(join(DATA_DIR, 'vps-scrape-meta.json'), JSON.stringify({
    lastScrape: results.scrapedAt,
    instagramCount: results.instagram.length,
    twitterCount: results.twitter.length,
  }, null, 2));

  console.log(`\n✅ Done: ${results.instagram.length} Instagram, ${results.twitter.length} Twitter`);
}

main().catch(console.error);
