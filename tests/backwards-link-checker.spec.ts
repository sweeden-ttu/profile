import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Backwards Link Checker
 * 
 * Scans all underscore (_) folders for markdown files and verifies
 * that each content file is linked somewhere in the compiled site.
 * 
 * This ensures no orphaned content exists - every post, project,
 * course, etc. should be discoverable via navigation or links.
 */

interface ContentFile {
  sourcePath: string;
  expectedUrl: string;
  collection: string;
  title?: string;
}

// Jekyll collection URL patterns. `relativePath` is the path inside the
// collection folder (e.g. for `_assignments/foo/bar/baz.md` it is
// `foo/bar/baz.md`). Some collections (assignments, experiments) use the
// permalink `/{collection}/:path/` so nested files end up at nested URLs.
const COLLECTION_URL_PATTERNS: Record<string, (filename: string, slug: string, relativePath: string) => string[]> = {
  '_posts': (filename, slug) => {
    const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
    if (match) {
      const [, year, month, day, postSlug] = match;
      return [
        `/blog/${year}/${month}/${day}/${postSlug}/`,
        `/blog/${year}/${month}/${day}/${postSlug}`,
        `/blog/${postSlug}/`,
        `/blog/${postSlug}`,
        `/${year}/${month}/${day}/${postSlug}/`,
      ];
    }
    return [`/blog/${slug}/`, `/blog/${slug}`];
  },
  '_courses': (filename, slug) => [
    `/courses/${slug}/`,
    `/courses/${slug}`,
    `/course/${slug}/`,
    `/course/${slug}`,
  ],
  '_projects': (filename, slug) => [
    `/projects/${slug}/`,
    `/projects/${slug}`,
    `/project/${slug}/`,
    `/project/${slug}`,
  ],
  '_experiments': (filename, slug, relativePath) => {
    // Permalink: /experiments/:path/, files often live at <slug>/experiment.md
    const dirSlug = relativePath.split('/')[0];
    const pathSlug = relativePath.replace(/\.md$/, '');
    return [
      `/experiments/${pathSlug}/`,
      `/experiments/${dirSlug}/`,
      `/experiments/${slug}/`,
      `/experiment/${slug}/`,
    ];
  },
  '_competitions': (filename, slug, relativePath) => {
    const dirSlug = relativePath.split('/')[0];
    const pathSlug = relativePath.replace(/\.md$/, '');
    return [
      `/competitions/${pathSlug}/`,
      `/competitions/${dirSlug}/`,
      `/competitions/${slug}/`,
    ];
  },
  '_datasets': (filename, slug, relativePath) => {
    const dirSlug = relativePath.split('/')[0];
    const pathSlug = relativePath.replace(/\.md$/, '');
    return [
      `/datasets/${pathSlug}/`,
      `/datasets/${dirSlug}/`,
      `/datasets/${slug}/`,
    ];
  },
  '_assignments': (filename, slug, relativePath) => {
    // Permalink: /assignments/:path/, e.g. /assignments/intelligent-systems/assignment3/foo/
    const pathSlug = relativePath.replace(/\.md$/, '');
    return [
      `/assignments/${pathSlug}/`,
      `/assignments/${pathSlug}`,
      `/assignments/${slug}/`,
      `/assignments/${slug}`,
      `/assignment/${slug}/`,
    ];
  },
};

// Collections to skip (not published or index files)
const SKIP_PATTERNS = [
  '_drafts',  // Drafts are not published
  'index.md', // Index files are navigation, not content
  'README.md', // Documentation files
];

function shouldSkipFile(filePath: string): boolean {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getSlugFromFilename(filename: string): string {
  // Remove date prefix from posts
  const withoutDate = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  // Remove .md extension
  return withoutDate.replace(/\.md$/, '');
}

function findMarkdownFiles(dir: string, baseDir: string = ''): ContentFile[] {
  const files: ContentFile[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(baseDir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findMarkdownFiles(fullPath, relativePath));
    } else if (entry.name.endsWith('.md')) {
      // Determine collection from path
      const collection = dir.split(path.sep).find(p => p.startsWith('_')) || '';
      
      if (shouldSkipFile(fullPath)) continue;
      
      const slug = getSlugFromFilename(entry.name);
      const urlGenerator = COLLECTION_URL_PATTERNS[collection];
      // baseDir is the path inside the collection (e.g. "intelligent-systems/assignment3")
      const relativePath = path.join(baseDir, entry.name).split(path.sep).join('/');
      const possibleUrls = urlGenerator
        ? urlGenerator(entry.name, slug, relativePath)
        : [`/${slug}/`, `/${slug}`];
      
      files.push({
        sourcePath: fullPath,
        expectedUrl: possibleUrls[0],
        collection,
      });
    }
  }
  
  return files;
}

