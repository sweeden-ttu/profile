import { test, expect } from '@playwright/test';
import { LinkChecker, LinkState } from 'linkinator';

/**
 * Broken Link Checker
 *
 * Uses linkinator to crawl the entire site and detect:
 * - Broken internal links (404s, 500s, etc.)
 * - Broken external links (when accessible)
 * - Redirect chains
 * - Invalid URLs
 *
 * This complements the backwards-link-checker which ensures
 * content is linked, while this ensures links actually work.
 */

// Configuration
const BASE_URL = 'http://localhost:4000';
const TIMEOUT = 10000; // 10 seconds per link
const MAX_RETRIES = 2;

// External domains to skip (rate limits, auth walls, etc.)
const SKIP_DOMAINS = [
  // Social media (aggressive rate limiting)
  'linkedin.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',

  // Code hosting (may require auth)
  'github.com/login',
  'gitlab.com/users/sign_in',

  // Other problematic domains
  'example.com',
  'localhost',
  '127.0.0.1',
];

// Patterns to skip
const SKIP_PATTERNS = [
  // Authentication/login pages
  /\/login/i,
  /\/signin/i,
  /\/auth/i,

  // External CDNs (usually reliable)
  /cdn\.jsdelivr\.net/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,

  // Analytics
  /google-analytics\.com/,
  /googletagmanager\.com/,

  // Linkinator follows literal substrings inside PDFs and other static files
  // (e.g. PDFs that mention "research.md" or "about.md" in their text). These
  // are not real anchors — Jekyll renders Markdown to .html, so any URL ending
  // in .md or .docx under /data/ is a false positive from PDF text-extraction.
  /\.md$/i,
  /\.docx$/i,
  /\/data\/.+\.(md|docx|txt)$/i,
];

interface BrokenLinkReport {
  url: string;
  status: number | undefined;
  state: LinkState;
  parent: string;
}

test.describe('Broken Link Detection', () => {
  test('check all links on the site', async () => {
    console.log(`\n🔍 Starting link check on ${BASE_URL}...\n`);

    const checker = new LinkChecker();

    const result = await checker.check({
      path: BASE_URL,
      recurse: true,
      timeout: TIMEOUT,
      retry: true,
      retryErrors: true,
      retryErrorsCount: MAX_RETRIES,
      linksToSkip: (url: string) => {
        // Skip domains
        if (SKIP_DOMAINS.some(domain => url.includes(domain))) {
          return true;
        }

        // Skip patterns
        if (SKIP_PATTERNS.some(pattern => pattern.test(url))) {
          return true;
        }

        return false;
      },
    });

    // Categorize results
    const passed = result.links.filter(l => l.state === LinkState.OK);
    const broken = result.links.filter(l => l.state === LinkState.BROKEN);
    const skipped = result.links.filter(l => l.state === LinkState.SKIPPED);
    const redirected = result.links.filter(l =>
      l.status && l.status >= 300 && l.status < 400
    );

    // Generate report
    console.log('='.repeat(60));
    console.log('LINK CHECK SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total links checked: ${result.links.length}`);
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Broken: ${broken.length}`);
    console.log(`⏭️  Skipped: ${skipped.length}`);
    console.log(`🔄 Redirected: ${redirected.length}`);
    console.log('='.repeat(60));

    // Report broken links
    if (broken.length > 0) {
      console.log('\n❌ BROKEN LINKS FOUND:\n');

      // Group by status code
      const byStatus = new Map<number | undefined, BrokenLinkReport[]>();

      broken.forEach(link => {
        const status = link.status;
        if (!byStatus.has(status)) {
          byStatus.set(status, []);
        }
        byStatus.get(status)!.push({
          url: link.url,
          status: link.status,
          state: link.state,
          parent: link.parent || 'unknown',
        });
      });

      // Sort by status code
      const sortedStatuses = Array.from(byStatus.keys()).sort((a, b) => {
        if (a === undefined) return 1;
        if (b === undefined) return -1;
        return a - b;
      });

      sortedStatuses.forEach(status => {
        const links = byStatus.get(status)!;
        const statusText = status
          ? `${status} ${getStatusText(status)}`
          : 'Network Error';

        console.log(`\n[${statusText}] - ${links.length} link(s):`);
        links.forEach(link => {
          console.log(`  ❌ ${link.url}`);
          console.log(`     Found on: ${link.parent}`);
        });
      });
      console.log('');
    }

    // Report redirects (informational only)
    if (redirected.length > 0) {
      console.log('\n🔄 REDIRECTED LINKS (review recommended):\n');
      redirected.slice(0, 10).forEach(link => {
        console.log(`  ${link.url} → ${link.status}`);
        console.log(`     Found on: ${link.parent}`);
      });
      if (redirected.length > 10) {
        console.log(`\n  ... and ${redirected.length - 10} more redirects`);
      }
      console.log('');
    }

    // Report skipped (for transparency)
    if (skipped.length > 0) {
      console.log(`\n⏭️  SKIPPED LINKS: ${skipped.length} (social media, CDNs, etc.)\n`);
    }

    // Final assessment
    console.log('='.repeat(60));
    if (broken.length === 0) {
      console.log('✅ All checked links are working!');
    } else {
      console.log(`⚠️  Found ${broken.length} broken link(s) - please review above`);
    }
    console.log('='.repeat(60));
    console.log('');

    // Fail test if broken links found
    expect(broken.length).toBe(0);
  });

  test('internal links only', async () => {
    console.log(`\n🔍 Checking internal links only...\n`);

    const checker = new LinkChecker();

    const result = await checker.check({
      path: BASE_URL,
      recurse: true,
      timeout: TIMEOUT,
      retry: true,
      retryErrors: true,
      retryErrorsCount: MAX_RETRIES,
      linksToSkip: (url: string) => {
        // Skip external links entirely
        const isExternal = url.startsWith('http') &&
          !url.includes('localhost') &&
          !url.includes('127.0.0.1');

        if (isExternal) return true;

        // Skip patterns
        if (SKIP_PATTERNS.some(pattern => pattern.test(url))) {
          return true;
        }

        return false;
      },
    });

    const broken = result.links.filter(l => l.state === LinkState.BROKEN);
    const checked = result.links.filter(l => l.state !== LinkState.SKIPPED);

    console.log(`Checked ${checked.length} internal links`);
    console.log(`Broken: ${broken.length}`);

    if (broken.length > 0) {
      console.log('\n❌ BROKEN INTERNAL LINKS:\n');
      broken.forEach(link => {
        console.log(`  ${link.url} (${link.status})`);
        console.log(`     Found on: ${link.parent}`);
      });
      console.log('');
    }

    // Internal links should NEVER be broken
    expect(broken.length).toBe(0);
  });
});

// Helper function to get human-readable status text
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    410: 'Gone',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return statusTexts[status] || 'Unknown Error';
}
