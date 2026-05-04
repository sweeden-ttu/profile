import { test, expect } from '@playwright/test';

/**
 * Verifies KaTeX auto-render works on assignment "problems/questions" pages.
 * We check:
 * - at least some KaTeX output is present
 * - no KaTeX render errors are present
 * - capture a screenshot for manual review
 */
test.describe('Assignments - math rendering', () => {
  const cases: Array<{ name: string; path: string; minKatexCount: number; screenshot: string }> = [
    {
      name: 'Intelligent Systems - Assignment 3 (problems)',
      path: '/assignments/intelligent-systems/assignment3/intelligent-systems-assignment3-problems/',
      minKatexCount: 10,
      screenshot: 'analysis_output/assignments-intelligent-systems-assignment3-problems.png',
    },
    {
      name: 'Intelligent Systems - Assignment 4 (problems)',
      path: '/assignments/intelligent-systems/assignment4/intelligent-systems-assignment4-problems/',
      minKatexCount: 10,
      screenshot: 'analysis_output/assignments-intelligent-systems-assignment4-problems.png',
    },
    {
      name: 'Logic for Computer Scientists - Homework 3 (problems)',
      path: '/assignments/logic-for-computer-scientists/homework3/logic-homework3/',
      minKatexCount: 5,
      screenshot: 'analysis_output/assignments-logic-homework3-problems.png',
    },
  ];

  for (const c of cases) {
    test(c.name, async ({ page }) => {
      await page.goto(c.path);

      // Wait for the KaTeX auto-render to run.
      await page.waitForTimeout(250);

      const katex = page.locator('.katex');
      const katexErrors = page.locator('.katex-error');

      expect(await katex.count()).toBeGreaterThanOrEqual(c.minKatexCount);
      await expect(katexErrors).toHaveCount(0);

      await page.screenshot({ path: c.screenshot, fullPage: true });
    });
  }
});