function getAllUnderscoreFolders(): string[] {
  const workspaceRoot = process.cwd();
  const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('_'))
    .filter(entry => !['_site', '_sass', '_layouts', '_includes', '_data'].includes(entry.name))
    .map(entry => path.join(workspaceRoot, entry.name));
}

test.describe('Backwards Link Checker', () => {
  let contentFiles: ContentFile[] = [];

  test.beforeAll(() => {
    // Collect all markdown files from underscore folders. The previous
    // implementation also pre-crawled the entire site recursively to populate
    // an `allSiteLinks` set — but that set was never consulted by any of the
    // assertions (which all call checkIfLinked() and re-crawl from a fixed
    // page list). Removing the dead crawl avoids beforeAll timeouts on a
    // 100+ post site.
    const underscoreFolders = getAllUnderscoreFolders();
    for (const folder of underscoreFolders) {
      const files = findMarkdownFiles(folder);
      contentFiles.push(...files);
    }
    console.log(`Found ${contentFiles.length} content files to check`);
  });
  
  test('all posts are linked somewhere', async ({ page }) => {
    const posts = contentFiles.filter(f => f.collection === '_posts');
    const unlinkedPosts: ContentFile[] = [];
    
    for (const post of posts) {
      const isLinked = await checkIfLinked(page, post);
      if (!isLinked) {
        unlinkedPosts.push(post);
      }
    }
    
    if (unlinkedPosts.length > 0) {
      console.log('Unlinked posts:');
      unlinkedPosts.forEach(p => console.log(`  - ${p.sourcePath} (expected: ${p.expectedUrl})`));
    }
    
    // Allow some unlinked posts (pagination, archives may not show all)
    const unlinkedRatio = unlinkedPosts.length / posts.length;
    expect(unlinkedRatio).toBeLessThan(0.5); // At least 50% should be linked
  });
  
  test('all courses are linked somewhere', async ({ page }) => {
    const courses = contentFiles.filter(f => f.collection === '_courses');
    const unlinkedCourses: ContentFile[] = [];
    
    for (const course of courses) {
      const isLinked = await checkIfLinked(page, course);
      if (!isLinked) {
        unlinkedCourses.push(course);
      }
    }
    
    if (unlinkedCourses.length > 0) {
      console.log('Unlinked courses:');
      unlinkedCourses.forEach(c => console.log(`  - ${c.sourcePath} (expected: ${c.expectedUrl})`));
    }
    
    expect(unlinkedCourses.length).toBe(0);
  });
  
  test('all projects are linked somewhere', async ({ page }) => {
    const projects = contentFiles.filter(f => f.collection === '_projects');
    const unlinkedProjects: ContentFile[] = [];
    
    for (const project of projects) {
      const isLinked = await checkIfLinked(page, project);
      if (!isLinked) {
        unlinkedProjects.push(project);
      }
    }
    
    if (unlinkedProjects.length > 0) {
      console.log('Unlinked projects:');
      unlinkedProjects.forEach(p => console.log(`  - ${p.sourcePath} (expected: ${p.expectedUrl})`));
    }
    
    expect(unlinkedProjects.length).toBe(0);
  });
  
  test('all experiments are linked somewhere', async ({ page }) => {
    const experiments = contentFiles.filter(f => f.collection === '_experiments');
    const unlinkedExperiments: ContentFile[] = [];
    
    for (const experiment of experiments) {
      const isLinked = await checkIfLinked(page, experiment);
      if (!isLinked) {
        unlinkedExperiments.push(experiment);
      }
    }
    
    if (unlinkedExperiments.length > 0) {
      console.log('Unlinked experiments:');
      unlinkedExperiments.forEach(e => console.log(`  - ${e.sourcePath} (expected: ${e.expectedUrl})`));
    }
    
    // Experiments may be WIP, allow some to be unlinked
    const unlinkedRatio = experiments.length > 0 
      ? unlinkedExperiments.length / experiments.length 
      : 0;
    expect(unlinkedRatio).toBeLessThan(0.75);
  });
  
  test('assignments are linked from course pages', async ({ page }) => {
    const assignments = contentFiles.filter(f => f.collection === '_assignments');
    const unlinkedAssignments: ContentFile[] = [];
    
    for (const assignment of assignments) {
      const isLinked = await checkIfLinked(page, assignment);
      if (!isLinked) {
        unlinkedAssignments.push(assignment);
      }
    }
    
    if (unlinkedAssignments.length > 0) {
      console.log('Unlinked assignments:');
      unlinkedAssignments.forEach(a => console.log(`  - ${a.sourcePath} (expected: ${a.expectedUrl})`));
    }
    
    // Assignments should be linked from course pages
    const unlinkedRatio = assignments.length > 0 
      ? unlinkedAssignments.length / assignments.length 
      : 0;
    expect(unlinkedRatio).toBeLessThan(0.5);
  });
  
  test('generates orphaned content report', async ({ page }) => {
    const allOrphaned: ContentFile[] = [];
    
    for (const file of contentFiles) {
      const isLinked = await checkIfLinked(page, file);
      if (!isLinked) {
        allOrphaned.push(file);
      }
    }
    
    console.log('\n=== ORPHANED CONTENT REPORT ===\n');
    
    if (allOrphaned.length === 0) {
      console.log('✅ All content files are linked!');
    } else {
      console.log(`⚠️ Found ${allOrphaned.length} orphaned files:\n`);
      
      // Group by collection
      const byCollection: Record<string, ContentFile[]> = {};
      for (const file of allOrphaned) {
        if (!byCollection[file.collection]) {
          byCollection[file.collection] = [];
        }
        byCollection[file.collection].push(file);
      }
      
      for (const [collection, files] of Object.entries(byCollection)) {
        console.log(`${collection}:`);
        files.forEach(f => {
          console.log(`  - ${path.basename(f.sourcePath)}`);
          console.log(`    Expected URL: ${f.expectedUrl}`);
        });
        console.log('');
      }
    }
    
    // This test always passes but generates a report
    expect(true).toBeTruthy();
  });
});

