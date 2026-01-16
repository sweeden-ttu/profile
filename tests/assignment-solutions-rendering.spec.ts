import { test, expect } from '@playwright/test';

/**
 * Assignment Solutions Rendering Test
 *
 * Tests that the homework solutions page:
 * - Renders KaTeX math properly
 * - Renders Mermaid diagrams properly
 * - Has print-friendly styling (no color backgrounds)
 * - All content is accessible
 */

const SOLUTIONS_URL = '/assignments/intelligent-systems/assignment4/intelligent-systems-assignment4-solutions/';

test.describe('Assignment Solutions Page', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Check title
    const title = await page.locator('h1').first().textContent();
    expect(title).toContain('Assignment 4');
  });

  test('KaTeX math is rendered', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Wait for KaTeX to load
    await page.waitForTimeout(1000);

    // Check for KaTeX rendered elements
    const katexElements = page.locator('.katex, .katex-display');
    const count = await katexElements.count();

    console.log(`Found ${count} KaTeX rendered elements`);
    expect(count).toBeGreaterThan(0);

    // Check that math is visible
    const firstMath = katexElements.first();
    await expect(firstMath).toBeVisible();
  });

  test('Mermaid diagrams are rendered', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Wait for Mermaid to load
    await page.waitForTimeout(2000);

    // Check for Mermaid SVG elements
    const mermaidDiagrams = page.locator('pre.mermaid svg, .mermaid svg');
    const count = await mermaidDiagrams.count();

    console.log(`Found ${count} Mermaid diagrams`);
    expect(count).toBeGreaterThan(0);

    // Check first diagram is visible
    const firstDiagram = mermaidDiagrams.first();
    await expect(firstDiagram).toBeVisible();
  });

  test('no colored answer boxes (print-friendly)', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Check that there are no divs with inline background colors
    const coloredDivs = page.locator('div[style*="background"]');
    const count = await coloredDivs.count();

    console.log(`Found ${count} divs with background colors`);
    expect(count).toBe(0);
  });

  test('answers are clearly marked', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Check for ANSWER: markers
    const content = await page.content();
    expect(content).toContain('ANSWER:');
    expect(content).toContain('QUESTION:');
  });

  test('page is printable', async ({ page }) => {
    await page.goto(SOLUTIONS_URL);

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Check main content is visible in print
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check math is still visible
    const katex = page.locator('.katex').first();
    if (await katex.count() > 0) {
      await expect(katex).toBeVisible();
    }
  });
});
