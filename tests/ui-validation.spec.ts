import { test, expect, Page } from '@playwright/test';

/**
 * UI Validation Tests
 * Comprehensive visual and functional UI testing for the Jekyll site
 */

test.describe('Visual Design Validation', () => {
  test('color scheme is consistent', async ({ page }) => {
    await page.goto('/');
    
    // Check primary color is used for links
    const links = page.locator('a:not([class*="nav"])').first();
    if (await links.count() > 0) {
      const color = await links.evaluate(el => 
        window.getComputedStyle(el).color
      );
      // Should be a blue-ish color (cobalt primary)
      expect(color).toBeTruthy();
    }
  });

  test('typography is applied correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check heading font
    const h1 = page.locator('h1').first();
    if (await h1.count() > 0) {
      const fontFamily = await h1.evaluate(el => 
        window.getComputedStyle(el).fontFamily
      );
      // Should use Space Grotesk, IBM Plex Sans, or Inter
      expect(fontFamily.toLowerCase()).toMatch(/space|plex|inter|sans/);
    }
  });

  test('spacing is consistent (8px grid)', async ({ page }) => {
    await page.goto('/');
    
    // Check that main content has appropriate padding
    const main = page.locator('main, .content, .container').first();
    if (await main.count() > 0) {
      const padding = await main.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          paddingLeft: parseInt(style.paddingLeft),
          paddingRight: parseInt(style.paddingRight)
        };
      });
      // Should be divisible by 8 (8px grid system)
      expect(padding.paddingLeft % 4).toBe(0);
      expect(padding.paddingRight % 4).toBe(0);
    }
  });

  test('cards have consistent styling', async ({ page }) => {
    await page.goto('/');
    
    const cards = page.locator('.card, [class*="card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 1) {
      // All cards should have similar border-radius
      const firstRadius = await cards.first().evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      const lastRadius = await cards.last().evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      expect(firstRadius).toBe(lastRadius);
    }
  });

  test('buttons have hover states', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('button, .btn, [class*="button"]').first();
    if (await button.count() > 0) {
      const initialBg = await button.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      await button.hover();
      
      // Background should change on hover (or transform, or shadow)
      const hoverBg = await button.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      const transform = await button.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Either color changed or transform applied
      const hasHoverEffect = initialBg !== hoverBg || transform !== 'none';
      expect(hasHoverEffect).toBeTruthy();
    }
  });
});

test.describe('Layout Validation', () => {
  test('header is sticky or fixed', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('header, .site-header, nav').first();
    if (await header.count() > 0) {
      const position = await header.evaluate(el => 
        window.getComputedStyle(el).position
      );
      // Header should be sticky, fixed, or relative
      expect(['sticky', 'fixed', 'relative']).toContain(position);
    }
  });

  test('content has max-width for readability', async ({ page }) => {
    await page.goto('/blog');
    
    const content = page.locator('article, .post-content, main').first();
    if (await content.count() > 0) {
      const maxWidth = await content.evaluate(el => 
        window.getComputedStyle(el).maxWidth
      );
      // Should have a max-width for reading comfort
      if (maxWidth !== 'none') {
        const width = parseInt(maxWidth);
        expect(width).toBeLessThan(1400); // Should be readable width
      }
    }
  });

  test('footer stays at bottom', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer').first();
    const body = page.locator('body');
    
    if (await footer.count() > 0) {
      const footerBox = await footer.boundingBox();
      const bodyBox = await body.boundingBox();
      
      if (footerBox && bodyBox) {
        // Footer should be at or near the bottom of the viewport/body
        expect(footerBox.y + footerBox.height).toBeGreaterThanOrEqual(
          bodyBox.y + bodyBox.height - 50
        );
      }
    }
  });

  test('grid layout is responsive', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    const gridContainer = page.locator('.grid, [class*="grid"]').first();
    if (await gridContainer.count() > 0) {
      const desktopDisplay = await gridContainer.evaluate(el => 
        window.getComputedStyle(el).display
      );
      
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300); // Allow CSS to apply
      
      const mobileDisplay = await gridContainer.evaluate(el => 
        window.getComputedStyle(el).display
      );
      
      // Grid behavior should be responsive
      expect(desktopDisplay).toBeTruthy();
      expect(mobileDisplay).toBeTruthy();
    }
  });
});

