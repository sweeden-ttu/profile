# Project Overview - Jekyll Static Site

## Site Summary

This is a **static Jekyll site** hosted on **GitHub Pages**. The site serves as a personal academic profile and blog for Scott Weeden, a Master of Computer Science student at Texas Tech University.

### Site Architecture

- **Framework**: Jekyll 4.x static site generator
- **Hosting**: GitHub Pages (automatically builds and deploys on push)
- **Build Output**: Generated files go to `_site/` directory (excluded from git)
- **Source Files**: Content in `_posts/`, `_projects/`, `_courses/`, `_drafts/`, etc.

### Local Development

```bash
# Build the site locally
bundle exec jekyll build

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Production build
JEKYLL_ENV=production bundle exec jekyll build
```

**Important**: Always work with source files, never commit `_site/` directory (it's in `.gitignore`).

---

## Summary of AGENTS.md

### Current Context: Spring 2026 Semester

- **Active Courses**: CS-6343 Cryptography, CS-5374 Software Verification and Validation
- **Focus**: Course progression, mid-semester deadlines, final project planning
- **Integration**: Cross-course concept integration

### Key Workflow Principles

1. **Parallel Processing**: Multiple agents can work simultaneously
2. **Cross-Review**: Agents review each other's work
3. **Iterative Refinement**: Multiple drafts with feedback loops
4. **Documentation First**: Always document approach and decisions

### Quality Standards

- **Code**: Well-documented, tested, follows conventions
- **Documentation**: Clear and comprehensive
- **Projects**: Complete with examples and learning outcomes
- **Blog Posts**: 15-minute reading time, well-structured, with diagrams

### Canvas LMS Integration

**Blog posts must follow Canvas course materials**:

1. **Access Materials**: Use Canvas LMS MCP tools (`canvas_list_courses`, `canvas_get_modules`, `canvas_list_module_items`, `canvas_get_file_download_url`)
2. **Extract Content**: Parse lecture notes and module materials from Canvas using PDF skills
3. **Create Posts**: Use course info from `_courses/` collection, reference module numbers and lecture dates. Update the recent drafts, projects and posts collections anytime a blog post is Published
4. **Quality**: Accurately reflect Canvas content, maintain academic integrity, cite sources

### Courses Collection

Located in `_courses/`, contains course metadata synced from Canvas:
- Course name, short name (e.g., "CS-6343"), Canvas course ID
- Tags, semester, status, enrollment term ID
- Each course landing page shows recent drafts, projects, and posts

**Current Spring 2026 Courses**:
- **CS-6343 Cryptography** (Canvas ID: 70714)
- **CS-5374 Software Verification and Validation** (Canvas ID: 70713)

### Jekyll Build Configuration

- **Build Output**: `_site/` directory (never commit this)
- **Source Collections**: `_posts`, `_projects`, `_courses`, `_drafts`
- **Pre-push Hook**: Git hook requires successful `bundle exec jekyll build` before allowing push

### Active Project: Tor Network Puzzle Challenge

**Status**: Active Development
**Tech Stack**: Python, Tor Browser, Web Scraping, Network Security

**Key Constraint**: JavaScript must be disabled - all interactions via pure HTML/CSS

**Objectives**:
- Navigate Tor network (`.onion` sites)
- Parse and solve HTML-based puzzles without JavaScript
- Automate Tor Browser interactions
- Maintain security and privacy

### Project Workflow

**When working on projects**:
1. Start with research
2. Prototype early
3. Iterate based on feedback
4. Document as you go
5. Create test suites
6. Get peer review

**When encountering blockers**:
- Document the issue clearly
- Research solutions
- Propose alternatives
- Seek input from other agents

---

## Quick Reference

- **Build Command**: `bundle exec jekyll build`
- **Local Server**: `bundle exec jekyll serve --livereload`
- **Canvas Tools**: Use `canvas-lms-mcp` server for course materials
- **Course Info**: Check `_courses/` collection files
- **Blog Instructions**: See `BLOG_POST_GENERATION_INSTRUCTIONS.md`
- **Git Hooks**: Pre-push hook validates Jekyll build before push

---

## Design System & UI Guidelines

### Design Philosophy

**"Academic Minimalism with Technical Precision"** - Inspired by Linear, Notion, and Stripe. The site uses a clean, research-forward styling optimized for long-form engineering writeups and series. MathJax and Mermaid are used throughout.

### Color Palette

**Primary Colors**:
- `$color-primary`: #2446b5 (Cobalt) - Links, CTAs
- `$color-primary-dark`: #152a73 (Midnight) - Hover states
- `$color-primary-light`: #e5e9ff (Mist Blue) - Backgrounds
- `$color-accent-purple`: #5a4fff (Electric Indigo) - Highlights
- `$color-accent-cyan`: #3cd0d3 (Cyan) - Inline badges, data points

**Neutral Grays** (Matte paper aesthetic):
- `$color-text-primary`: #0d1329 (Deep ink) - Headlines, body text
- `$color-text-secondary`: #344054 (Neutral 600) - Captions, metadata
- `$color-text-tertiary`: #6b7280 (Neutral 500) - Placeholders
- `$color-bg-primary`: #f6f8fb (Soft paper) - Main background
- `$color-bg-secondary`: #eef1f8 - Section slabs, cards
- `$color-bg-tertiary`: #e6ebf5 - Code blocks, callouts
- `$color-border`: #d6deec - Clean dividers

**Accent Colors**:
- Green (#10b981): Success, achievements
- Orange (#f59e0b): Highlights, warnings
- Red (#ef4444): Errors, critical info

### Typography

**Font Families**:
- **Headings**: "Space Grotesk", "IBM Plex Sans", "Inter" - Geometric sans for headlines
- **Body**: "IBM Plex Sans", "Inter" - Technical body copy
- **Monospace**: "IBM Plex Mono", "JetBrains Mono" - Code blocks

**Type Scale** (Major Third - 1.250):
- H1: 2.441rem (39px) - Page titles
- H2: 1.953rem (31px) - Section headers
- H3: 1.563rem (25px) - Subsection headers
- H4: 1.25rem (20px) - Card titles
- Base: 1rem (16px) - Standard text
- Small: 0.8rem (13px) - Captions, metadata

**Line Heights**:
- Headings: 1.2
- Body: 1.6
- Code: 1.5

### Spacing System

**8px base unit**:
- `$space-xs`: 4px
- `$space-sm`: 8px
- `$space-md`: 16px
- `$space-lg`: 24px
- `$space-xl`: 32px
- `$space-2xl`: 48px
- `$space-3xl`: 64px
- `$space-4xl`: 96px

### Layout

**Content Widths**:
- `$max-width-content`: 768px (Reading comfort)
- `$max-width-wide`: 1200px (Wide content, project grids)

**Responsive Breakpoints**:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

**Padding**:
- Mobile: 24px
- Tablet: 48px
- Desktop: 64px

### Components

**Cards**:
- Gradient background: `linear-gradient(160deg, rgba($color-bg-secondary, 0.9), rgba($color-bg-primary, 0.95))`
- Border: 1px solid `$color-border`
- Border radius: `$border-radius-lg` (8px)
- Shadow: `$shadow-card` with hover state `$shadow-card-hover`
- Hover: `translateY(-2px)` transform

**Buttons**:
- Primary: Gradient from `$color-primary` to `$color-primary-dark`
- Secondary: Light background with border
- Transitions: `$transition-fast` (100ms ease)

**Links**:
- Color: `$color-primary`
- Underline: 2px thickness, 3px offset
- Hover: Darker color with increased underline opacity

### Visual Effects

**Background Gradients**:
- Body: Radial gradients with primary and cyan accents at specific positions
- Hero sections: Linear gradients with pattern overlays
- Cards: Subtle gradients for depth

**Shadows**:
- Cards: `0 1px 3px rgba(0, 0, 0, 0.05)`
- Card hover: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Code blocks: `0 12px 30px rgba($color-primary-dark, 0.08)`

**Transitions**:
- Fast: 100ms ease
- Base: 150ms ease
- Slow: 300ms ease

### UI Design Guidelines

**When creating or modifying UI components**:

1. **Use Design Tokens**: Always reference variables from `_sass/_variables.scss` - never hardcode colors, spacing, or typography values
2. **Maintain Consistency**: Follow existing component patterns in `_sass/_components.scss`
3. **Responsive Design**: Use breakpoint mixins and ensure mobile-first approach
4. **Accessibility**:
   - Maintain proper contrast ratios (text meets WCAG AA)
   - Include focus states for interactive elements
   - Use semantic HTML
5. **Visual Hierarchy**:
   - Use type scale consistently
   - Apply spacing system for rhythm
   - Use color purposefully (primary for CTAs, secondary for metadata)
6. **Polish**:
   - Add subtle transitions for interactions
   - Use shadows sparingly for depth
   - Maintain clean borders and rounded corners
   - Ensure hover states provide clear feedback

**File Structure**:
- `_sass/_variables.scss` - Design tokens (colors, spacing, typography, breakpoints)
- `_sass/_typography.scss` - Typography styles
- `_sass/_layout.scss` - Layout and structural styles
- `_sass/_components.scss` - Reusable component styles
- `_sass/_homepage.scss` - Homepage-specific styles
- `assets/css/main.scss` - Main stylesheet (imports all partials)

**Before making UI changes**:
1. Review existing components for similar patterns
2. Check design tokens in `_variables.scss`
3. Ensure responsive behavior across breakpoints
4. Test hover/focus states
5. Verify color contrast and accessibility
6. Maintain consistent spacing using the 8px system

---

## UI Designer Skills Usage

**When working on this site, apply UI designer skills to ensure**:

- **Visual Consistency**: All new components, pages, and modifications should follow the established design system
- **Design Token Usage**: Always use SASS variables from `_variables.scss` - never hardcode values
- **Component Reusability**: Leverage existing component patterns before creating new ones
- **Responsive Design**: Ensure all UI works across mobile, tablet, and desktop breakpoints
- **Accessibility**: Maintain WCAG AA compliance, proper focus states, and semantic HTML
- **Polish & Details**: Add appropriate transitions, shadows, and hover states for professional feel
- **Typography Hierarchy**: Use the type scale consistently for clear information hierarchy
- **Spacing Rhythm**: Follow the 8px spacing system for visual consistency

**If creating new UI elements**:
1. Check `_sass/_components.scss` for similar patterns first
2. Use design tokens from `_variables.scss`
3. Follow the spacing and typography scales
4. Ensure responsive behavior
5. Add appropriate hover/focus states
6. Test accessibility (contrast, keyboard navigation)

---

## Communication Guidelines

- Use clear, descriptive commit messages
- Document assumptions and design decisions
- Flag blockers or ambiguities early
- Share progress updates regularly
