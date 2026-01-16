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

### Course Data Dictionary

**Official Source**: `_data/courses.yaml` - This YAML file is the **single source of truth** for all course information. It rarely changes throughout the semester and should be used for course lookups instead of calling Canvas LMS.

**Course Naming Convention**:
- **User-facing content**: Use `display_name` only (e.g., "Cryptography", "Software Verification and Validation")
- **NEVER include course numbers** (e.g., CS-6343) in blog titles, page headers, or navigation
- Course numbers and Canvas IDs are for **internal agent use only**
- See `.cursor/rules/course-naming-convention.mdc` for detailed guidelines

**Current Courses** (from `_data/courses.yaml`):

| Display Name | Slug | Status |
|--------------|------|--------|
| Cryptography | cryptography | Active (Spring 2026) |
| Software Verification and Validation | software-verification | Active (Spring 2026) |
| Intelligent Systems | intelligent-systems | Completed (Fall 2025) |
| Logic for Computer Scientists | logic-for-computer-scientists | Completed (Fall 2025) |
| Theory of Automata | theory-of-automata | Completed (Fall 2025) |

**Jekyll Usage**:
```liquid
{% assign course = site.data.courses | where: "slug", "cryptography" | first %}
{{ course.display_name }}  <!-- "Cryptography" -->
```

**Landing Pages**: `_courses/` collection contains course landing pages with recent drafts, projects, and posts

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

**"Academic Minimalism with Technical Precision"** - Inspired by Linear, Notion, and Stripe. The site uses a clean, research-forward styling optimized for long-form engineering writeups and series. MathJax and Mermaid are used throughout for mathematical notation and diagrams.

### Color Palette

**Primary Colors**:
- `$color-primary`: `#2446b5` (Cobalt Blue) - Primary links, CTAs, interactive elements
- `$color-primary-dark`: `#152a73` (Midnight Blue) - Hover states, darkened variants
- `$color-primary-light`: `#e5e9ff` (Mist Blue) - Light backgrounds, subtle accents
- `$color-accent-purple`: `#5a4fff` (Electric Indigo) - Special highlights, featured content
- `$color-accent-cyan`: `#3cd0d3` (Bright Cyan) - Inline badges, data points, accents

**Neutral Grays** (Matte paper aesthetic):
- `$color-text-primary`: `#0d1329` (Deep Ink) - Main body text, headlines
- `$color-text-secondary`: `#344054` (Neutral 600) - Secondary text, captions, metadata
- `$color-text-tertiary`: `#6b7280` (Neutral 500) - Tertiary text, placeholders, disabled states
- `$color-bg-primary`: `#f6f8fb` (Soft Paper) - Main page background
- `$color-bg-secondary`: `#eef1f8` (Light Gray) - Section backgrounds, card backgrounds
- `$color-bg-tertiary`: `#e6ebf5` (Lighter Gray) - Code blocks, callout boxes
- `$color-border`: `#d6deec` (Soft Border) - Primary borders and dividers
- `$color-border-light`: `#e9eef7` (Subtle Border) - Lighter borders for nested elements

**Semantic Accent Colors**:
- `$color-accent-green`: `#10b981` (Success Green) - Success states, completed items, achievements
- `$color-accent-orange`: `#f59e0b` (Warning Orange) - Warnings, highlights, in-progress states
- `$color-accent-red`: `#ef4444` (Error Red) - Errors, critical information, destructive actions

**Code Syntax Colors** (Minimalist theme):
- Background: `#f8fafc` (Very Light Blue-Gray)
- Text: `#1e293b` (Dark Slate)
- Keywords: `#7c3aed` (Purple)
- Strings: `#059669` (Green)
- Comments: `#94a3b8` (Gray)
- Functions: `#2563eb` (Blue)

### Typography

**Font Families**:
- **Headings**: `"Space Grotesk", "IBM Plex Sans", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
  - Geometric sans-serif for headlines and display text
  - Technical, modern aesthetic
- **Body**: `"IBM Plex Sans", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
  - Clean, readable sans-serif for body copy
  - Optimized for long-form technical content
- **Monospace**: `"IBM Plex Mono", "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace`
  - Code blocks and inline code
  - High readability for technical content

