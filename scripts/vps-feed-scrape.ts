// ──────────────────────────────────────────────
// vps-feed-scrape.ts — Dedicated-tab scraper for Instagram & X
// ──────────────────────────────────────────────
// Connects to the VPS browser CDP, opens 6 dedicated tabs,
// scrapes content from each, saves to JSON.
//
// Usage: npx tsx scripts/vps-feed-scrape.ts
// ──────────────────────────────────────────────

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { chromium } from 'playwright';

const CDP_URL = 'http://127.0.0.1:9224';
const DATA_DIR = join(process.cwd(), 'data');
const TABS_FILE = join(DATA_DIR, 'scraper-tabs.json');

interface TabTarget {
  label: string;
  type: 'instagram' | 'twitter';
  feed: string;
  url: string;
}

const TAB_DEFS: TabTarget[] = [
  { label: 'IG Global',       type: 'instagram', feed: 'global',   url: 'https://www.instagram.com/explore/search/keyword/?q=%23surfing' },
  { label: 'IG Local',        type: 'instagram', feed: 'local',    url: 'https://www.instagram.com/explore/search/keyword/?q=%23surfingguadeloupe' },
  { label: 'IG FeelGood',     type: 'instagram', feed: 'feelgood', url: 'https://www.instagram.com/explore/search/keyword/?q=%23soulsurfing' },
  { label: 'X Global',        type: 'twitter',   feed: 'global',   url: 'https://x.com/search?q=surfing&f=tweets' },
  { label: 'X Local',         type: 'twitter',   feed: 'local',    url: 'https://x.com/search?q=surfing%20Guadeloupe&f=tweets' },
  { label: 'X FeelGood',      type: 'twitter',   feed: 'feelgood', url: 'https://x.com/search?q=soul%20surfing&f=tweets' },
];

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🔌 Connecting to VPS browser via CDP...');
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  if (!context) {
    console.error('❌ No browser context found');
    await browser.close();
    return;
  }

  const scrapedAt = new Date().toISOString();
  const results: { instagram: any[]; twitter: any[] } = { instagram: [], twitter: [] };

  // Load saved tab targets (if they exist from a previous run)
  let savedTabs: Record<string, string> = {};
  if (existsSync(TABS_FILE)) {
    try { savedTabs = JSON.parse(readFileSync(TABS_FILE, 'utf-8')); } catch {}
  }

  const pages = context.pages();
  console.log(`📄 Found ${pages.length} existing pages`);

  for (const def of TAB_DEFS) {
    console.log(`\n🔍 Processing: ${def.label}`);

    // Find existing page by URL, or create new tab
    let page = pages.find(p => p.url().includes(def.url.split('?')[0]));
    if (!page) {
      console.log(`  ➕ Opening new tab for ${def.label}...`);
      page = await context.newPage();
      await page.goto(def.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      console.log(`  ♻️ Reusing existing tab, refreshing...`);
      await page.goto(def.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    await sleep(3000); // Let content load

    if (def.type === 'instagram') {
      try {
        // Wait for posts to appear
        await page.waitForSelector('a[href*="/p/"], a[href*="/reel/"]', { timeout: 15000 });

        const posts = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
          const seen = new Set<string>();
          return links.slice(0, 15).map((link, i) => {
            const href = link.getAttribute('href') || '';
            const shortcode = href.match(/\/(p|reel)\/([^/]+)/)?.[2] || `ig_${Date.now()}_${i}`;
            if (seen.has(shortcode)) return null;
            seen.add(shortcode);
            const img = link.querySelector('img');
            const caption = img?.getAttribute('alt')?.slice(0, 120) || '';
            return {
              id: shortcode,
              caption,
              image: img?.getAttribute('src') || '',
              postUrl: `https://www.instagram.com${href}`,
              publishedAt: '',
            };
          }).filter(Boolean);
        });

        console.log(`  📸 ${posts.length} posts found`);
        if (posts.length > 0) {
          results.instagram.push(...posts.map((p: any) => ({
            id: `ig_${p.id}`,
            title: p.caption?.slice(0, 80) || 'Instagram post',
            content: p.caption || '',
            source: '@instagram',
            image: p.image || '',
            postUrl: p.postUrl || '',
            timestamp: scrapedAt,
            hasValidTimestamp: false,
            platform: 'instagram',
            feed: def.feed,
            size: 'tall',
            type: p.id?.startsWith('reel_') ? 'video' : 'photo',
          })));
        }
      } catch (e: any) {
        console.log(`  ⚠️ Instagram scrape failed: ${e.message}`);
        // Take screenshot for debugging
        try {
          const screenshot = await page.screenshot({ type: 'png' });
          console.log(`  📸 Screenshot taken (${screenshot.length} bytes)`);
        } catch {}
      }
    }

    if (def.type === 'twitter') {
      try {
        await page.waitForSelector('article[data-testid="tweet"], div[data-testid="cellInnerDiv"]', { timeout: 15000 });

        const tweets = await page.evaluate(() => {
          const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
          return articles.slice(0, 10).map((a, i) => {
            const textEl = a.querySelector('div[data-testid="tweetText"]');
            const timeEl = a.querySelector('time');
            const datetime = timeEl?.getAttribute('datetime') || '';
            return {
              id: `x_${datetime || Date.now()}_${i}`,
              text: textEl?.textContent?.trim() || '',
              publishedAt: datetime,
            };
          });
        });

        console.log(`  🐦 ${tweets.length} tweets found`);
        if (tweets.length > 0) {
          results.twitter.push(...tweets.map((t: any) => ({
            id: t.id,
            title: t.text?.slice(0, 80) || 'X post',
            content: t.text || '',
            source: '@x',
            image: '',
            timestamp: t.publishedAt || scrapedAt,
            hasValidTimestamp: !!t.publishedAt,
            platform: 'twitter',
            feed: def.feed,
          })));
        }
      } catch (e: any) {
        console.log(`  ⚠️ X scrape failed: ${e.message}`);
      }
    }
  }

  // Deduplicate Instagram by image
  const seenImgs = new Set<string>();
  results.instagram = results.instagram.filter((p: any) => {
    if (seenImgs.has(p.image)) return false;
    seenImgs.add(p.image);
    return true;
  });

  // Download Instagram images to local cache (persists beyond CDN token expiry)
  const IMG_DIR = join(process.cwd(), 'public', 'uploads', 'ig');
  mkdirSync(IMG_DIR, { recursive: true });
  let downloaded = 0;
  for (const post of results.instagram) {
    const shortcode = post.id.replace('ig_', '');
    const localPath = join(IMG_DIR, `${shortcode}.jpg`);
    if (!existsSync(localPath) && post.image) {
      try {
        const resp = await fetch(post.image);
        if (resp.ok) {
          const buffer = Buffer.from(await resp.arrayBuffer());
          writeFileSync(localPath, buffer);
          downloaded++;
        }
      } catch {}
    }
    // Replace CDN URL with local path
    post.image = `/uploads/ig/${shortcode}.jpg`;
  }
  if (downloaded > 0) console.log(`  💾 Downloaded ${downloaded} new images to local cache`);

  // Write data files
  writeFileSync(join(DATA_DIR, 'ig-feed.json'), JSON.stringify(results.instagram, null, 2));
  writeFileSync(join(DATA_DIR, 'x-feed.json'), JSON.stringify(results.twitter, null, 2));
  writeFileSync(join(DATA_DIR, 'vps-scrape-meta.json'), JSON.stringify({
    lastScrape: scrapedAt,
    instagramCount: results.instagram.length,
    twitterCount: results.twitter.length,
  }, null, 2));

  console.log(`\n✅ Done: ${results.instagram.length} Instagram, ${results.twitter.length} Twitter`);

  // Don't close the browser — it'll be killed by vps-feed-scrape.sh
}

main().catch(console.error);