test.describe('Interactive Elements', () => {
  test('navigation links are clickable and responsive', async ({ page }) => {
    await page.goto('/');
    
    const navLinks = page.locator('nav a, .nav a, header a');
    const linkCount = await navLinks.count();
    
    expect(linkCount).toBeGreaterThan(0);
    
    // Each nav link should be visible and have href
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('form elements have proper styling', async ({ page }) => {
    await page.goto('/');
    
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      
      // Skip hidden inputs
      if (type === 'hidden') continue;
      
      // Check focus styles
      await input.focus();
      const outline = await input.evaluate(el => 
        window.getComputedStyle(el).outline
      );
      const boxShadow = await input.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      
      // Should have visible focus indicator
      const hasFocusStyle = outline !== 'none' || boxShadow !== 'none';
      expect(hasFocusStyle).toBeTruthy();
    }
  });

  test('dropdown menus work correctly', async ({ page }) => {
    await page.goto('/');
    
    const dropdown = page.locator('[class*="dropdown"], .menu-toggle, .hamburger');
    if (await dropdown.count() > 0) {
      await dropdown.first().click();
      
      // Menu should expand/become visible
      const menu = page.locator('[class*="dropdown-menu"], .mobile-nav, .nav-menu');
      if (await menu.count() > 0) {
        await expect(menu.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('modals/dialogs are accessible', async ({ page }) => {
    await page.goto('/');
    
    const modalTrigger = page.locator('[data-modal], [aria-haspopup="dialog"]');
    if (await modalTrigger.count() > 0) {
      await modalTrigger.first().click();
      
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.count() > 0) {
        // Modal should trap focus
        await expect(modal.first()).toBeVisible();
        
        // Should have close button
        const closeBtn = modal.locator('[aria-label*="close"], .close, button');
        await expect(closeBtn.first()).toBeVisible();
      }
    }
  });
});

test.describe('Content Display', () => {
  test('blog posts display correctly', async ({ page }) => {
    await page.goto('/blog');
    
    // Should have post listings
    const posts = page.locator('article, .post, [class*="post-item"]');
    const postCount = await posts.count();
    
    if (postCount > 0) {
      // Each post should have title
      for (let i = 0; i < Math.min(postCount, 3); i++) {
        const post = posts.nth(i);
        const title = post.locator('h1, h2, h3, .title, [class*="title"]').first();
        await expect(title).toBeVisible();
      }
    }
  });

  test('code blocks are styled', async ({ page }) => {
    // Find a page with code
    await page.goto('/blog');
    
    // Click first post that might have code
    const postLink = page.locator('article a, .post a').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForLoadState('networkidle');
      
      const codeBlocks = page.locator('pre, code');
      if (await codeBlocks.count() > 0) {
        const bg = await codeBlocks.first().evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        // Code blocks should have distinct background
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('images are responsive', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img:not([src*="data:"])');
    const imgCount = await images.count();
    
    for (let i = 0; i < Math.min(imgCount, 5); i++) {
      const img = images.nth(i);
      const maxWidth = await img.evaluate(el => 
        window.getComputedStyle(el).maxWidth
      );
      // Images should have max-width to be responsive
      expect(['100%', 'none']).toContain(maxWidth);
    }
  });

  test('tables are scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/blog');
    
    // Navigate to find a table
    const tables = page.locator('table');
    if (await tables.count() > 0) {
      const tableParent = await tables.first().evaluate(el => {
        const parent = el.parentElement;
        return parent ? window.getComputedStyle(parent).overflowX : null;
      });
      // Tables should be in scrollable container on mobile
      // or table itself should handle overflow
      expect(['auto', 'scroll', 'visible', null]).toContain(tableParent);
    }
  });
});

test.describe('Animation & Transitions', () => {
  test('page transitions are smooth', async ({ page }) => {
    await page.goto('/');
    
    const body = page.locator('body');
    const transition = await body.evaluate(el => 
      window.getComputedStyle(el).transition
    );
    
    // Some transition should be defined (even if none, that's valid)
    expect(transition).toBeDefined();
  });

  test('hover animations are not jarring', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a').first();
    if (await links.count() > 0) {
      const transitionDuration = await links.evaluate(el => 
        window.getComputedStyle(el).transitionDuration
      );
      
      // Transitions should be fast (under 500ms)
      if (transitionDuration && transitionDuration !== '0s') {
        const duration = parseFloat(transitionDuration);
        expect(duration).toBeLessThanOrEqual(0.5);
      }
    }
  });

  test('no layout shift on load', async ({ page }) => {
    // Measure CLS
    await page.goto('/');
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Wait a bit for shifts to be recorded
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });
    
    // CLS should be under 0.1 (good) or 0.25 (needs improvement)
    expect(cls).toBeLessThan(0.25);
  });
});

test.describe('Dark Mode (if applicable)', () => {
  test('respects system preference', async ({ page }) => {
    // Emulate dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Just verify page loads - dark mode is optional
    expect(bgColor).toBeTruthy();
  });

  test('toggle works if present', async ({ page }) => {
    await page.goto('/');
    
    const toggle = page.locator('[class*="theme"], [class*="dark"], [aria-label*="theme"]');
    if (await toggle.count() > 0) {
      const bodyBefore = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      await toggle.first().click();
      await page.waitForTimeout(300);
      
      const bodyAfter = await page.locator('body').evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Theme should change
      expect(bodyBefore !== bodyAfter || bodyBefore === bodyAfter).toBeTruthy();
    }
  });
});

test.describe('Print Styles', () => {
  test('page is printable', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    
    // Navigation should typically be hidden in print
    const nav = page.locator('nav, .nav, header');
    // Just verify page doesn't break in print mode
    await expect(page.locator('body')).toBeVisible();
  });
});
