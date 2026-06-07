/**
 * TikTok Scraper Service
 *
 * Consolidates from scraper-cdp.ts (Playwright CDP).
 * Uses VPS browser via CDP for authenticated access.
 */

import type { Browser, Page } from 'playwright';
import { browserService } from './browser-service';
import { normalizeTimestamp } from '../timestamp-utils';
import type { TikTokVideo, ScrapeResult } from './types';

export async function scrapeTikTok(query: string = 'surf waves'): Promise<ScrapeResult<TikTokVideo>> {
  const browser = await browserService.getBrowser();
  const scrapedAt = new Date().toISOString();

  if (!browser) {
    return {
      success: true,
      method: 'tiktok-none',
      items: [],
      scrapedAt,
    };
  }

  try {
    let page: Page | null = await browserService.findExistingPage(browser, 'tiktok.com/search');

    if (!page) {
      page = await browserService.getPage(browser);
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}&t=1`;
      console.log(`🎬 Navigating to TikTok: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait for video content to render (TikTok is JS-heavy SPA)
      try {
        await page.waitForSelector('a[href*="/video/"]', { timeout: 10000 });
      } catch {
        console.log('⚠️ TikTok: video selector timeout, continuing with current DOM');
      }
    }

    const videos = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));
      const seen = new Set<string>();

      return links.slice(0, 15).map((link, i) => {
        const href = link.getAttribute('href') || '';
        const match = href.match(/video\/(\d+)/);
        const videoId = match?.[1] || `tt_${Date.now()}_${i}`;

        if (seen.has(videoId)) return null;
        seen.add(videoId);

        const img = link.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';

        const parent = link.parentElement?.parentElement;
        const title = parent?.textContent?.slice(0, 100) || 'TikTok Video';

        const authorMatch = href.match(/@([^/]+)/);
        const author = authorMatch?.[1] || 'tiktok';

        const timeEl = parent?.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime');

        const allText = parent?.textContent || '';
        const relativeMatch = allText.match(/(\d+[hdm])/);

        return {
          id: videoId,
          title: title.trim(),
          source: `@${author}`,
          videoUrl: `https://www.tiktok.com${href}`,
          image: thumbnail,
          publishedAt: datetimeAttr || relativeMatch?.[1] || null,
        };
      }).filter(Boolean) as Array<{ id: string; title: string; source: string; videoUrl: string; image: string; publishedAt: string | null }>;
    });

    return {
      success: true,
      method: 'tiktok-cdp',
      items: videos.map(v => ({
        id: `tt_${v.id}`,
        content: v.title,
        source: v.source,
        timestamp: normalizeTimestamp(v.publishedAt),
        hasValidTimestamp: !!v.publishedAt && (v.publishedAt.includes('T') || /^\d+[hdm]$/.test(v.publishedAt)),
        platform: 'tiktok' as const,
        title: v.title,
        image: v.image,
        videoUrl: v.videoUrl,
      })),
      scrapedAt,
    };

  } catch (error: any) {
    console.error('TikTok CDP scrape failed:', error.message);
    return {
      success: true,
      method: 'tiktok-cdp-failed',
      items: [],
      scrapedAt,
    };
  }
}
