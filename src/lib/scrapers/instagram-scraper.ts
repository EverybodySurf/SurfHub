/**
 * Instagram Scraper Service
 *
 * Consolidates from scraper-cdp.ts (Playwright CDP).
 * Uses VPS browser via CDP for authenticated access.
 */

import type { Browser, Page } from 'playwright';
import { browserService } from './browser-service';
import { normalizeTimestamp } from '../timestamp-utils';
import type { InstagramPost, ScrapeResult } from './types';

export async function scrapeInstagram(query: string = 'surf'): Promise<ScrapeResult<InstagramPost>> {
  const browser = await browserService.getBrowser();
  const scrapedAt = new Date().toISOString();

  if (!browser) {
    return {
      success: true,
      method: 'instagram-none',
      items: [],
      scrapedAt,
    };
  }

  try {
    const hashtag = query.replace(/\s+/g, '').toLowerCase();

    let page: Page | null = await browserService.findExistingPage(browser, 'instagram.com/explore/search');

    if (!page) {
      page = await browserService.getPage(browser);
      const searchUrl = `https://www.instagram.com/explore/search/keyword/?q=%23${hashtag}`;
      console.log(`📸 Navigating to Instagram: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    // Wait for posts to load
    const postLocator = page.locator('a[href*="/p/"], a[href*="/reel/"]');
    await postLocator.first().waitFor({ timeout: 15000 });

    const posts = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
      const seen = new Set<string>();

      return links.slice(0, 15).map((link, i) => {
        const href = link.getAttribute('href') || '';
        const shortcode = href.match(/\/(p|reel)\/([^/]+)/)?.[2] || `ig_${Date.now()}_${i}`;

        if (seen.has(shortcode)) return null;
        seen.add(shortcode);

        const type = href.includes('/reel/') ? 'reel' : 'photo';
        const img = link.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';
        const caption = img?.getAttribute('alt')?.slice(0, 100) || 'Instagram Post';

        const timeEl = link.querySelector('time') || link.parentElement?.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime') || '';

        return {
          id: shortcode,
          type,
          caption: caption.trim(),
          image: thumbnail,
          postUrl: `https://www.instagram.com${href}`,
          publishedAt: datetimeAttr,
        };
      }).filter(Boolean) as Array<{ id: string; type: string; caption: string; image: string; postUrl: string; publishedAt: string }>;
    });

    return {
      success: true,
      method: 'instagram-cdp',
      items: posts.map(p => ({
        id: `ig_${p.id}`,
        content: p.caption,
        source: '@instagram',
        timestamp: normalizeTimestamp(p.publishedAt),
        hasValidTimestamp: !!p.publishedAt?.includes('T'),
        platform: 'instagram' as const,
        type: p.type as 'photo' | 'reel',
        caption: p.caption,
        title: p.caption,
        image: p.image,
        postUrl: p.postUrl,
      })),
      scrapedAt,
    };

  } catch (error: any) {
    console.error('Instagram CDP scrape failed:', error.message);
    return {
      success: true,
      method: 'instagram-cdp-failed',
      items: [],
      scrapedAt,
    };
  }
}
