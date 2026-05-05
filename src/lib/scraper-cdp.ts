import { chromium, Browser, Page, BrowserContext } from 'playwright';

// CDP connection to VPS browser
const VPS_CDP_URL = process.env.VPS_CDP_URL || 'http://127.0.0.1:9224';

// Track browser connection
let sharedBrowser: Browser | null = null;

// Connect to existing browser session via CDP
export async function connectToVPSBrowser(): Promise<Browser | null> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
  
  try {
    const browser = await chromium.connectOverCDP(VPS_CDP_URL);
    console.log('✅ Connected to VPS browser via CDP (Playwright)');
    sharedBrowser = browser;
    return browser;
  } catch (error: any) {
    console.log('⚠️ VPS browser not available:', error.message);
    return null;
  }
}

// Create a NEW page (preserves cookies/session)
async function getPage(browser: Browser): Promise<Page> {
  const contexts = browser.contexts();
  if (contexts.length > 0) {
    return contexts[0].newPage();
  }
  const context = await browser.newContext();
  return context.newPage();
}

// Find existing page by URL pattern
async function findExistingPage(browser: Browser, urlPattern: string): Promise<Page | null> {
  const contexts = browser.contexts();
  if (contexts.length > 0) {
    const pages = contexts[0].pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes(urlPattern)) {
        console.log(`🔄 Found existing page: ${url}`);
        return page;
      }
    }
  }
  return null;
}

// Disconnect from browser
export async function disconnectBrowser(): Promise<void> {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
      sharedBrowser = null;
      console.log('🔌 Disconnected from VPS browser');
    } catch (e) {
      console.log('Disconnect error (ignored):', e);
    }
  }
}

// Parse relative time to absolute timestamp
function parseRelativeTime(relativeTime: string): Date | null {
  const now = new Date();
  
  // Parse "2h", "1d", "3m", "5s" etc.
  const match = relativeTime.match(/(\d+)([hdm])/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'h': return new Date(now.getTime() - value * 60 * 60 * 1000);
    case 'd': return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    case 'm': return new Date(now.getTime() - value * 60 * 1000);
    default: return null;
  }
}

// TikTok scraper — uses existing page if available
export async function scrapeTikTokCDP(query: string = 'surf waves'): Promise<any[]> {
  const browser = await connectToVPSBrowser();
  
  if (!browser) {
    console.log('⚠️ No VPS browser');
    return [];
  }
  
  try {
    // Try to use existing TikTok search page (already loaded with content)
    let page = await findExistingPage(browser, 'tiktok.com/search');
    
    if (!page) {
      page = await getPage(browser);
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}&t=1`;
      console.log(`🎬 Navigating to TikTok: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      console.log(`🎬 Using existing TikTok search page`);
    }
    
    // Extract video data via evaluate (FAST - runs in browser context)
    const videos = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));
      const seen = new Set();
      
      return links.slice(0, 15).map((link, i) => {
        const href = link.getAttribute('href') || '';
        const match = href.match(/video\/(\d+)/);
        const videoId = match?.[1] || `tt_${Date.now()}_${i}`;
        
        // Skip duplicates
        if (seen.has(videoId)) return null;
        seen.add(videoId);
        
        // Get thumbnail from img inside link
        const img = link.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';
        
        // Get title from parent container
        const parent = link.parentElement?.parentElement;
        const title = parent?.textContent?.slice(0, 100) || 'TikTok Video';
        
        // Get author from href
        const authorMatch = href.match(/@([^/]+)/);
        const author = authorMatch?.[1] || 'tiktok';
        
        // Try to get timestamp from TikTok (usually shows relative time like "2h")
        // Look for time element or relative time text
        const timeEl = parent?.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime');
        
        // TikTok often shows relative time in spans
        const allText = parent?.textContent || '';
        const relativeMatch = allText.match(/(\d+[hdm])/);
        
        return {
          id: videoId,
          title: title.trim(),
          source: `@${author}`,
          videoUrl: `https://www.tiktok.com${href}`,
          image: thumbnail,
          publishedAt: datetimeAttr || relativeMatch?.[1] || null, // Raw timestamp
          platform: 'tiktok',
        };
      }).filter(Boolean);
    });
    
    // Post-process timestamps
    const processedVideos = videos.map(v => {
      let publishedDate: Date | null = null;
      
      if (v.publishedAt) {
        // Try ISO format first
        if (v.publishedAt.includes('T')) {
          publishedDate = new Date(v.publishedAt);
        } else {
          // Parse relative time
          publishedDate = parseRelativeTime(v.publishedAt);
        }
      }
      
      return {
        ...v,
        timestamp: publishedDate?.toISOString() || new Date().toISOString(),
        hasValidTimestamp: !!publishedDate,
      };
    });
    
    console.log(`✅ Extracted ${processedVideos.length} TikTok videos`);
    return processedVideos;
    
  } catch (error: any) {
    console.error('❌ TikTok CDP scrape error:', error.message);
    return [];
  }
}

