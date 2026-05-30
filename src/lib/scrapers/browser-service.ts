/**
 * BrowserService — unified browser lifecycle management
 *
 * Consolidates two previous separate implementations:
 * - scraper.ts (Puppeteer headless)
 * - scraper-cdp.ts (Playwright CDP)
 *
 * Strategy: CDP-first (connects to authenticated VPS browser),
 * falls back to headless Playwright when CDP unavailable.
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

const VPS_CDP_URL = process.env.VPS_CDP_URL || 'http://127.0.0.1:9224';

export class BrowserService {
  private cdpBrowser: Browser | null = null;
  private headlessBrowser: Browser | null = null;

  /**
   * Connect to an existing VPS browser via CDP (authenticated, cookies preserved)
   */
  async connectCDP(): Promise<Browser | null> {
    if (this.cdpBrowser?.isConnected()) return this.cdpBrowser;

    try {
      const browser = await chromium.connectOverCDP(VPS_CDP_URL);
      console.log('✅ BrowserService: connected to VPS browser via CDP');
      this.cdpBrowser = browser;
      return browser;
    } catch (error: any) {
      console.log('⚠️ BrowserService: VPS browser not available:', error.message);
      return null;
    }
  }

  /**
   * Launch a headless browser (no auth, suitable for public scrapes)
   */
  async launchHeadless(): Promise<Browser> {
    if (this.headlessBrowser?.isConnected()) return this.headlessBrowser;

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    console.log('✅ BrowserService: launched headless browser');
    this.headlessBrowser = browser;
    return browser;
  }

  /**
   * Get the best available browser — CDP preferred, headless fallback.
   * Returns null only if both methods fail.
   */
  async getBrowser(): Promise<Browser | null> {
    const cdp = await this.connectCDP();
    if (cdp) return cdp;

    try {
      return await this.launchHeadless();
    } catch (error: any) {
      console.error('❌ BrowserService: failed to launch any browser:', error.message);
      return null;
    }
  }

  /**
   * Get a page from the active browser.
   * For CDP, reuses existing context (preserving cookies/session).
   * For headless, creates a fresh context.
   */
  async getPage(browser: Browser): Promise<Page> {
    const contexts = browser.contexts();
    if (contexts.length > 0) {
      return contexts[0].newPage();
    }
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    return context.newPage();
  }

  /**
   * Find an existing page matching a URL pattern (reuses tabs instead of creating new ones).
   */
  async findExistingPage(browser: Browser, urlPattern: string): Promise<Page | null> {
    const contexts = browser.contexts();
    if (contexts.length > 0) {
      const pages = contexts[0].pages();
      for (const page of pages) {
        if (page.url().includes(urlPattern)) {
          console.log(`🔄 BrowserService: reusing existing page for: ${urlPattern}`);
          return page;
        }
      }
    }
    return null;
  }

  /**
   * Disconnect all browsers cleanly
   */
  async disconnect(): Promise<void> {
    if (this.cdpBrowser) {
      try {
        await this.cdpBrowser.close();
      } catch (e) {
        // ignore — CDP connection may already be closed
      }
      this.cdpBrowser = null;
    }
    if (this.headlessBrowser) {
      try {
        await this.headlessBrowser.close();
      } catch (e) {
        // ignore
      }
      this.headlessBrowser = null;
    }
    console.log('🔌 BrowserService: disconnected');
  }
}

// Singleton instance
export const browserService = new BrowserService();
