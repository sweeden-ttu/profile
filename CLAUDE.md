# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal profile and blog for **Scott Weeden**, Master of Computer Science student at Texas Tech University. This Jekyll-based static site showcases professional work, research, projects, and personal journey in computer science, machine learning, and academic pursuits.

**Core Purpose**: Professional portfolio and blog demonstrating expertise in CS, ML research, and academic achievements while maintaining approachable, authentic personal voice.

## Site Structure

### Primary Pages
1. **Home/Landing** - Visual introduction with navigation to key sections
2. **About** - Personal introduction, journey from Oregon to Texas, academic aspirations
3. **Resume/CV** - Academic and professional experience
4. **Research & Projects** - Showcase of academic work, publications, and technical projects
5. **Blog** - Technical writing on CS, ML, and learning experiences

### About Page Content
```
Originally from Oregon, I moved to Texas a year ago to study computer science at Texas Tech University. While completing my degree, I plan to study abroad for a semester in Australia to find new challenges and opportunities in machine learning and its applications in solving complex social, environmental, and healthcare issues.

During my studies at Texas Tech, I have so far authored an IEEE peer review article of a Microsoft Research publication, perfected the Master's theorem in algorithm analysis, participated in Kaggle machine learning competitions, published YouTube video shorts on reinforcement learning, created propositional logic utility for chrome extensions, and published a Q-Learning pac-man demonstration on Github.

An avid biker, I enjoy weekend tours in Dallas, Austin and San Antonio areas. I still have a passion for travel and hope to develop new international business and research connections. I'm always open to new experiences, cultures, and ways of thinking.
```

## Design Principles

### Design Philosophy: Academic Minimalism with Technical Precision

Inspired by Linear, Notion, and Stripe's design language. Every pixel matters. This is a **computer science researcher's portfolio** - it must be precise, clean, and intellectually rigorous while remaining approachable.

#### Core Principles

**1. Precision Over Decoration**
- Clean, purposeful layouts with intentional whitespace
- Typography as the primary design element
- No unnecessary ornamentation or visual noise
- Every design decision must serve content clarity

**2. Technical Elegance**
- Monospace fonts for code, technical content
- Clear hierarchy: headings, body text, captions, code
- Syntax highlighting that enhances readability, never distracts
- Mathematical notation rendered beautifully (KaTeX/MathJax when needed)

**3. Academic Credibility**
- Professional color palette that signals seriousness and expertise
- Citation and reference formatting that matches academic standards
- Clear attribution for research, publications, projects
- Professional photography/imagery (avoid casual snapshots)

**4. Responsive Intelligence**
- Mobile-first approach (researchers read on all devices)
- Fast loading times (< 2s initial load)
- Accessible (WCAG AA minimum)
- Progressive enhancement

### Visual Design System

#### Typography
```
Primary Font Stack:
- Headings: "Inter", "SF Pro Display", -apple-system, system-ui, sans-serif
- Body: "Inter", "SF Pro Text", -apple-system, system-ui, sans-serif
- Code: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, monospace

Type Scale (1.250 - Major Third):
- H1: 2.441rem (39px) - Page titles
- H2: 1.953rem (31px) - Section headers
- H3: 1.563rem (25px) - Subsection headers
- H4: 1.25rem (20px) - Card titles
- Body: 1rem (16px) - Standard text
- Small: 0.8rem (13px) - Captions, metadata

Line Heights:
- Headings: 1.2
- Body: 1.6 (optimal for reading)
- Code: 1.5
```

#### Color Palette
```css
/* Primary Colors - Academic Blues */
--color-primary: #2563eb;        /* Blue 600 - Links, CTAs */
--color-primary-dark: #1e40af;   /* Blue 700 - Hover states */
--color-primary-light: #dbeafe;  /* Blue 50 - Backgrounds */

/* Neutral Grays - Linear-inspired */
--color-text-primary: #0f172a;   /* Slate 900 - Headlines, body */
--color-text-secondary: #475569; /* Slate 600 - Captions, meta */
--color-text-tertiary: #94a3b8;  /* Slate 400 - Placeholder */

--color-bg-primary: #ffffff;     /* Pure white - Main background */
--color-bg-secondary: #f8fafc;   /* Slate 50 - Sections, cards */
--color-bg-tertiary: #f1f5f9;    /* Slate 100 - Code blocks */

--color-border: #e2e8f0;         /* Slate 200 - Dividers, cards */
--color-border-light: #f1f5f9;   /* Slate 100 - Subtle dividers */

/* Accent Colors - Purposeful */
--color-accent-green: #10b981;   /* Success, achievements */
--color-accent-orange: #f59e0b;  /* Highlights, warnings */
--color-accent-red: #ef4444;     /* Errors, critical info */

/* Code Syntax (Minimalist) */
--color-code-bg: #f8fafc;
--color-code-text: #1e293b;
--color-code-keyword: #7c3aed;   /* Purple */
--color-code-string: #059669;    /* Green */
--color-code-comment: #94a3b8;   /* Gray */
--color-code-function: #2563eb;  /* Blue */
```