// Twitter/X scraper — uses existing page if available
export async function scrapeTwitterCDP(query: string = 'surf waves'): Promise<any[]> {
  const browser = await connectToVPSBrowser();
  
  if (!browser) {
    console.log('⚠️ No VPS browser');
    return [];
  }
  
  try {
    let page = await findExistingPage(browser, 'x.com/search');
    
    if (!page) {
      page = await getPage(browser);
      const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&f=tweets`;
      console.log(`🐦 Navigating to Twitter: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      console.log(`🐦 Using existing Twitter search page`);
    }
    
    // Wait for tweets
    const tweetLocator = page.locator('[data-testid="tweet"]');
    await tweetLocator.first().waitFor({ timeout: 15000 });
    
    const count = await tweetLocator.count();
    console.log(`📊 Found ${count} tweets`);
    
    // Extract tweets via evaluate (FAST)
    const tweets = await page.evaluate(() => {
      const tweetElements = Array.from(document.querySelectorAll('[data-testid="tweet"]'));
      const seen = new Set();
      
      return tweetElements.slice(0, 15).map((tweet, i) => {
        // Get tweet text
        const textEl = tweet.querySelector('div[lang]');
        const text = textEl?.textContent || '';
        
        // Get author
        const userLink = tweet.querySelector('a[href^="/"]');
        const userHref = userLink?.getAttribute('href') || '';
        const author = userHref.replace('/', '@');
        
        // Get tweet link
        const statusLink = tweet.querySelector('a[href*="/status/"]');
        const tweetHref = statusLink?.getAttribute('href') || '';
        const tweetIdMatch = tweetHref.match(/status\/(\d+)/);
        const tweetId = tweetIdMatch?.[1] || `tw_${Date.now()}_${i}`;
        
        // Get TIMESTAMP from <time datetime="...">
        const timeEl = tweet.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime') || '';
        
        // Skip duplicates or empty
        if (seen.has(tweetId) || (!text && author === '@')) return null;
        seen.add(tweetId);
        
        return {
          id: tweetId,
          content: text.trim().slice(0, 200),
          source: author,
          publishedAt: datetimeAttr, // ISO timestamp from Twitter
          link: `https://twitter.com${tweetHref}`,
          platform: 'twitter',
        };
      }).filter(Boolean);
    });
    
    // Post-process timestamps
    const processedTweets = tweets.map(t => {
      let publishedDate: Date | null = null;
      
      if (t.publishedAt && t.publishedAt.includes('T')) {
        publishedDate = new Date(t.publishedAt);
      }
      
      return {
        ...t,
        timestamp: publishedDate?.toISOString() || new Date().toISOString(),
        hasValidTimestamp: !!publishedDate,
      };
    });
    
    console.log(`✅ Extracted ${processedTweets.length} tweets`);
    return processedTweets;

  } catch (error: any) {
    console.error('❌ Twitter CDP scrape error:', error.message);
    return [];
  }
}