**Type Scale** (Major Third - 1.250 ratio):
- `$font-size-h1`: 2.441rem (≈39px) - Page titles, hero headings
- `$font-size-h2`: 1.953rem (≈31px) - Section headers, major divisions
- `$font-size-h3`: 1.563rem (≈25px) - Subsection headers, card titles
- `$font-size-h4`: 1.25rem (20px) - Minor headings, prominent labels
- `$font-size-base`: 1rem (16px) - Body text, standard UI elements
- `$font-size-small`: 0.8rem (≈13px) - Captions, metadata, fine print

**Font Weights**:
- `$font-weight-normal`: 400 - Body text
- `$font-weight-medium`: 500 - Subtle emphasis
- `$font-weight-semibold`: 600 - Headings, strong emphasis
- `$font-weight-bold`: 700 - Major headings, high emphasis

**Line Heights**:
- `$line-height-heading`: 1.2 - Tight for headings
- `$line-height-body`: 1.6 - Comfortable for reading
- `$line-height-code`: 1.5 - Balanced for code blocks

**Typography Implementation Details**:
- Headings use negative letter-spacing (-0.01em to -0.02em) for tighter, modern look
- Links have 2px underline with 3px offset, using rgba opacity for subtle effect
- Code blocks have rounded corners (6px) and subtle shadows for depth
- All text is anti-aliased for smooth rendering

### Spacing System

**8px Grid System** (All spacing follows 4px/8px increments):
- `$space-xs`: 0.25rem (4px) - Micro spacing, tight gaps
- `$space-sm`: 0.5rem (8px) - Small spacing, list items
- `$space-md`: 1rem (16px) - Standard spacing, paragraph margins
- `$space-lg`: 1.5rem (24px) - Large spacing, section gaps
- `$space-xl`: 2rem (32px) - Extra large, major sections
- `$space-2xl`: 3rem (48px) - Double XL, page sections
- `$space-3xl`: 4rem (64px) - Triple XL, hero sections
- `$space-4xl`: 6rem (96px) - Quadruple XL, major divisions

**Grid Usage**:
- Use for all margins, padding, and gaps
- Maintain vertical rhythm throughout the site
- All element spacing should be divisible by 4px minimum

### Layout

**Content Widths**:
- `$max-width-content`: 768px - Optimal reading width for blog posts and articles
- `$max-width-wide`: 1200px - Wide layouts for project grids and dashboards

**Responsive Breakpoints**:
- `$breakpoint-mobile`: 375px - Minimum mobile width
- `$breakpoint-tablet`: 768px - Tablet and up
- `$breakpoint-desktop`: 1024px - Desktop and up
- `$breakpoint-wide`: 1440px - Wide desktop displays

**Responsive Padding** (Adapts to viewport):
- Mobile: `$padding-mobile` = 24px
- Tablet: `$padding-tablet` = 48px
- Desktop: `$padding-desktop` = 64px

**Header**:
- Height: 64px fixed
- Position: Sticky top, z-index 1020
- Background: Blurred backdrop with gradient overlay
- Border: 1px bottom border

**Footer**:
- Padding: 64px vertical
- Background: `$color-bg-secondary`
- Border: 1px top border
- Grid: 3-column on desktop, stacked on mobile

### Border Radius Scale

- `$border-radius-sm`: 4px - Tight radius for small elements (badges, tags)
- `$border-radius-md`: 6px - Standard radius for buttons, inputs
- `$border-radius-lg`: 8px - Large radius for cards, modals
- `$border-radius-xl`: 12px - Extra large for hero sections

### Shadow System

**Elevation Levels**:
- `$shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.05)` - Subtle elevation
- `$shadow-md`: `0 1px 3px rgba(0, 0, 0, 0.1)` - Medium elevation
- `$shadow-lg`: `0 4px 6px rgba(0, 0, 0, 0.07)` - High elevation
- `$shadow-xl`: `0 10px 15px rgba(0, 0, 0, 0.1)` - Extra high elevation

**Component Shadows**:
- `$shadow-card`: `0 1px 3px rgba(0, 0, 0, 0.05)` - Default card shadow
- `$shadow-card-hover`: `0 4px 12px rgba(0, 0, 0, 0.1)` - Card hover state
- Code blocks: `0 12px 30px rgba($color-primary-dark, 0.08)` - Deep shadow with primary tint

