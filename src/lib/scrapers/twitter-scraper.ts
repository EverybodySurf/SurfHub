/**
 * Twitter/X Scraper Service
 *
 * Consolidates two previous implementations:
 * - scraper.ts (Nitter via Puppeteer) — fallback path
 * - scraper-cdp.ts (Twitter direct via Playwright CDP) — primary path
 */

import type { Browser, Page } from 'playwright';
import { browserService } from './browser-service';
import { normalizeTimestamp } from '../timestamp-utils';
import type { TwitterPost, ScrapeResult } from './types';

export async function scrapeTwitter(query: string = 'surf waves'): Promise<ScrapeResult<TwitterPost>> {
  const browser = await browserService.getBrowser();
  const scrapedAt = new Date().toISOString();

  if (!browser) {
    return {
      success: true,
      method: 'twitter-cdp-fallback',
      items: [],
      scrapedAt,
    };
  }

  try {
    // Try CDP path first (authenticated browser — logged into Twitter/X)
    let page: Page | null = await browserService.findExistingPage(browser, 'x.com/search');

    if (!page) {
      page = await browserService.getPage(browser);
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&f=tweets`;
      console.log(`🐦 Navigating to Twitter: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    // Wait for tweets to load
    try {
      const tweetLocator = page.locator('[data-testid="tweet"]');
      await tweetLocator.first().waitFor({ timeout: 15000 });
    } catch {
      // If CDP tweets don't load, try Nitter fallback
      return await scrapeTwitterViaNitter(query, browser, scrapedAt);
    }

    const tweets = await page.evaluate(() => {
      const tweetElements = Array.from(document.querySelectorAll('[data-testid="tweet"]'));
      const seen = new Set<string>();

      return tweetElements.slice(0, 15).map((tweet, i) => {
        const textEl = tweet.querySelector('div[lang]');
        const text = textEl?.textContent || '';

        const userLink = tweet.querySelector('a[href^="/"]');
        const userHref = userLink?.getAttribute('href') || '';
        const author = userHref.replace('/', '@');

        const statusLink = tweet.querySelector('a[href*="/status/"]');
        const tweetHref = statusLink?.getAttribute('href') || '';
        const tweetIdMatch = tweetHref.match(/status\/(\d+)/);
        const tweetId = tweetIdMatch?.[1] || `tw_${Date.now()}_${i}`;

        const timeEl = tweet.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime') || '';

        if (seen.has(tweetId) || (!text && author === '@')) return null;
        seen.add(tweetId);

        return {
          id: tweetId,
          content: text.trim().slice(0, 200),
          source: author,
          publishedAt: datetimeAttr,
          link: `https://twitter.com${tweetHref}`,
        };
      }).filter(Boolean) as Array<{ id: string; content: string; source: string; publishedAt: string; link: string }>;
    });

    if (tweets.length === 0) {
      // CDP loaded but no tweets found — try Nitter
      return await scrapeTwitterViaNitter(query, browser, scrapedAt);
    }

    return {
      success: true,
      method: 'twitter-cdp',
      items: tweets.map(t => ({
        id: t.id,
        content: t.content,
        source: t.source,
        link: t.link,
        timestamp: normalizeTimestamp(t.publishedAt),
        hasValidTimestamp: !!t.publishedAt?.includes('T'),
        platform: 'twitter' as const,
      })),
      scrapedAt,
    };

  } catch (error: any) {
    console.error('Twitter CDP scrape failed:', error.message);
    // Try Nitter fallback
    return await scrapeTwitterViaNitter(query, browser, scrapedAt);
  }
}

/**
 * Fallback: scrape Twitter via Nitter (open frontend, no auth needed)
 */
async function scrapeTwitterViaNitter(
  query: string,
  browser: Browser,
  scrapedAt: string,
): Promise<ScrapeResult<TwitterPost>> {
  let page: Page;

  try {
    page = await browserService.getPage(browser);
    const nitterUrl = `https://nitter.net/search?q=${encodeURIComponent(query)}`;
    await page.goto(nitterUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.timeline-item', { timeout: 15000 });
  } catch (error: any) {
    console.error('Nitter scrape failed:', error.message);
    return {
      success: true,
      method: 'twitter-none',
      items: [],
      scrapedAt,
    };
  }

  const tweets = await page.evaluate(() => {
    const elements = document.querySelectorAll('.timeline-item');
    const results: Array<{ content: string; source: string; link: string }> = [];

    elements.forEach((tweet, index) => {
      if (index >= 15) return;
      const textEl = tweet.querySelector('.tweet-content');
      const authorEl = tweet.querySelector('.username');
      const linkEl = tweet.querySelector('.tweet-link');
      if (textEl && authorEl) {
        results.push({
          content: textEl.textContent?.trim() || '',
          source: authorEl.textContent?.trim() || '',
          link: linkEl?.getAttribute('href') || '',
        });
      }
    });

    return results;
  });

  return {
    success: true,
    method: 'twitter-nitter',
    items: tweets.map((t, i) => ({
      id: `tw_nitter_${i}`,
      content: t.content,
      source: t.source,
      link: t.link,
      timestamp: new Date().toISOString(),
      hasValidTimestamp: false,
      platform: 'twitter' as const,
    })),
    scrapedAt,
  };
}
