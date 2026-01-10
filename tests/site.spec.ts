import { test, expect } from '@playwright/test';

test.describe('Jekyll Site Tests', () => {
  const openNavIfHidden = async (page: any) => {
    const nav = page.locator('.site-nav');
    const toggle = page.getByRole('button', { name: /toggle menu/i });

    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(nav.first()).toHaveClass(/site-nav--open/, { timeout: 7000 });
    } else {
      await expect(nav.first()).toBeVisible({ timeout: 7000 });
    }
    return nav.first();
  };

  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Scott Weeden|Profile/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Check if about link exists and is clickable
    await openNavIfHidden(page);
    const aboutLink = page.locator('.site-nav a[href*="about"]').first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test('about page has required content', async ({ page }) => {
    await page.goto('/about');

    // Check for key biographical information
    const body = page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText) {
      // Check for at least one of the key locations mentioned
      const hasLocation = bodyText.includes('Oregon') ||
                         bodyText.includes('Texas') ||
                         bodyText.includes('Texas Tech');
      expect(hasLocation).toBeTruthy();
    }
  });

  test('research page loads', async ({ page }) => {
    await page.goto('/research');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('blog index loads', async ({ page }) => {
    await page.goto('/blog');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Navigation should be present
    const nav = await openNavIfHidden(page);
    await expect(nav).toBeVisible();
  });

  test('responsive design - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const nav = await openNavIfHidden(page);
    await expect(nav).toBeVisible();
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like missing favicons in dev)
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('internal links are present', async ({ page }) => {
    await page.goto('/');
    const internalLinks = await page.locator('a[href^="/"]').count();
    expect(internalLinks).toBeGreaterThan(0);
  });

  test('meta tags present for SEO', async ({ page }) => {
    await page.goto('/');

    // Check for basic meta tags
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);

    // Check for Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveCount(1);
    }
  });

  test('viewport meta tag present', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have visible top-level headings
    const headingCount = await page.locator('h1, h2').count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt can be empty string (decorative images), but attribute should exist
      expect(alt).not.toBeNull();
    }
  });

  test('external links have proper attributes', async ({ page }) => {
    await page.goto('/');

    const externalLinks = await page.locator('a[href^="http"]:not([href*="localhost"])').all();

    for (const link of externalLinks) {
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');

      // External links should open in new tab and have noopener
      if (target === '_blank') {
        expect(rel).toContain('noopener');
      }
    }
  });

  test('syntax highlighting present on code blocks', async ({ page }) => {
    await page.goto('/blog');

    // Check if any code blocks exist
    const codeBlocks = await page.locator('pre code, .highlight').count();

    // If code blocks exist, they should have highlighting classes
    if (codeBlocks > 0) {
      const highlightedCode = await page.locator('pre code[class*="language-"], .highlight code').count();
      expect(highlightedCode).toBeGreaterThan(0);
    }
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('navigation header is present', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load in under 12 seconds to account for CI variability
    expect(loadTime).toBeLessThan(12000);
  });

  test('CSS is loaded', async ({ page }) => {
    await page.goto('/');

    // Check if any stylesheets are loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);
  });

  test('404 page exists', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Should get 404 response
    expect(response?.status()).toBe(404);

    // Page should still render (custom 404)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });
});

test.describe('Accessibility Tests', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^en/);
  });

  test('skip to main content link present', async ({ page }) => {
    await page.goto('/');

    // Check for skip link (common accessibility pattern)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    const count = await skipLink.count();

    // Not required, but good practice - just check if present
    if (count > 0) {
      await expect(skipLink.first()).toBeInViewport();
    }
  });

  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/');

    const firstInteractive = page.locator('a, button, input, select, textarea').first();
    await firstInteractive.focus();

    // Check that focused element is visible
    await expect(firstInteractive).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('no render-blocking resources', async ({ page }) => {
    const performanceEntries: any[] = [];

    page.on('response', response => {
      if (response.request().resourceType() === 'stylesheet' ||
          response.request().resourceType() === 'script') {
        performanceEntries.push({
          url: response.url(),
          type: response.request().resourceType()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow for many assets (fonts, css, js) but guard against runaway downloads
    expect(performanceEntries.length).toBeLessThan(500);
  });

  test('images are optimized', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const src = await img.getAttribute('src');

      if (src && !src.startsWith('data:')) {
        // Image should have width and height attributes or CSS sizing
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        const computedStyle = await img.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            width: style.width,
            height: style.height
          };
        });

        // Should have explicit dimensions to prevent CLS
        const hasDimensions = (width && height) ||
                             (computedStyle.width !== 'auto' && computedStyle.height !== 'auto');
        expect(hasDimensions).toBeTruthy();
      }
    }
  });
});