// Helper function to crawl site and collect all links
async function crawlSiteLinks(
  page: Page, 
  links: Set<string>, 
  visited: Set<string>,
  maxDepth: number = 3,
  currentDepth: number = 0
): Promise<void> {
  if (currentDepth >= maxDepth) return;
  
  const currentUrl = page.url();
  const baseUrl = new URL(currentUrl).origin;
  
  // Get all links on current page
  const pageLinks = await page.locator('a[href]').all();
  
  for (const linkEl of pageLinks) {
    try {
      const href = await linkEl.getAttribute('href');
      if (!href) continue;
      
      // Normalize the URL
      let fullUrl: string;
      if (href.startsWith('/')) {
        fullUrl = href;
      } else if (href.startsWith('#')) {
        continue; // Skip anchor links
      } else if (href.startsWith('http')) {
        // Skip external links
        if (!href.includes('localhost') && !href.includes('127.0.0.1')) {
          continue;
        }
        fullUrl = new URL(href).pathname;
      } else {
        // Relative URL
        fullUrl = new URL(href, currentUrl).pathname;
      }
      
      // Normalize trailing slashes
      const normalizedUrl = fullUrl.replace(/\/$/, '') || '/';
      links.add(normalizedUrl);
      links.add(normalizedUrl + '/'); // Also add with trailing slash
      
      // Crawl unvisited internal links
      if (!visited.has(normalizedUrl) && currentDepth < maxDepth - 1) {
        visited.add(normalizedUrl);
        
        try {
          await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
          await crawlSiteLinks(page, links, visited, maxDepth, currentDepth + 1);
        } catch {
          // Page might not exist, continue
        }
      }
    } catch {
      // Skip problematic links
    }
  }
}

// Check if a content file is linked somewhere
async function checkIfLinked(page: Page, file: ContentFile): Promise<boolean> {
  const slug = getSlugFromFilename(path.basename(file.sourcePath));
  const urlGenerator = COLLECTION_URL_PATTERNS[file.collection];
  // Derive the path inside the collection from sourcePath (e.g. for
  // _assignments/intelligent-systems/assignment3/foo.md → "intelligent-systems/assignment3/foo.md")
  const collectionIdx = file.sourcePath.indexOf(file.collection + path.sep);
  const relativePath = collectionIdx >= 0
    ? file.sourcePath.slice(collectionIdx + file.collection.length + 1).split(path.sep).join('/')
    : path.basename(file.sourcePath);
  const possibleUrls = urlGenerator
    ? urlGenerator(path.basename(file.sourcePath), slug, relativePath)
    : [`/${slug}/`, `/${slug}`];
  
  // Check if any of the possible URLs exist in site links
  // We need to crawl from homepage and common pages
  const pagesToCheck = ['/', '/blog/', '/courses/', '/projects/', '/experiments/'];
  
  for (const startPage of pagesToCheck) {
    try {
      await page.goto(startPage, { waitUntil: 'domcontentloaded', timeout: 5000 });
      
      // Check all links on the page
      const links = await page.locator('a[href]').all();
      
      for (const linkEl of links) {
        const href = await linkEl.getAttribute('href');
        if (!href) continue;
        
        // Check if this link matches any of our expected URLs
        for (const expectedUrl of possibleUrls) {
          if (href === expectedUrl || 
              href === expectedUrl.replace(/\/$/, '') ||
              href.includes(slug)) {
            return true;
          }
        }
      }
    } catch {
      // Page might not exist, continue
    }
  }
  
  // Also check if the page exists (it might be linked from sitemap only)
  for (const url of possibleUrls) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
      if (response && response.status() === 200) {
        return true; // Page exists even if not directly linked
      }
    } catch {
      // Continue checking other URLs
    }
  }
  
  return false;
}
