import { test, expect, Page } from '@playwright/test';

/**
 * UI Validation — smoke suite for the redesigned site.
 *
 * Intentionally NOT bound to specific design tokens (font names, colors,
 * border-radii). The previous version of this file asserted Space Grotesk,
 * IBM Plex Sans, #2446b5, 8/12px radii — all of which have changed and will
 * change again. Instead, we test invariants:
 *   - Structural elements exist and are reachable
 *   - Interactions work (mobile toggle, focus, links)
 *   - Required content is present (KaTeX renders math, code highlighting fires)
 *   - Accessibility primitives are wired (skip link, lang, focus-visible)
 *
 * If a future redesign reshapes the markup, update the selectors here. The
 * assertions themselves should remain meaningful.
 */

const expectVisible = (page: Page, selector: string) =>
  expect(page.locator(selector).first()).toBeVisible({ timeout: 7000 });

test.describe('Page shell', () => {
  test('homepage renders the site shell', async ({ page }) => {
    await page.goto('/');
    await expectVisible(page, '.site-header');
    await expectVisible(page, '.site-mark');
    await expectVisible(page, 'main#main');
    await expectVisible(page, '.site-footer');
  });

  test('site-mark links home', async ({ page }) => {
    await page.goto('/about/');
    await page.locator('.site-mark').click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('main landmark exists for skip-link target', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main');
    await expect(main).toHaveAttribute('role', 'main');
  });
});

test.describe('Navigation', () => {
  test('desktop nav surfaces all primary links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const nav = page.locator('.site-nav');
    await expect(nav).toBeVisible();
    for (const label of ['Writing', 'Projects', 'Courses', 'Research', 'About']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('mobile toggle reveals navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /toggle navigation/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.mobile-nav')).toHaveClass(/is-open/);
  });

  test('current-page indicator is set', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/blog/');
    const current = page.locator('.site-nav a[aria-current="page"]');
    await expect(current).toHaveText('Writing');
  });
});

test.describe('Writing index', () => {
  test('post list groups by year and renders entries', async ({ page }) => {
    await page.goto('/blog/');
    // At least one year section
    expect(await page.locator('.section-rule').count()).toBeGreaterThan(0);
    // At least one post
    expect(await page.locator('.post-list__item').count()).toBeGreaterThan(0);
    // Each item has a date and title
    const item = page.locator('.post-list__item').first();
    await expect(item.locator('.post-list__date')).toBeVisible();
    await expect(item.locator('.post-list__title a')).toBeVisible();
  });
});

test.describe('Article rendering', () => {
  // Pick a post known to use display + inline math (kramdown-math-katex)
  const postWithMath = '/blog/2025/01/08/understanding-masters-theorem/';

  test('post header shows back-link, title, and meta', async ({ page }) => {
    await page.goto(postWithMath);
    await expect(page.locator('.page-header__eyebrow')).toBeVisible();
    await expect(page.locator('.page-header__title')).toBeVisible();
    await expect(page.locator('.page-header__meta')).toBeVisible();
  });

  test('KaTeX renders inline and display math', async ({ page }) => {
    await page.goto(postWithMath);
    // Allow client-side auto-render to fire
    await page.waitForFunction(() => document.querySelectorAll('.katex').length > 0, null, { timeout: 10000 });
    expect(await page.locator('.katex').count()).toBeGreaterThan(5);
    expect(await page.locator('.katex-display').count()).toBeGreaterThan(0);
  });

  test('duplicate first-H1 inside post body is hidden', async ({ page }) => {
    // Posts often start with `# Title` matching frontmatter; CSS hides the
    // duplicate so the title only shows once in .page-header.
    await page.goto(postWithMath);
    const firstH1 = page.locator('.page-header + .prose > h1').first();
    if (await firstH1.count() > 0) {
      const display = await firstH1.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe('none');
    }
  });
});

test.describe('Code highlighting', () => {
  // Pin to a post known to contain fenced code blocks. Iterating the most
  // recent posts is unreliable: weeks of math-only cryptography posts ship
  // without any code, which previously caused this test to flap.
  const postWithCode = '/blog/2025/12/18/symbolic-execution-klee/';

  test('highlighted code blocks render with rouge classes', async ({ page }) => {
    await page.goto(postWithCode);
    // Rouge wraps fenced blocks in .highlight > pre.highlight > code.language-*
    expect(await page.locator('.highlight').count()).toBeGreaterThan(0);
    expect(await page.locator('pre.highlight').count()).toBeGreaterThan(0);
  });
});

test.describe('Theme + responsive behavior', () => {
  test('dark mode tokens cascade through the page', async ({ page, browserName }) => {
    // Skip on browsers that don't support emulateMedia consistently in this config
    test.skip(browserName === 'webkit', 'webkit handles emulateMedia differently in some configs');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const bg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
    // Dark cream paper sits in the very-dark range; just assert it's not the
    // light cream background. Compare lightness via simple parse.
    const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(m).not.toBeNull();
    if (m) {
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const luminance = (r + g + b) / 3;
      expect(luminance).toBeLessThan(60); // clearly dark
    }
  });

  test('layout reflows at mobile widths without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    // Allow a tiny rounding tolerance
    expect(overflow.scrollWidth - overflow.clientWidth).toBeLessThanOrEqual(2);
  });
});

test.describe('Accessibility primitives', () => {
  test('skip link is the first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el ? { tag: el.tagName, text: el.textContent?.trim(), klass: el.className } : null;
    });
    expect(focused).not.toBeNull();
    expect(focused?.tag).toBe('A');
    expect(focused?.klass).toContain('skip-link');
  });

  test('html has lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toMatch(/^en/);
  });

  test('all images have alt attributes (empty allowed for decorative)', async ({ page }) => {
    await page.goto('/');
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
