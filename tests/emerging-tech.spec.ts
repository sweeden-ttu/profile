import { test, expect, Page } from '@playwright/test';

/**
 * Emerging Tech Page UI Integration Tests
 * Verifies page reachability, JavaScript errors, CSS errors, and broken links
 */

// Store console errors and failed requests
let jsErrors: string[] = [];
let cssErrors: string[] = [];
let failedRequests: { url: string; status: number }[] = [];

// Helper to setup error listeners
function setupErrorListeners(page: Page) {
  jsErrors = [];
  cssErrors = [];
  failedRequests = [];

  // Capture JavaScript errors
  page.on('pageerror', (error) => {
    jsErrors.push(error.message);
  });

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
    }
  });

  // Capture failed network requests (CSS, JS, etc.)
  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    if (status >= 400) {
      failedRequests.push({ url, status });
    }

    // Check for CSS errors (failed to load stylesheets)
    if (status >= 400 && contentType.includes('css')) {
      cssErrors.push(`Failed to load CSS: ${url} (${status})`);
    }
  });
}

test.describe('Emerging Tech Page - Reachability', () => {
  test('page should be reachable at /emerging-tech/', async ({ page }) => {
    setupErrorListeners(page);

    const response = await page.goto('/emerging-tech/');

    // Verify page is reachable (200 status)
    expect(response?.status()).toBe(200);

    // Verify page title contains expected content
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe('Emerging Tech Page - JavaScript Errors', () => {
  test('should have no JavaScript errors on page load', async ({ page }) => {
    setupErrorListeners(page);

    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    // Report JS errors if any
    if (jsErrors.length > 0) {
      console.log('JavaScript Errors found:', jsErrors);
    }

    expect(jsErrors).toHaveLength(0);
  });

  test('should have no JavaScript errors after interactions', async ({ page }) => {
    setupErrorListeners(page);

    await page.goto('/emerging-tech/');
    // Don't wait for networkidle — the page lazy-loads Mermaid as a chain of
    // ES module chunks that never quite settle within the test budget. Wait
    // for DOMContentLoaded plus a short stabilization tick instead.
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    // Try scrolling to trigger lazy-loaded scripts
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);

    // Try hovering a few interactive elements; ignore individual hover errors
    // (e.g. an element scrolled out of view between locate and hover).
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await buttons.nth(i).hover({ timeout: 1500 });
      } catch {
        // ignore
      }
    }

    expect(jsErrors).toHaveLength(0);
  });
});

test.describe('Emerging Tech Page - CSS Errors', () => {
  test('should have no CSS loading errors', async ({ page }) => {
    setupErrorListeners(page);

    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    // Check for failed CSS requests
    const cssFailures = failedRequests.filter(req =>
      req.url.includes('.css')
    );

    if (cssFailures.length > 0) {
      console.log('CSS Failures:', cssFailures);
    }

    expect(cssFailures).toHaveLength(0);
  });

  test('page should render with expected styles applied', async ({ page }) => {
    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    // Check that the page has some styled content
    const body = page.locator('body');
    const display = await body.evaluate(el =>
      window.getComputedStyle(el).display
    );
    expect(display).toBeTruthy();

    // Check for presence of CSS custom properties (design system)
    const hasStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--color-primary') ||
             styles.getPropertyValue('--primary') ||
             document.querySelector('link[rel="stylesheet"]') !== null;
    });
    expect(hasStyles).toBeTruthy();
  });
});

test.describe('Emerging Tech Page - Broken Links', () => {
  test('should have no broken internal links', async ({ page }) => {
    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    // Get all links on the page
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    const brokenLinks: { href: string; status: number }[] = [];

    for (let i = 0; i < linkCount; i++) {
      const href = await links.nth(i).getAttribute('href');

      // Skip external links, anchors, and javascript
      if (!href || href.startsWith('#') || href.startsWith('javascript:') ||
          href.startsWith('mailto:') || href.startsWith('http')) {
        continue;
      }

      // Resolve relative URLs
      const fullUrl = new URL(href, 'http://127.0.0.1:4000').href;

      try {
        const response = await page.request.get(fullUrl);
        const status = response.status();

        if (status >= 400) {
          brokenLinks.push({ href, status });
        }
      } catch {
        brokenLinks.push({ href, status: 0 });
      }
    }

    if (brokenLinks.length > 0) {
      console.log('Broken links found:', brokenLinks);
    }

    expect(brokenLinks).toHaveLength(0);
  });

  test('should have no broken asset links (images, scripts, stylesheets)', async ({ page }) => {
    const failedAssets: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const type = response.headers()['content-type'] || '';

      // Check assets: images, scripts, stylesheets
      if (status >= 400 &&
          (type.includes('image') || type.includes('javascript') ||
           type.includes('css') || url.match(/\.(png|jpg|jpeg|gif|svg|webp|js|css)$/))) {
        failedAssets.push(`${url} (${status})`);
      }
    });

    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    if (failedAssets.length > 0) {
      console.log('Broken assets found:', failedAssets);
    }

    expect(failedAssets).toHaveLength(0);
  });
});

test.describe('Emerging Tech Page - Content Validation', () => {
  test('should have expected page structure', async ({ page }) => {
    await page.goto('/emerging-tech/');
    await page.waitForLoadState('networkidle');

    // Check for main content area
    const main = page.locator('main, .content, .main-content, article').first();
    await expect(main).toBeVisible();

    // Check for heading
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Verify the page has content
    const text = await page.textContent('body');
    expect(text?.length).toBeGreaterThan(100);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/emerging-tech/');

    // Check for description meta tag
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();

    // Check for viewport meta tag
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewport).toBeTruthy();
  });
});
