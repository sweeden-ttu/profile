import { test, expect } from '@playwright/test';

test.describe('Formula appendix page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/formula-appendix/');
  });

  test('loads and renders KaTeX without error spans', async ({ page }) => {
    const title = page.getByRole('heading', { name: 'Formula appendix', exact: true });
    await expect(title).toBeVisible();
    const errors = page.locator('.katex-error');
    expect(await errors.count()).toBe(0);
    const katex = page.locator('.katex');
    expect(await katex.count()).toBeGreaterThan(10);
  });

  test('serves JSON inventory asset', async ({ request }) => {
    const res = await request.get('/assets/formula_inventory.json');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.counts).toBeDefined();
    expect(Array.isArray(json.records)).toBeTruthy();
  });
});
