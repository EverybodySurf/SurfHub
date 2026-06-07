// @ts-nocheck
// ⚠️ DEPRECATED — use @/lib/scrapers instead
// This file is kept for reference only. All active code uses the new scraper services.
import puppeteer from 'puppeteer';

// Browser instance cache
let browser: any = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

// Twitter/X scraper — uses Nitter (open frontend) to avoid auth
export async function scrapeTwitter(query: string = 'surf waves Guadeloupe') {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Use Nitter (open Twitter frontend) instead of Twitter
    const nitterUrl = `https://nitter.net/search?q=${encodeURIComponent(query)}`;
    await page.goto(nitterUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for timeline
    await page.waitForSelector('.timeline-item', { timeout: 15000 });
    
    // Extract tweet data
    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('.timeline-item');
      const results: any[] = [];
      
      tweetElements.forEach((tweet, index) => {
        if (index >= 15) return;
        
        try {
          const textEl = tweet.querySelector('.tweet-content');
          const authorEl = tweet.querySelector('.username');
          const linkEl = tweet.querySelector('.tweet-link');
          
          if (textEl && authorEl) {
            results.push({
              content: textEl?.textContent?.trim() || '',
              source: authorEl?.textContent?.trim() || '',
              link: linkEl?.getAttribute('href') || '',
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {}
      });
      
      return results;
    });
    
    return tweets;
  } catch (error) {
    console.error('Nitter scrape error:', error);
    // Fallback to original Twitter (may fail without auth)
    return scrapeTwitterDirect(query);
  } finally {
    await page.close();
  }
}

// Direct Twitter scrape (fallback, usually blocked without auth)
async function scrapeTwitterDirect(query: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&f=tweets`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });
    
    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
      const results: any[] = [];
      
      tweetElements.forEach((tweet, index) => {
        if (index >= 10) return;
        
        try {
          const textEl = tweet.querySelector('[data-testid="tweetText"]');
          const authorEl = tweet.querySelector('[data-testid="User-Names"] a');
          
          if (textEl) {
            results.push({
              content: textEl?.textContent?.trim() || '',
              source: authorEl?.getAttribute('href')?.replace('/', '@') || '',
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {}
      });
      
      return results;
    });
    
    return tweets;
  } catch (error) {
    console.error('Direct Twitter scrape failed:', error);
    return [];
  } finally {
    await page.close();
  }
}

// YouTube scraper — uses YouTube Data API if key available, else Puppeteer
export async function scrapeYouTube(query: string = 'surf waves 2024') {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  // If API key exists, use official API
  if (YOUTUBE_API_KEY) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items) {
        return data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          content: item.snippet.description?.slice(0, 100) || '',
          source: item.snippet.channelTitle,
          videoUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
          image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          timestamp: item.snippet.publishedAt,
        }));
      }
    } catch (error) {
      console.error('YouTube API error:', error);
    }
  }
  
  // Fallback: Puppeteer scraping
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for video grid
    await page.waitForSelector('ytd-video-renderer', { timeout: 15000 });
    
    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      const results: any[] = [];
      
      videoElements.forEach((video, index) => {
        if (index >= 10) return;
        
        try {
          const titleEl = video.querySelector('#video-title');
          const thumbnailEl = video.querySelector('img');
          const channelEl = video.querySelector('ytd-channel-name a');
          
          results.push({
            id: titleEl?.getAttribute('href')?.match(/v=([^&]+)/)?.[1] || '',
            title: titleEl?.textContent?.trim() || '',
            source: channelEl?.textContent?.trim() || '',
            videoUrl: `https://youtube.com${titleEl?.getAttribute('href') || ''}`,
            image: thumbnailEl?.getAttribute('src') || '',
            timestamp: new Date().toISOString(),
          });
        } catch (e) {}
      });
      
      return results;
    });
    
    return videos;
  } catch (error) {
    console.error('YouTube scrape error:', error);
    return [];
  } finally {
    await page.close();
  }
}

// Close browser when done
export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}