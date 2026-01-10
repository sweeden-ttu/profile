import { test, expect } from '@playwright/test';

test.describe('Math rendering page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math-rules/');
  });

  test('renders inline variables and fonts', async ({ page }) => {
    const inlineVars = page.locator('[data-test-id="inline-vars"] .katex');
    expect(await inlineVars.count()).toBeGreaterThan(6);
  });

  test('renders multiplication, logs, trig', async ({ page }) => {
    const section = page.locator('[data-test-id="multiplication"] .katex');
    expect(await section.count()).toBeGreaterThan(3);
    await expect(section.filter({ hasText: '⋅' }).first()).toBeVisible();
    await expect(section.filter({ hasText: '×' }).first()).toBeVisible();
    await expect(section.filter({ hasText: 'log' }).first()).toBeVisible();
  });

  test('renders fractions and percent', async ({ page }) => {
    const fraction = page.locator('[data-test-id="fraction"] .katex');
    expect(await fraction.count()).toBeGreaterThan(0);
    await expect(fraction.filter({ hasText: '100' }).first()).toBeVisible();
  });

  test('renders floor, ceil, abs, factorial', async ({ page }) => {
    const section = page.locator('[data-test-id="floor-ceil-abs"] .katex');
    expect(await section.count()).toBeGreaterThan(3);
    await expect(section.filter({ hasText: '⌊' }).first()).toBeVisible();
    await expect(section.filter({ hasText: '⌈' }).first()).toBeVisible();
    await expect(section.filter({ hasText: '!' }).first()).toBeVisible();
  });

  test('renders sets and binomial', async ({ page }) => {
    const sets = page.locator('[data-test-id="sets"] .katex');
    expect(await sets.count()).toBeGreaterThan(3);
    await expect(sets.filter({ hasText: '{1' }).first()).toBeVisible();
    await expect(sets.filter({ hasText: '5' }).first()).toBeVisible();
  });

  test('renders display equations', async ({ page }) => {
    const displayEq = page.locator('[data-test-id="display-equation"] .katex-display');
    await expect(displayEq).toHaveCount(1);
    await expect(displayEq.first()).toContainText('2x');

    const envEq = page.locator('[data-test-id="equation-environment"] .katex-display');
    expect(await envEq.count()).toBeGreaterThan(0);
    await expect(envEq.first()).toContainText('⌈');
  });

  test('renders overline and sequences', async ({ page }) => {
    const overline = page.locator('[data-test-id="overline"] .katex');
    expect(await overline.count()).toBeGreaterThan(2);
    await expect(overline.filter({ hasText: '12' }).first()).toBeVisible();
  });

  test('renders power towers and binomial edge cases', async ({ page }) => {
    const tower = page.locator('[data-test-id="power-tower"] .katex');
    await expect(tower.first()).toContainText('512');

    const binomialZero = page.locator('[data-test-id="binomial-zero"] .katex');
    await expect(binomialZero.filter({ hasText: '0' }).first()).toBeVisible();
    await expect(binomialZero.filter({ hasText: '1' }).first()).toBeVisible();
  });
});