#### Spacing Scale (8px base)
```
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
--space-4xl: 6rem;     /* 96px */
```

#### Component Specifications

**Navigation**
- Fixed header on desktop, collapsible on mobile
- Height: 64px (--space-4xl)
- Background: Semi-transparent blur (backdrop-filter) or solid white
- Links: Medium weight (500), subtle hover underline
- Active state: Primary color with 2px bottom border

**Cards (Projects, Blog Posts)**
```
- Background: white
- Border: 1px solid var(--color-border)
- Border-radius: 8px
- Padding: var(--space-xl)
- Shadow: 0 1px 3px rgba(0,0,0,0.05) - subtle, Notion-style
- Hover: Lift slightly (translateY(-2px)), shadow increases
- Transition: all 150ms ease
```

**Buttons**
```
Primary:
- Background: var(--color-primary)
- Text: white, 14px, medium weight
- Padding: 10px 20px
- Border-radius: 6px
- Hover: Darken 10%, lift 1px
- Transition: 100ms ease

Secondary:
- Background: transparent
- Border: 1px solid var(--color-border)
- Text: var(--color-text-primary)
- Same padding, radius, hover lift
```

**Code Blocks**
```
- Background: var(--color-bg-tertiary)
- Border: 1px solid var(--color-border-light)
- Border-radius: 6px
- Padding: var(--space-lg)
- Font-size: 14px
- Line-height: 1.5
- Overflow-x: auto
- Include language label (top-right, small, gray)
```

#### Layout Grid
- Max content width: 768px (reading comfort)
- Wide content (projects grid): 1200px
- Padding: 24px mobile, 48px tablet, 64px desktop
- Grid for projects: 2 columns tablet, 3 columns desktop
- Gap: var(--space-xl)

### Content Guidelines

**Writing Tone**
- Professional but approachable
- Technical precision without jargon overload
- First-person for blog, third-person for resume/research
- Active voice preferred
- Show expertise through clarity, not complexity

**Project Descriptions**
- Format: Problem → Approach → Technology → Outcome
- Include links to demos, code, papers, videos
- Technical stack clearly listed
- Quantifiable results when possible

**Blog Posts**
- Clear H2/H3 structure for scanning
- Code examples well-commented
- Visual aids (diagrams, charts) when helpful
- Reading time estimate
- Publication date prominent
- Tags for categorization

## Development Setup

### Prerequisites
```bash
# Ruby (version 2.7+ recommended)
ruby --version

# Bundler
gem install bundler

# Jekyll
gem install jekyll
```

### Installation
```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Serve locally (basic, no auto-reload)
bundle exec jekyll serve

# Build for production
JEKYLL_ENV=production bundle exec jekyll build

# Serve with drafts
bundle exec jekyll serve --drafts

# Serve with future posts
bundle exec jekyll serve --future
```

### Common Development Commands

```bash
# Start local development server
bundle exec jekyll serve --livereload

# Build and validate HTML
bundle exec jekyll build
bundle exec htmlproofer ./_site --disable-external

# Clean build artifacts
bundle exec jekyll clean

# Build with production settings
JEKYLL_ENV=production bundle exec jekyll build
```

### Directory Structure
```
profile/
├── _config.yml           # Jekyll configuration
├── _layouts/             # Page templates
│   ├── default.html
│   ├── page.html
│   ├── post.html
│   └── project.html
├── _includes/            # Reusable components
│   ├── header.html
│   ├── footer.html
│   ├── nav.html
│   └── meta.html
├── _posts/               # Blog posts (YYYY-MM-DD-title.md)
├── _projects/            # Project collection
├── _sass/                # Sass partials
│   ├── _variables.scss   # Design tokens
│   ├── _typography.scss
│   ├── _layout.scss
│   └── _components.scss
├── assets/
│   ├── css/
│   │   └── main.scss     # Main stylesheet
│   ├── js/
│   └── images/
├── about.md
├── resume.md
├── research.md
├── index.html
└── CLAUDE.md
```

### Jekyll Configuration (_config.yml)