### Transitions & Animation

**Timing Functions**:
- `$transition-fast`: 100ms ease - Quick interactions (hover, focus)
- `$transition-base`: 150ms ease - Standard UI transitions
- `$transition-slow`: 300ms ease - Larger movements, reveals

**Common Transitions**:
- Button hover: `translateY(-1px)` with shadow increase
- Card hover: `translateY(-2px)` or `translateY(-4px)` with shadow
- Link hover: Color change + underline opacity change
- All transitions use `ease` easing for natural feel

### Components

**Cards** (`.card` class):
- Background: `linear-gradient(160deg, rgba($color-bg-secondary, 0.9), rgba($color-bg-primary, 0.95))`
- Border: 1px solid `$color-border`
- Border radius: 8px (`$border-radius-lg`)
- Padding: 32px (`$space-xl`)
- Shadow: `$shadow-card` at rest, `$shadow-card-hover` on hover
- Hover: `transform: translateY(-2px)` + shadow increase
- Transition: 150ms ease (all properties)

**Buttons** (`.btn` class):
- **Primary** (`.btn--primary`):
  - Background: `linear-gradient(135deg, $color-primary, $color-primary-dark)`
  - Color: White
  - Hover: Darker background + `translateY(-1px)`
- **Secondary** (`.btn--secondary`):
  - Background: `rgba($color-primary, 0.05)`
  - Border: 1px `rgba($color-primary, 0.25)`
  - Hover: Darker background + `translateY(-1px)`
- Padding: 10px 20px (standard), 14px 28px (large), 6px 12px (small)
- Border radius: 6px
- Font: 0.875rem, medium weight (500)
- Transition: 100ms ease

