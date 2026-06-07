/**
 * YouTube Scraper Service
 *
 * Consolidates two previous implementations:
 * - scraper.ts (YouTube Data API + Puppeteer fallback)
 * - scraper-cdp.ts (YouTube Data API — pure HTTP)
 *
 * Strategy: YouTube Data API v3 first (no browser needed), headless Playwright fallback.
 */

import type { Browser, Page } from 'playwright';
import { browserService } from './browser-service';
import type { YouTubeVideo, ScrapeResult } from './types';

export async function scrapeYouTube(query: string = 'surf waves 2024', maxResults: number = 10): Promise<ScrapeResult<YouTubeVideo>> {
  const scrapedAt = new Date().toISOString();

  // Try official API first (fastest, highest quality data)
  const apiResult = await scrapeYouTubeAPI(query, maxResults, scrapedAt);
  if (apiResult.success && apiResult.items.length > 0) {
    return apiResult;
  }

  // Fallback: headless scraping
  return await scrapeYouTubeHeadless(query, maxResults, scrapedAt);
}

/**
 * YouTube Data API v3 — pure HTTP, no browser needed
 */
async function scrapeYouTubeAPI(query: string, maxResults: number, scrapedAt: string): Promise<ScrapeResult<YouTubeVideo>> {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    console.log('⚠️ YouTube: no YOUTUBE_API_KEY');
    return { success: false, method: 'youtube-api', error: 'No API key', scrapedAt };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=date&key=${API_KEY}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { success: false, method: 'youtube-api', error: 'No results', scrapedAt };
    }

    return {
      success: true,
      method: 'youtube-api',
      items: data.items.map((item: any) => {
        const videoId = item.id.videoId;
        return {
          id: videoId,
          title: item.snippet.title,
          content: item.snippet.description?.slice(0, 100) || '',
          source: item.snippet.channelTitle,
          timestamp: item.snippet.publishedAt,
          hasValidTimestamp: true,
          platform: 'youtube' as const,
          image: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        };
      }),
      scrapedAt,
    };
  } catch (error: any) {
    console.error('YouTube API error:', error.message);
    return { success: false, method: 'youtube-api', error: error.message, scrapedAt };
  }
}

/**
 * Headless Playwright fallback — scrapes YouTube search results
 */
async function scrapeYouTubeHeadless(query: string, maxResults: number, scrapedAt: string): Promise<ScrapeResult<YouTubeVideo>> {
  const browser = await browserService.getBrowser();

  if (!browser) {
    return { success: true, method: 'youtube-none', items: [], scrapedAt };
  }

  let page: Page | null = null;
  try {
    page = await browserService.getPage(browser);
    await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForSelector('ytd-video-renderer', { timeout: 15000 });

    const videos = await page.evaluate((max: number) => {
      const elements = document.querySelectorAll('ytd-video-renderer');
      const results: Array<{ id: string; title: string; source: string; videoUrl: string; image: string }> = [];

      elements.forEach((video, index) => {
        if (index >= max) return;
        const titleEl = video.querySelector('#video-title');
        const thumbnailEl = video.querySelector('img');
        const channelEl = video.querySelector('ytd-channel-name a');

        results.push({
          id: titleEl?.getAttribute('href')?.match(/v=([^&]+)/)?.[1] || '',
          title: titleEl?.textContent?.trim() || '',
          source: channelEl?.textContent?.trim() || '',
          videoUrl: `https://youtube.com${titleEl?.getAttribute('href') || ''}`,
          image: thumbnailEl?.getAttribute('src') || '',
        });
      });

      return results;
    }, maxResults);

    return {
      success: true,
      method: 'youtube-headless',
      items: videos.map(v => ({
        id: v.id || `yt_h_${Date.now()}`,
        title: v.title,
        content: v.title,
        source: v.source,
        timestamp: new Date().toISOString(),
        hasValidTimestamp: false,
        platform: 'youtube' as const,
        image: v.image || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        videoUrl: v.videoUrl,
      })),
      scrapedAt,
    };
  } catch (error: any) {
    console.error('YouTube headless scrape failed:', error.message);
    return { success: true, method: 'youtube-none', items: [], scrapedAt };
  } finally {
    if (page) await browserService.closePage(page);
  }
}