**Key configuration details:**
- **Markdown processor**: Kramdown with GitHub Flavored Markdown (GFM)
- **Math engine**: KaTeX (configured in kramdown settings)
- **Syntax highlighter**: Rouge (Jekyll's default)
- **Permalink structure**: `/blog/:year/:month/:day/:title/`
- **Timezone**: America/Chicago
- **Collections**: `_projects` collection with output enabled
- **Sass**: Compressed output for production

**Important exclusions:**
- Templates directory (`templates/`) is excluded from build
- CLAUDE.md and README.md are excluded
- Standard Ruby/Jekyll build artifacts are excluded

See `_config.yml` for complete configuration.

## Testing & Quality Assurance

### Pre-Deployment Checklist

**Visual Testing**
- [ ] Test all pages at mobile (375px), tablet (768px), desktop (1440px)
- [ ] Verify typography scale, line-height, readability
- [ ] Check color contrast (WCAG AA: 4.5:1 body, 3:1 headings)
- [ ] Confirm all interactive elements have hover/focus states
- [ ] Verify navigation works on all screen sizes
- [ ] Test code block syntax highlighting

**Functional Testing**
- [ ] All internal links work correctly
- [ ] External links open in new tabs with rel="noopener"
- [ ] Forms validate properly (if any)
- [ ] Images have alt text
- [ ] Responsive images load correctly
- [ ] No 404 errors in browser console

**Performance Testing**
```bash
# Build production site
JEKYLL_ENV=production bundle exec jekyll build

# Serve production build locally
cd _site && python3 -m http.server 8000
```

**Targets**:
- Lighthouse Performance Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

**Accessibility Testing**
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators visible and clear
- [ ] Screen reader friendly (test with VoiceOver/NVDA)
- [ ] Semantic HTML (nav, main, article, aside, footer)
- [ ] ARIA labels where needed
- [ ] Color not sole indicator of meaning

**Browser Testing**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Local Testing Commands

```bash
# Serve locally
bundle exec jekyll serve

# Serve with live reload
bundle exec jekyll serve --livereload

# Build and check HTML
bundle exec jekyll build
bundle exec htmlproofer ./_site --disable-external

# Check for broken links (if html-proofer installed)
gem install html-proofer
htmlproofer ./_site

# Lint Markdown (if markdownlint installed)
markdownlint _posts _projects *.md

# Check Accessibility (using pa11y)
npm install -g pa11y
pa11y http://localhost:4000
```

## Code Standards

### HTML
- Semantic HTML5 elements
- Proper heading hierarchy (single h1 per page)
- Descriptive link text (avoid "click here")
- Alt text for all images
- Forms with proper labels

### CSS/Sass - Modern Dart Sass Syntax

**IMPORTANT**: This project uses modern Dart Sass 3.0-compatible syntax. Always use `@use` instead of `@import`.

```scss
// ✅ Modern syntax - Always use this
@use "variables" as *;
@use "sass:color";
@use "sass:math";

// ❌ Old syntax - Never use this
@import "variables";

// ✅ Modern color manipulation
background-color: color.scale($color-primary, $lightness: 74%);
border-color: color.scale($color-primary, $lightness: -25%);

// ❌ Deprecated - Will break in Dart Sass 3.0
background-color: lighten($color-primary, 45%);
border-color: darken($color-primary, 10%);

// Use design tokens (CSS custom properties)
// ✅ Good
.card {
  padding: var(--space-lg);
  color: var(--color-text-primary);
}

// ❌ Bad
.card {
  padding: 24px;
  color: #0f172a;
}

// Mobile-first media queries
.container {
  padding: var(--space-lg);

  @media (min-width: 768px) {
    padding: var(--space-xl);
  }

  @media (min-width: 1024px) {
    padding: var(--space-2xl);
  }
}

// BEM naming convention for components
.project-card { }
.project-card__title { }
.project-card__description { }
.project-card--featured { }
```

**Sass File Organization:**
- `_sass/_variables.scss` - Design tokens (colors, spacing, typography)
- `_sass/_typography.scss` - Typography styles (includes `@use "variables" as *;`)
- `_sass/_layout.scss` - Layout and grid (includes `@use "variables" as *;`)
- `_sass/_components.scss` - Components (includes `@use "sass:color"` and `@use "variables" as *;`)
- `assets/css/main.scss` - Main entry point (uses `@use` to import all partials)

**References:**
- See `.sass-modernization.md` for complete migration details
- [Sass Module System Guide](https://sass-lang.com/documentation/at-rules/use)

### JavaScript
- Minimal JavaScript (Progressive enhancement)
- Vanilla JS preferred (avoid jQuery)
- ES6+ syntax
- No unnecessary dependencies
- Defer non-critical scripts

### Markdown (Blog Posts)
```markdown
---
layout: post
title: "Your Post Title"
date: 2025-01-10
categories: [machine-learning, research]
tags: [reinforcement-learning, python]
excerpt: "Brief description for previews"
---

# Your Post Title

Clear introduction paragraph.

## Section Header

Content with proper formatting.

### Code Examples

` ``python
def example():
    return "Well-commented code"
` ``

## Conclusion

Summary and next steps.
```

## Deployment

### GitHub Pages Deployment
```bash
# Ensure _config.yml is configured correctly
# Push to main/master branch
git add .
git commit -m "Update site content"
git push origin main

# GitHub Pages will build automatically
# Site available at: https://[username].github.io/[repo]
```

### Custom Domain (if applicable)
```bash
# Add CNAME file to root
echo "yourdomain.com" > CNAME

# Configure DNS:
# A record: 185.199.108.153
# A record: 185.199.109.153
# A record: 185.199.110.153
# A record: 185.199.111.153
```

## Content Update Workflow

### Adding Blog Post
```bash
# Create new post file
touch _posts/YYYY-MM-DD-your-post-title.md

# Add frontmatter and content
# Preview locally
bundle exec jekyll serve --drafts

# Commit and push when ready
git add _posts/YYYY-MM-DD-your-post-title.md
git commit -m "Add blog post: Your Post Title"
git push
```

### Adding Project
```bash
# Create project file
touch _projects/project-name.md

# Add frontmatter with project details
# Include: title, description, tech stack, links, images
# Preview and push
```

## Architecture & Important Patterns

### Sass/CSS Architecture

**Modern Dart Sass Module System** - This project has been fully migrated to Dart Sass 3.0-compatible syntax:

1. **No `@import` usage**: All stylesheets use `@use` instead of deprecated `@import`
2. **Namespaced modules**: Built-in Sass modules are explicitly imported (`@use "sass:color"`, `@use "sass:math"`)
3. **Wildcard namespace for variables**: Variables are imported with `@use "variables" as *;` to allow usage without prefixes
4. **Modern color functions**: Uses `color.scale()` instead of deprecated `lighten()`/`darken()`

**Entry point**: `assets/css/main.scss`
- Imports all partials using `@use` syntax
- Exports CSS custom properties (`:root`) for runtime theming
- Sass variables are converted to CSS custom properties for browser compatibility

**Build output**: Compressed CSS in `_site/assets/css/main.css`

See `.sass-modernization.md` for complete migration documentation.

### Jekyll Layout Hierarchy

**Layout inheritance chain**:
```
default.html (base)
  ├── page.html (static pages)
  ├── post.html (blog posts)
  └── project.html (project showcases)
```

**Key includes**:
- `header.html` - Site header with navigation
- `nav.html` - Main navigation menu (mobile-responsive)
- `footer.html` - Site footer with links
- `meta.html` - SEO meta tags, Open Graph, KaTeX, Prism.js

**Layout features**:
- `default.html` loads KaTeX for math rendering and Prism.js for syntax highlighting
- `post.html` includes reading time, tags, and publication date
- `project.html` includes tech stack, status badges, and outcome highlights

### Collections Architecture

**Projects collection** (`_projects/`):
- Output: `true` (generates individual pages)
- Permalink: `/projects/:name/`
- Layout: `project.html`
- Required frontmatter: `title`, `date`, `tech_stack`, `status`
- Optional: `links` (demo, github, paper), `outcomes`, `subtitle`

**Posts collection** (`_posts/`):
- Standard Jekyll posts with date-based filenames: `YYYY-MM-DD-title.md`
- Permalink: `/blog/:year/:month/:day/:title/`
- Layout: `post.html`
- Required frontmatter: `title`, `date`, `categories`, `tags`, `excerpt`
- Optional: `reading_time`

### Performance Optimization Strategy

**Lighthouse targets** (configured in `.lighthouserc.json`):
- All core scores: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 300ms

**Optimization techniques**:
1. **KaTeX over MathJax**: ~2x faster rendering, 5x smaller bundle
2. **Prism.js over Highlight.js**: Smaller core, modular language loading
3. **Vanilla JS**: No framework overhead for navigation
4. **Compressed Sass output**: Minified CSS in production
5. **Minimal dependencies**: Only essential Jekyll plugins

### Templates Directory

**Important**: The `templates/` directory is **excluded from Jekyll builds** (see `_config.yml`).

**Contents**:
- `templates/latex/` - LaTeX templates for academic papers, resumes, blog supplements
- `templates/ci-cd/` - GitHub Actions workflow templates (not yet deployed)

**Usage**: Templates are reference materials and starting points, not built into the site.

## AI Assistant Instructions

When working with this repository, Claude Code should:

1. **Prioritize Design Quality**: Use /design-principles skill for any UI/component work. Every pixel matters. Reject mediocre design.

2. **Maintain Consistency**: Always reference the design system defined above. Do not deviate from color palette, typography scale, spacing system without explicit approval.

3. **Use Modern Sass Syntax**:
   - ALWAYS use `@use` instead of `@import`
   - ALWAYS use `color.scale()` instead of `lighten()`/`darken()`
   - Import built-in modules: `@use "sass:color"`, `@use "sass:math"`
   - See `.sass-modernization.md` for examples
   - This is critical for Dart Sass 3.0 compatibility

4. **Test Thoroughly**: Before suggesting code is complete, verify:
   - Responsive behavior (mobile, tablet, desktop)
   - Accessibility (semantic HTML, ARIA, keyboard nav)
   - Performance (minimal CSS/JS, optimized images)
   - Cross-browser compatibility
   - No Sass deprecation warnings: `bundle exec jekyll build` should be clean

5. **Write Clean Code**:
   - Use design tokens (CSS variables)
   - Follow BEM for CSS class naming
   - Semantic HTML always
   - Comment complex logic
   - No hardcoded values

6. **Content First**: Design serves content. Technical writing should be clear, scannable, and valuable. Remove friction between reader and knowledge.

7. **Academic Rigor**: This is a researcher's portfolio. Citations, references, and technical accuracy are non-negotiable. Maintain professional tone while being approachable.

8. **Performance Matters**: Every asset should be optimized. Every script should be necessary. Lighthouse score 90+ is mandatory.

9. **Accessibility is Required**: WCAG AA minimum. Keyboard navigation. Screen reader friendly. Color contrast verified.

10. **Understand the Architecture**:
    - Jekyll collections: `_projects/` and `_posts/`
    - Layout hierarchy: `default.html` → `page.html`/`post.html`/`project.html`
    - Templates directory is excluded from builds
    - KaTeX for math, Prism.js for syntax highlighting

## Common Pitfalls & Troubleshooting

### Sass Deprecation Warnings

**Problem**: Build shows deprecation warnings about `@import` or `lighten()`/`darken()`

**Solution**: This project uses modern Dart Sass syntax. See `.sass-modernization.md` for:
- How to use `@use` instead of `@import`
- How to use `color.scale()` instead of deprecated color functions
- Complete migration examples

**Test**: Run `bundle exec jekyll build` and verify no deprecation warnings appear.

### Jekyll Build Fails

**Common causes**:
1. **Ruby version**: Requires Ruby 2.7+. Check with `ruby --version`
2. **Missing dependencies**: Run `bundle install`
3. **Cache issues**: Run `bundle exec jekyll clean` then rebuild
4. **Invalid frontmatter**: Check YAML syntax in markdown files

### Lighthouse Scores Below 90

**Check**:
1. **Images**: Ensure images are optimized and properly sized
2. **Fonts**: Verify font loading doesn't block rendering
3. **JavaScript**: Check that scripts are deferred or async
4. **CSS**: Ensure critical CSS is inlined if needed

**Test locally**:
```bash
JEKYLL_ENV=production bundle exec jekyll build
cd _site && python3 -m http.server 8000
npm install -g @lhci/cli
lhci autorun --config=.lighthouserc.json
```

### Navigation Not Working on Mobile

**Check**:
- JavaScript file is loaded: `assets/js/main.js`
- `nav.html` include is present in header
- Browser console for JavaScript errors

### Math Rendering Issues

**KaTeX not rendering**:
- Verify `default.html` layout includes KaTeX scripts
- Check that frontmatter doesn't override layout
- Use `$...$` for inline math, `$$...$$` for display math
- Escape special characters if needed

### Code Syntax Highlighting Not Working

**Prism.js issues**:
- Verify `default.html` includes Prism.js scripts
- Check language is supported (Python, JavaScript, Java, C++, Bash by default)
- Add new languages in `default.html` if needed
- Use triple backticks with language identifier: ` ```python`

## Key Technologies

- **Jekyll 4.x**: Static site generator
- **Liquid**: Templating language
- **Kramdown**: Markdown processor with KaTeX math engine
- **Rouge**: Syntax highlighting (server-side)
- **Prism.js**: Syntax highlighting (client-side, for enhanced display)
- **KaTeX**: Fast math rendering
- **Sass/SCSS**: CSS preprocessing (Dart Sass, modern `@use` syntax)
- **HTML5/CSS3**: Modern web standards
- **Git/GitHub Pages**: Version control and hosting

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Guide](https://docs.github.com/en/pages)
- [Liquid Template Language](https://shopify.github.io/liquid/)
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## GitHub Pages Publishing & CI/CD

### Step-by-Step Publishing Guide

**Prerequisites:**
1. GitHub repository created
2. Local Jekyll site working (`bundle exec jekyll serve`)
3. All content pages created (see Content Checklist below)
4. Design system implemented
5. Tests passing locally

**Publishing Steps:**

```bash
# 1. Verify local build is clean
bundle exec jekyll clean
bundle exec jekyll build
# Ensure no Sass deprecation warnings

# 2. Test production build
JEKYLL_ENV=production bundle exec jekyll build
cd _site && python3 -m http.server 8000
# Test at localhost:8000

# 3. Create GitHub repository (if not exists)
gh repo create profile --public --source=. --remote=origin

# 4. Configure GitHub Pages
# Go to: Settings → Pages → Source: GitHub Actions (recommended)
# OR: Settings → Pages → Source: Deploy from branch (main)

# 5. Push to GitHub
git add .
git commit -m "Initial site deployment"
git push origin main

# 6. Enable GitHub Pages (if using branch deployment)
# Site will be available at: https://[username].github.io/profile
```

### GitHub Actions Workflow Setup

**Recommended Approach**: Use GitHub Actions for CI/CD with Playwright testing and Lighthouse audits.

**Create `.github/workflows/jekyll-deploy.yml`:**

```yaml
name: Deploy Jekyll Site with CI/CD

on:
  push:
    branches: [main, stable]
  pull_request:
    branches: [main, stable]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Build with Jekyll
        run: JEKYLL_ENV=production bundle exec jekyll build
        env:
          JEKYLL_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  # Test job - Runs after build
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm install -g @playwright/test @lhci/cli
          npx playwright install --with-deps chromium

      - name: Build site for testing
        run: bundle exec jekyll build

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Run Lighthouse CI
        run: lhci autorun --config=.lighthouserc.json

  # Deploy job - Runs after tests pass
  deploy:
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/stable'
    needs: test
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Create `.github/workflows/pr-preview.yml` for PR previews:**

```yaml
name: PR Preview & Tests

on:
  pull_request:
    branches: [main, stable]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Build Jekyll
        run: bundle exec jekyll build

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: |
          npm install -g @playwright/test
          npx playwright install --with-deps chromium

      - name: Run tests
        run: npx playwright test

      - name: Comment PR with results
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview build and tests completed. Check artifacts for detailed results.'
            })
```

### Playwright Testing Setup

**Install Playwright:**

```bash
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

**Create `playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'bundle exec jekyll serve',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Create `tests/site.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Jekyll Site Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Scott Weeden/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
  });

  test('about page has required content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('body')).toContainText('Oregon');
    await expect(page.locator('body')).toContainText('Texas Tech');
  });

  test('research page loads', async ({ page }) => {
    await page.goto('/research');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('blog index loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText(/blog/i);
  });

  test('responsive design works', async ({ page, viewport }) => {
    await page.goto('/');
    if (viewport && viewport.width < 768) {
      // Mobile nav should be hidden by default
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    }
  });

  test('no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    expect(errors).toHaveLength(0);
  });

  test('links are not broken', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('a[href^="/"]').all();
    expect(links.length).toBeGreaterThan(0);
  });

  test('meta tags present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });

  test('syntax highlighting works', async ({ page }) => {
    // Test on a blog post with code
    await page.goto('/blog');
    const codeBlock = page.locator('pre code');
    if (await codeBlock.count() > 0) {
      await expect(codeBlock.first()).toBeVisible();
    }
  });
});
```

**Run tests:**

```bash
# Run tests locally
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test tests/site.spec.ts

# Open test report
npx playwright show-report
```

### Continuous Integration Testing

The CI/CD pipeline automatically runs:

1. **Jekyll build verification** - Ensures site builds without errors
2. **Sass compilation check** - No deprecation warnings
3. **Playwright tests** - Functional testing across desktop/mobile
4. **Lighthouse audits** - Performance, accessibility, SEO, best practices
5. **HTML validation** - Semantic correctness
6. **Link checking** - No broken internal links

**All tests must pass before deployment to production.**

## Content Creation Workflow

### Required Markdown Files

The following content files **must be created** before site launch:

#### Core Pages (Top Priority)

- [ ] `index.html` or `index.md` - Homepage/landing page
- [ ] `about.md` - Personal bio, journey, academic goals
- [ ] `resume.md` - Academic and professional experience
- [ ] `research.md` - Research interests, publications, ongoing work
- [ ] `blog/index.html` - Blog post listing page

#### Project Pages

Create individual project pages in `_projects/`:

- [ ] `_projects/ieee-peer-review.md` - Microsoft Research article peer review
- [ ] `_projects/masters-theorem.md` - Master's theorem perfection work
- [ ] `_projects/kaggle-competitions.md` - ML competition participation
- [ ] `_projects/reinforcement-learning-videos.md` - YouTube educational content
- [ ] `_projects/propositional-logic-extension.md` - Chrome extension utility
- [ ] `_projects/qlearning-pacman.md` - Q-Learning Pac-Man demo

#### Blog Posts (Start with 2-3)

Create initial blog posts in `_posts/`:

- [ ] `_posts/2025-01-XX-welcome-post.md` - Introduction to blog
- [ ] `_posts/2025-01-XX-masters-theorem-explained.md` - Technical deep dive
- [ ] `_posts/2025-01-XX-ml-journey.md` - Personal ML learning experience

#### Supporting Pages

- [ ] `404.md` - Custom 404 error page
- [ ] `contact.md` - Contact information or form (optional)
- [ ] `projects/index.html` - Project listing page

### Markdown File Creation Workflow

**Step 1: Use doc-coauthoring skill for long-form content**

```bash
# For technical blog posts, research documentation
# Claude will guide you through structured content creation
/doc-coauthoring
```

**Step 2: Create markdown file with proper frontmatter**

```markdown
---
layout: page  # or 'post' for blog, 'project' for projects
title: "Your Page Title"
date: 2025-01-10
permalink: /your-page-url/  # Optional, overrides defaults
---

# Your Page Title

Content goes here...
```

**Step 3: Preview locally**

```bash
bundle exec jekyll serve --livereload
# Navigate to http://localhost:4000/your-page-url
```

**Step 4: Test thoroughly**

```bash
# Run Playwright tests
npx playwright test

# Check Lighthouse scores
lhci autorun
```

**Step 5: Commit and push**

```bash
git add your-new-file.md
git commit -m "Add [page description]"
git push origin main
```

### Using Claude Code Skills for Content Creation

#### /doc-coauthoring - Technical Writing & Documentation

**Use for:**
- Blog posts with technical depth
- Research documentation
- Project descriptions
- About page narrative

**Workflow:**
```bash
/doc-coauthoring

# Claude will guide you through:
# 1. Context gathering
# 2. Outline creation
# 3. Content drafting
# 4. Iterative refinement
# 5. Final review
```

**Best for**: Long-form content requiring structure, technical accuracy, and multiple revisions.

#### /theme-factory - Visual Theming & Styling

**Use for:**
- Applying consistent design themes to pages
- Creating themed blog post templates
- Styling project showcase pages
- Generating complementary color schemes

**Workflow:**
```bash
/theme-factory

# Choose from pre-set themes:
# 1. Academic (blue/gray, serif fonts) - RECOMMENDED for this site
# 2. Technical (monospace, high contrast)
# 3. Minimalist (lots of whitespace, single accent)
# 4. Vibrant (bold colors, dynamic)
# 5. Custom theme generation

# Apply theme to:
# - HTML artifacts
# - Markdown with inline styles
# - Full page layouts
```

**Integration with Jekyll:**

After generating themed HTML with /theme-factory:
1. Extract color palette → add to `_sass/_variables.scss`
2. Extract typography → add to `_sass/_typography.scss`
3. Extract component styles → add to `_sass/_components.scss`
4. Maintain design system consistency

**Example Use Case:**

```bash
# Create themed project showcase page
/theme-factory

# Request: "Academic theme for a research project showcase page"
# Claude will generate themed HTML
# Then: Convert to Jekyll template in _layouts/project.html
```

#### /canvas-design - Visual Assets & Graphics

**Use for:**
- Hero images for blog posts
- Project thumbnails
- About page visuals
- Abstract background patterns
- Infographics for technical concepts

**Workflow:**
```bash
/canvas-design

# Claude will:
# 1. Create design philosophy
# 2. Generate museum-quality visual
# 3. Output as PNG or PDF

# Save outputs to: assets/images/
```

**Best Practices:**
- Use for sophisticated, abstract visuals (not literal illustrations)
- Place in `assets/images/[category]/`
- Optimize before committing: `imageoptim` or similar
- Reference in markdown: `![Alt text](/assets/images/your-image.png)`

#### /frontend-design - Component Development

**Use for:**
- Navigation components
- Blog post cards
- Project grid layouts
- Interactive elements
- Custom page layouts

**Workflow:**
```bash
/frontend-design

# Request: "Create a blog post card component with hover effects"
# Claude will generate production-grade HTML/CSS/JS
# Then: Convert to Jekyll include in _includes/
```

#### /xlsx - Data Visualization

**Use for:**
- Research data tables
- Project timeline spreadsheets
- Publication records
- Course history

**Workflow:**
```bash
/xlsx

# Create or analyze spreadsheet data
# Export to CSV, embed tables in markdown
```

#### /pdf - Document Generation

**Use for:**
- Downloadable resume/CV
- Research paper supplements
- Technical reports

**Workflow:**
```bash
/pdf

# Generate PDF from content
# Save to assets/downloads/
# Link from pages: [Download CV](/assets/downloads/cv.pdf)
```

### Content Update Git Workflow

**For new content (blog posts, projects):**

```bash
# 1. Create content branch
git checkout -b content/new-blog-post

# 2. Create markdown file
# Use /doc-coauthoring skill for drafting

# 3. Add images if needed
# Use /canvas-design for visual assets

# 4. Test locally
bundle exec jekyll serve --livereload
npx playwright test

# 5. Commit changes
git add .
git commit -m "Add blog post: [title]"

# 6. Push and create PR
git push origin content/new-blog-post
gh pr create --title "Add blog post: [title]" --body "New blog post about [topic]"

# 7. Review checks in PR
# - Jekyll build passes
# - Playwright tests pass
# - Lighthouse scores meet targets

# 8. Merge when ready
gh pr merge --squash
```

**For design updates:**

```bash
# 1. Create design branch
git checkout -b design/update-typography

# 2. Make changes to _sass/ files
# Use /theme-factory or /frontend-design skills

# 3. Test thoroughly
bundle exec jekyll build
# Check for Sass warnings

# 4. Visual regression testing
# Compare before/after screenshots

# 5. Commit and PR
git add _sass/
git commit -m "Update typography scale for better readability"
gh pr create --title "Design: Update typography" --body "Refines type scale..."
```

## Additional Recommended Skills

### /skill-creator - Extend Claude's Capabilities

**Use when:** You need specialized workflows repeated across the project.

**Example use cases:**
- Create a "blog-post-optimizer" skill for SEO optimization
- Create a "project-card-generator" skill for consistent project formatting
- Create a "citation-formatter" skill for academic references

```bash
/skill-creator

# Follow prompts to define:
# - Skill purpose
# - Tools needed
# - Workflow steps
# - Output format
```

### /internal-comms - Team Communication

**Use when:** Collaborating with others on the site.

**Example use cases:**
- Status updates on site development
- Feature proposals
- Bug reports
- Design decision documentation

### /webapp-testing - Advanced Testing

**Use when:** Playwright tests aren't sufficient.

**Example use cases:**
- Debugging complex JavaScript interactions
- Testing form submissions
- Capturing visual regressions
- Browser console debugging

```bash
/webapp-testing

# Interact with local Jekyll site
# Capture screenshots, logs, network activity
# Debug responsive design issues
```

## Deployment Checklist

Before launching to production:

### Content Completeness

- [ ] All required pages created (index, about, resume, research, blog index)
- [ ] At least 2-3 blog posts published
- [ ] All projects documented in `_projects/`
- [ ] 404 page exists and styled
- [ ] Footer links work (social media, contact)

### Technical Validation

- [ ] `bundle exec jekyll build` runs without errors/warnings
- [ ] No Sass deprecation warnings
- [ ] All Playwright tests pass: `npx playwright test`
- [ ] Lighthouse scores 90+ on all core metrics
- [ ] HTML validates (semantic structure)
- [ ] All internal links work
- [ ] External links have `rel="noopener"`

### Design & UX

- [ ] Design system implemented consistently
- [ ] Typography scale applied correctly
- [ ] Color palette matches specification
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Navigation functional on all screen sizes
- [ ] Hover/focus states on interactive elements
- [ ] Loading performance < 2s

### Accessibility

- [ ] WCAG AA contrast ratios met
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (test with VoiceOver)
- [ ] Alt text on all images
- [ ] Semantic HTML structure
- [ ] ARIA labels where needed

### SEO & Meta

- [ ] Meta descriptions on all pages
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Sitemap generated (`sitemap.xml`)
- [ ] Robots.txt configured
- [ ] Favicon present

### GitHub Actions

- [ ] `.github/workflows/jekyll-deploy.yml` created
- [ ] `.github/workflows/pr-preview.yml` created
- [ ] Workflows tested with a PR
- [ ] GitHub Pages configured in repository settings
- [ ] Custom domain configured (if applicable)

### Post-Launch Monitoring

- [ ] Google Search Console configured
- [ ] Google Analytics added (optional)
- [ ] Monitor GitHub Actions for build failures
- [ ] Test site on multiple devices/browsers
- [ ] Review Lighthouse reports weekly

## Tool Reference Summary

| Task | Primary Skill | Secondary Skill |
|------|---------------|-----------------|
| **Write blog posts** | `/doc-coauthoring` | `/internal-comms` |
| **Create visual assets** | `/canvas-design` | `/frontend-design` |
| **Style pages/components** | `/theme-factory` | `/frontend-design` |
| **Design UI components** | `/frontend-design` | `/design-principles` |
| **Test website functionality** | Playwright (`npx playwright test`) | `/webapp-testing` |
| **Generate PDFs** | `/pdf` | `/docx` |
| **Work with data/tables** | `/xlsx` | - |
| **Create custom workflows** | `/skill-creator` | - |
| **Optimize images** | `/web-asset-generator` | - |

## Quick Reference Commands

```bash
# Development
bundle exec jekyll serve --livereload    # Start dev server
bundle exec jekyll build                 # Build site
bundle exec jekyll clean                 # Clean build cache

# Testing
npx playwright test                      # Run functional tests
npx playwright test --headed             # Run with browser visible
lhci autorun                             # Run Lighthouse CI

# Deployment
git push origin main                     # Deploy to GitHub Pages
gh workflow run jekyll-deploy.yml        # Manually trigger workflow

# Skills
/doc-coauthoring                         # Technical writing
/theme-factory                           # Apply themes
/canvas-design                           # Create visuals
/frontend-design                         # Build components
/webapp-testing                          # Debug site
```

---

**Remember**: This site represents Scott Weeden's professional identity in computer science. Quality, precision, and attention to detail are paramount. Every commit should move toward a portfolio worthy of the research and academic excellence it showcases.
