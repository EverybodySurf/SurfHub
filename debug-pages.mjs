import { chromium } from 'playwright';

const CDP_URL = 'http://127.0.0.1:9224';

async function debugPages() {
  console.log('🔍 Connecting to browser...');
  const browser = await chromium.connectOverCDP(CDP_URL);
  
  const contexts = browser.contexts();
  const defaultContext = contexts[0];
  const pages = defaultContext.pages();
  
  console.log(`\n📊 Found ${pages.length} pages:`);
  
  for (const page of pages) {
    const url = page.url();
    const title = await page.title();
    
    // Focus on TikTok and Instagram
    if (url.includes('tiktok.com/search') || url.includes('instagram.com/explore')) {
      console.log(`\n🎯 Page: ${title}`);
      console.log(`   URL: ${url}`);
      
      // Try to find video/post elements
      if (url.includes('tiktok')) {
        console.log('\n   Checking TikTok selectors...');
        
        // Check various selectors
        const selectors = [
          '[data-e2e="search-video-item"]',
          '[data-e2e="search-video-container"]',
          '.tiktok-x1y7ihv',
          'div[class*="DivItemContainer"]',
          'a[href*="/video/"]',
        ];
        
        for (const sel of selectors) {
          const count = await page.locator(sel).count();
          console.log(`   ${sel}: ${count} elements`);
        }
        
        // Get page HTML snippet
        const bodyText = await page.locator('body').innerText();
        console.log(`\n   Page text preview (first 500 chars):\n   ${bodyText.slice(0, 500)}`);
        
        // Check if videos are visible
        const videoLinks = await page.locator('a[href*="/video/"]').all();
        console.log(`\n   Found ${videoLinks.length} video links`);
        
        if (videoLinks.length > 0) {
          for (let i = 0; i < Math.min(3, videoLinks.length); i++) {
            const href = await videoLinks[i].getAttribute('href');
            console.log(`   Video ${i+1}: ${href}`);
          }
        }
      }
      
      if (url.includes('instagram')) {
        console.log('\n   Checking Instagram selectors...');
        
        const selectors = [
          'article',
          'article a[href*="/p/"]',
          'article a[href*="/reel/"]',
          'a[href*="/p/"]',
          'a[href*="/reel/"]',
          'div[class*="_aagu"]',
        ];
        
        for (const sel of selectors) {
          const count = await page.locator(sel).count();
          console.log(`   ${sel}: ${count} elements`);
        }
        
        // Get page HTML snippet
        const bodyText = await page.locator('body').innerText();
        console.log(`\n   Page text preview (first 500 chars):\n   ${bodyText.slice(0, 500)}`);
        
        // Check post links
        const postLinks = await page.locator('a[href*="/p/"], a[href*="/reel/"]').all();
        console.log(`\n   Found ${postLinks.length} post links`);
        
        if (postLinks.length > 0) {
          for (let i = 0; i < Math.min(3, postLinks.length); i++) {
            const href = await postLinks[i].getAttribute('href');
            console.log(`   Post ${i+1}: ${href}`);
          }
        }
      }
    }
  }
  
  await browser.close();
  console.log('\n✅ Done');
}

debugPages().catch(console.error);