**Links** (`a` elements):
- Color: `$color-primary` (#2446b5)
- Underline: 2px thickness, 3px offset, `rgba($color-primary, 0.35)` color
- Hover: `$color-primary-dark` with increased underline opacity (0.5)
- Focus: 2px outline with `rgba($color-primary, 0.3)`, 2px offset
- Transition: 100ms ease on color and underline

**Hero Section** (`.hero` class):
- Min height: clamp(600px, 80vh, 800px)
- Diagonal accent: Rotated gradient overlay (12deg rotation)
- Background: Linear gradient + optional pattern overlay
- Grid: 2fr 1fr on desktop, stacked on mobile
- Padding: 96px vertical, responsive horizontal

**Navigation** (`.site-nav`):
- Hidden on mobile (< 768px), shown on tablet+
- Links: 15px font, medium weight, no underline
- Hover: 2px bottom border with primary color
- Active: Primary color with solid bottom border
- Gap: 32px between items

**Code Blocks** (`pre` and `code`):
- Background: `$color-bg-tertiary` (#e6ebf5)
- Border: 1px solid `rgba($color-primary-dark, 0.12)`
- Border radius: 6px
- Padding: 24px (blocks), 2px 6px (inline)
- Font: 0.9rem (14px), `$font-family-mono`
- Shadow: `0 12px 30px rgba($color-primary-dark, 0.08)` (blocks only)
- Inline code has border: 1px `rgba($color-primary, 0.1)`

**Tables**:
- Width: 100%
- Border collapse: collapse
- Cell padding: 16px
- Header: Semibold text, `$color-bg-secondary` background
- Borders: 1px bottom border on cells, `$color-border`

### Visual Effects

**Background Gradients**:
- **Body**:
  ```scss
  background: radial-gradient(circle at 18% 12%, rgba($color-primary, 0.08), transparent 26%),
              radial-gradient(circle at 82% 0%, rgba($color-accent-cyan, 0.12), transparent 22%),
              $color-bg-primary;
  ```
- **Hero Diagonal Accent**: Rotated gradient with 40% opacity
- **Research Section**: Dark gradient (`color.scale($color-primary, $lightness: -75%)` to -85%)
- **Cards**: Subtle gradient from secondary to primary background colors

**Z-Index Scale**:
- `$z-index-dropdown`: 1000
- `$z-index-sticky`: 1020 (header)
- `$z-index-fixed`: 1030
- `$z-index-modal-backdrop`: 1040
- `$z-index-modal`: 1050
- `$z-index-popover`: 1060
- `$z-index-tooltip`: 1070

### UI Design Guidelines

**When creating or modifying UI components**:

1. **Use Design Tokens** (CRITICAL):
   - NEVER hardcode colors, spacing, or typography values
   - Always reference SASS variables from `_sass/_variables.scss`
   - Examples: Use `$color-primary` not `#2446b5`, `$space-lg` not `24px`

2. **Maintain Visual Consistency**:
   - Follow existing component patterns in `_sass/_components.scss`
   - Use established border-radius scale (4px, 6px, 8px, 12px)
   - Apply consistent shadow system for elevation
   - Match transition timings across similar interactions

3. **Responsive Design** (Mobile-First):
   - Start with mobile styles, enhance for larger screens
   - Use media queries with established breakpoints (768px, 1024px, 1440px)
   - Test all viewports: 375px (mobile), 768px (tablet), 1024px+ (desktop)
   - Hide/show elements appropriately (e.g., mobile menu vs desktop nav)

4. **Accessibility Standards** (WCAG AA Compliance):
   - **Color Contrast**: Minimum 4.5:1 for body text, 3:1 for large text
   - **Focus States**: All interactive elements must have visible focus indicators
   - **Keyboard Navigation**: Ensure tab order is logical and complete
   - **Semantic HTML**: Use proper heading hierarchy (h1→h2→h3), landmarks, ARIA labels
   - **Touch Targets**: Minimum 44x44px for mobile interactive elements

5. **Visual Hierarchy**:
   - Use type scale consistently (h1: 2.441rem, h2: 1.953rem, h3: 1.563rem, etc.)
   - Apply spacing system for vertical rhythm (all spacing divisible by 4px)
   - Use color purposefully:
     - Primary blue for CTAs and important links
     - Secondary gray for supporting text and metadata
     - Accent colors for semantic meaning (green=success, red=error, orange=warning)

6. **Interaction Polish**:
   - Add transitions to all interactive elements (100-150ms for most, 300ms for large movements)
   - Use shadows sparingly for depth (cards, modals, elevated elements)
   - Apply hover states that provide clear feedback:
     - Links: Color darkens, underline increases
     - Buttons: Lift with `translateY(-1px)` + shadow
     - Cards: Lift with `translateY(-2px)` + larger shadow
   - Maintain consistent border-radius across similar elements

7. **Typography Best Practices**:
   - Headings: Space Grotesk with negative letter-spacing
   - Body: IBM Plex Sans with 1.6 line-height for readability
   - Code: IBM Plex Mono with 1.5 line-height
   - Keep line lengths between 60-80 characters for optimal readability

**File Structure**:
- `_sass/_variables.scss` - **Design tokens** (colors, spacing, typography, breakpoints) - THE SOURCE OF TRUTH
- `_sass/_typography.scss` - Typography styles, heading hierarchy, text elements
- `_sass/_layout.scss` - Layout and structural styles, header, footer, navigation
- `_sass/_components.scss` - Reusable component styles (cards, buttons, badges, etc.)
- `_sass/_homepage.scss` - Homepage-specific styles (hero, sections, grids)
- `assets/css/main.scss` - Main stylesheet entry point (imports all partials)

**Workflow for UI Changes**:
1. **Research**: Review existing components in `_sass/_components.scss` for similar patterns
2. **Reference**: Check design tokens in `_sass/_variables.scss` for colors, spacing, etc.
3. **Implement**: Write styles using design system variables
4. **Test Responsive**: Verify behavior at 375px, 768px, 1024px, and 1440px widths
5. **Test Interactions**: Verify hover, focus, and active states work correctly
6. **Validate Accessibility**: Check color contrast, keyboard navigation, focus indicators
7. **Verify Spacing**: Ensure all spacing follows 4px/8px grid system
8. **Cross-browser**: Test in Chrome, Firefox, Safari if making complex changes

**Quality Checklist** (before committing UI changes):
- [ ] All colors use SASS variables (no hex codes in component files)
- [ ] All spacing follows 4px/8px grid system
- [ ] Typography uses type scale variables
- [ ] Responsive at all breakpoints (mobile, tablet, desktop)
- [ ] Hover/focus states present and smooth
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Transitions are smooth (100-300ms)
- [ ] No layout shift on load or interaction
- [ ] Consistent with existing design patterns

---

## UI Designer Skills Usage

**Apply professional UI/UX designer skills when working on this site**:

### Core Design Principles

1. **Visual Consistency** - Unified Design Language:
   - All components must follow the established "Academic Minimalism with Technical Precision" aesthetic
   - Maintain consistent visual weight, spacing, and proportions across pages
   - Use the design system as the single source of truth
   - New patterns must harmonize with existing ones

2. **Design Token Discipline**:
   - ZERO tolerance for hardcoded values (colors, spacing, typography)
   - All styles must reference SASS variables from `_variables.scss`
   - This ensures maintainability, consistency, and theme-ability

3. **Component-First Thinking**:
   - Audit `_sass/_components.scss` before creating new components
   - Reuse and extend existing patterns (cards, buttons, badges, etc.)
   - Create new components only when existing ones cannot be adapted
   - Document new component patterns for future reuse

4. **Responsive & Adaptive Design**:
   - Mobile-first approach (start at 375px, scale up)
   - Fluid typography and spacing where appropriate
   - Test at all breakpoints: 375px, 768px, 1024px, 1440px
   - Consider touch targets on mobile (minimum 44x44px)

5. **Accessibility as Standard** (WCAG AA):
   - Color contrast: 4.5:1 for text, 3:1 for large text/UI elements
   - Focus indicators: Visible, high-contrast outlines on all interactive elements
   - Keyboard navigation: Logical tab order, no keyboard traps
   - Semantic HTML: Proper heading hierarchy, landmarks, ARIA where needed
   - Screen reader testing for complex interactions

6. **Interaction Design & Microinteractions**:
   - Smooth transitions: 100-150ms for quick feedback, 300ms for larger movements
   - Clear hover states: Visual feedback on all interactive elements
   - Loading states: Show progress for async operations
   - Error states: Clear, helpful error messages
   - Empty states: Guide users when no content exists

7. **Typography as UI**:
   - Establish clear information hierarchy with type scale
   - Maintain optimal line lengths (60-80 characters)
   - Use appropriate line heights (1.6 for body, 1.2 for headings)
   - Leverage font weights for emphasis (not just bold/regular)

8. **Spacing & Rhythm**:
   - Follow 8px grid system religiously (4px for micro-spacing)
   - Create vertical rhythm with consistent spacing between sections
   - Use white space intentionally to guide user attention
   - Maintain balanced layouts with appropriate padding/margins

### Workflow for New UI Features

**Phase 1 - Research & Planning**:
1. Understand the user need and design requirements
2. Audit existing components for reusable patterns
3. Sketch or wireframe the solution (low-fidelity first)
4. Identify design tokens needed (colors, spacing, typography)

**Phase 2 - Implementation**:
1. Write semantic HTML structure
2. Apply styles using design system tokens
3. Implement responsive behavior (mobile → desktop)
4. Add interactive states (hover, focus, active, disabled)

**Phase 3 - Polish & Validation**:
1. Fine-tune spacing, alignment, visual hierarchy
2. Test across all breakpoints
3. Validate accessibility (contrast, keyboard, screen reader)
4. Review against design system checklist
5. Get feedback and iterate

### Quality Standards for UI Work

**Before marking UI work as "complete"**:
- [ ] Visually consistent with existing site aesthetic
- [ ] Uses design tokens exclusively (no hardcoded values)
- [ ] Responsive across all breakpoints (tested)
- [ ] Accessible (WCAG AA contrast, keyboard nav, focus states)
- [ ] Smooth interactions (appropriate transitions/animations)
- [ ] Follows 8px spacing grid system
- [ ] Typography uses established type scale
- [ ] Hover/focus states provide clear feedback
- [ ] No layout shift on load or interaction
- [ ] Cross-browser compatible (Chrome, Firefox, Safari)
- [ ] Performance optimized (no excessive animations, efficient CSS)

---

## Communication Guidelines

- Use clear, descriptive commit messages
- Document assumptions and design decisions
- Flag blockers or ambiguities early
- Share progress updates regularly