// Instagram scraper — uses existing page if available
export async function scrapeInstagramCDP(query: string = 'surf'): Promise<any[]> {
  const browser = await connectToVPSBrowser();
  
  if (!browser) {
    console.log('⚠️ No VPS browser');
    return [];
  }
  
  try {
    const hashtag = query.replace(/\s+/g, '').toLowerCase();
    
    // Try to use existing Instagram search page
    let page = await findExistingPage(browser, 'instagram.com/explore/search');
    
    if (!page) {
      page = await getPage(browser);
      const searchUrl = `https://www.instagram.com/explore/search/keyword/?q=%23${hashtag}`;
      console.log(`📸 Navigating to Instagram: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      console.log(`📸 Using existing Instagram search page`);
    }
    
    // Wait for posts
    const postLocator = page.locator('a[href*="/p/"], a[href*="/reel/"]');
    await postLocator.first().waitFor({ timeout: 15000 });
    
    const count = await postLocator.count();
    console.log(`📊 Found ${count} Instagram posts`);
    
    // Extract posts via evaluate (FAST)
    const posts = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
      const seen = new Set();
      
      return links.slice(0, 15).map((link, i) => {
        const href = link.getAttribute('href') || '';
        
        // Extract shortcode
        const shortcode = href.match(/\/(p|reel)\/([^/]+)/)?.[2] || `ig_${Date.now()}_${i}`;
        
        // Skip duplicates
        if (seen.has(shortcode)) return null;
        seen.add(shortcode);
        
        // Determine type
        const type = href.includes('/reel/') ? 'reel' : 'photo';
        
        // Get thumbnail
        const img = link.querySelector('img');
        const thumbnail = img?.getAttribute('src') || '';
        
        // Get caption from alt or nearby text
        const caption = img?.getAttribute('alt')?.slice(0, 100) || 'Instagram Post';
        
        // Get TIMESTAMP from <time datetime="...">
        // Instagram posts have time elements
        const timeEl = link.querySelector('time') || link.parentElement?.querySelector('time');
        const datetimeAttr = timeEl?.getAttribute('datetime') || '';
        
        return {
          id: shortcode,
          type,
          caption: caption.trim(),
          source: '@instagram',
          postUrl: `https://www.instagram.com${href}`,
          image: thumbnail,
          publishedAt: datetimeAttr, // ISO timestamp if available
          platform: 'instagram',
        };
      }).filter(Boolean);
    });
    
    // Post-process timestamps
    const processedPosts = posts.map(p => {
      let publishedDate: Date | null = null;
      
      if (p.publishedAt && p.publishedAt.includes('T')) {
        publishedDate = new Date(p.publishedAt);
      }
      
      return {
        ...p,
        timestamp: publishedDate?.toISOString() || new Date().toISOString(),
        hasValidTimestamp: !!publishedDate,
      };
    });
    
    console.log(`✅ Extracted ${processedPosts.length} Instagram posts`);
    return processedPosts;
    
  } catch (error: any) {
    console.error('❌ Instagram CDP scrape error:', error.message);
    return [];
  }
}

// YouTube Data API v3 scraper — NO browser needed, pure API
export async function scrapeYouTubeAPI(query: string = 'surf waves 2024', maxResults: number = 10): Promise<any[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    console.log('⚠️ No YOUTUBE_API_KEY — set in ~/.env');
    return [];
  }
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=date&key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('⚠️ No YouTube results');
      return [];
    }
    
    // Extract videos with REAL publishedAt timestamps
    const videos = data.items.map((item: any) => {
      const videoId = item.id.videoId;
      const snippet = item.snippet;
      
      return {
        id: videoId,
        title: snippet.title,
        source: snippet.channelTitle,
        publishedAt: snippet.publishedAt, // ISO timestamp from YouTube
        // Use maxresdefault for HD thumbnails (best quality, fallback to hqdefault if not available)
        image: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        platform: 'youtube',
      };
    });
    
    // Process timestamps
    const processedVideos = videos.map(v => ({
      ...v,
      timestamp: v.publishedAt, // Real publishedAt from YouTube API
      hasValidTimestamp: !!v.publishedAt,
    }));
    
    console.log(`✅ YouTube API: ${processedVideos.length} videos with real timestamps`);
    return processedVideos;
    
  } catch (error: any) {
    console.error('❌ YouTube API error:', error.message);
    return [];
  }
}

// Convenience: scrape all platforms
export async function scrapeAllCDP(queries: { tiktok?: string; twitter?: string; instagram?: string } = {}) {
  const results = {
    tiktok: await scrapeTikTokCDP(queries.tiktok || 'surf waves'),
    twitter: await scrapeTwitterCDP(queries.twitter || 'surf waves'),
    instagram: await scrapeInstagramCDP(queries.instagram || 'surf'),
  };
  
  return results;
}