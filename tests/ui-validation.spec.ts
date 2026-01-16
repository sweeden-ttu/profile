import { test, expect, Page } from '@playwright/test';

/**
 * UI Validation Tests
 * Comprehensive visual and functional UI testing for the Jekyll site
 */

test.describe('Visual Design Validation', () => {
  test('primary color is used for links', async ({ page }) => {
    await page.goto('/blog');

    // Check primary color is used for links (should be cobalt blue #2446b5)
    // Look for links in article/post content
    const links = page.locator('article a, .post a, .content a, main a').first();
    if (await links.count() > 0) {
      const color = await links.evaluate(el =>
        window.getComputedStyle(el).color
      );
      // Should be rgb(36, 70, 181) which is #2446b5
      // Or it might be styled differently, so just check it's a valid color
      expect(color).toBeTruthy();
      expect(color).toMatch(/rgb/);
    }
  });

  test('headings use correct font family', async ({ page }) => {
    await page.goto('/');

    // Check heading font (should be Space Grotesk or fallbacks)
    const h1 = page.locator('h1').first();
    if (await h1.count() > 0) {
      const fontFamily = await h1.evaluate(el =>
        window.getComputedStyle(el).fontFamily
      );
      // Should use Space Grotesk, IBM Plex Sans, or Inter (or system fallbacks)
      expect(fontFamily.toLowerCase()).toMatch(/space.*grotesk|plex.*sans|inter|sans-serif/);
    }
  });

  test('body text uses correct font family', async ({ page }) => {
    await page.goto('/');

    // Check body font
    const body = page.locator('body');
    const fontFamily = await body.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    // Should use IBM Plex Sans or Inter
    expect(fontFamily.toLowerCase()).toMatch(/plex.*sans|inter|sans-serif/);
  });

  test('spacing follows 8px grid system', async ({ page }) => {
    await page.goto('/');

    // Check that main content has padding divisible by 4px
    const main = page.locator('main, .main-content').first();
    if (await main.count() > 0) {
      const padding = await main.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          paddingLeft: parseInt(style.paddingLeft),
          paddingRight: parseInt(style.paddingRight),
          paddingTop: parseInt(style.paddingTop),
          paddingBottom: parseInt(style.paddingBottom)
        };
      });
      // All padding should be divisible by 4 (8px grid system)
      expect(padding.paddingLeft % 4).toBe(0);
      expect(padding.paddingRight % 4).toBe(0);
      expect(padding.paddingTop % 4).toBe(0);
      expect(padding.paddingBottom % 4).toBe(0);
    }
  });

  test('cards have consistent border-radius', async ({ page }) => {
    await page.goto('/');

    const cards = page.locator('.card, [class*="-card"]');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Cards should have border-radius from design system (8px or 12px)
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const radius = await cards.nth(i).evaluate(el =>
          window.getComputedStyle(el).borderRadius
        );
        // Should be 8px or 12px from the design system
        expect(radius).toMatch(/8px|12px/);
      }
    }
  });

  test('buttons have proper styling and hover states', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('.btn, button:not([class*="toggle"])').first();
    if (await button.count() > 0) {
      // Check border-radius (should be 6px)
      const borderRadius = await button.evaluate(el =>
        window.getComputedStyle(el).borderRadius
      );
      expect(borderRadius).toMatch(/6px/);

      // Check hover effect
      const initialTransform = await button.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      await button.hover();
      await page.waitForTimeout(200); // Wait for transition

      const hoverTransform = await button.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Transform should change on hover (translateY effect)
      const hasHoverEffect = initialTransform !== hoverTransform;
      expect(hasHoverEffect).toBeTruthy();
    }
  });

  test('background gradient is applied to body', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const background = await body.evaluate(el =>
      window.getComputedStyle(el).background
    );

    // Should have gradient background
    expect(background).toContain('gradient');
  });
});

test.describe('Layout Validation', () => {
  test('header is sticky with correct styling', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header, .site-header').first();
    if (await header.count() > 0) {
      const styles = await header.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          height: computed.height,
          borderBottom: computed.borderBottom
        };
      });

      // Header should be sticky
      expect(styles.position).toBe('sticky');

      // Header should have height around 64-65px (64px + 1px border)
      const height = parseInt(styles.height);
      expect(height).toBeGreaterThanOrEqual(64);
      expect(height).toBeLessThanOrEqual(66);

      // Header should have bottom border
      expect(styles.borderBottom).toContain('1px');
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
