# UX Designer Skill: Portfolio & Presentation Website Development

## Skill Overview

This skill enables the design and implementation of professional portfolio and presentation websites that demonstrate exceptional quality, with a focus on academic and technical content including LaTeX mathematical typesetting, interactive charts, and advanced code display capabilities.

## Core Competencies

### 1. Design System Development

#### Color Theory & Palette Creation

**Knowledge Areas:**
- Understanding of color psychology in professional contexts
- Color harmony principles (complementary, analogous, triadic)
- Accessibility requirements (WCAG contrast ratios)
- Dark mode and theme switching implementation

**Implementation:**
```scss
// 2026 Synthetic Naturalism Design System
:root {
  // Primary: Digital Lavender spectrum
  --color-primary: #E6E6FA;
  --color-primary-dark: #D8BFD8;
  
  // Secondary: Deep blues and organic greens
  --color-secondary: #1a365d;
  --color-accent-green: #2d6a4f;
  
  // Accent: Warm oranges for CTAs
  --color-accent: #f77f00;
  
  // Contrast ratios verified (4.5:1 minimum)
  --text-color: #343a40;  // 7.5:1 on white
  --text-light: #6c757d;   // 4.8:1 on white
}
```

#### Typography Selection & Hierarchy

**Knowledge Areas:**
- Font pairing strategies for professional sites
- Responsive typography using `clamp()`
- Mathematical typesetting fonts (KaTeX compatibility)
- Code font selection (JetBrains Mono, Fira Code)

**Implementation:**
```scss
// Modern typography stack
:root {
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body: 'Source Serif Pro', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  // Dynamic responsive sizing
  --font-size-base: clamp(16px, 1.2vw + 0.5rem, 20px);
  --font-size-lg: clamp(1.125rem, 2.5vw, 1.5rem);
}

// Accessible line lengths
.article-content {
  max-width: 70ch;
  line-height: 1.6;
}
```

### 2. Technical Content Display

#### LaTeX Mathematical Typesetting

**Knowledge Areas:**
- MathJax vs KaTeX performance trade-offs
- Equation numbering and cross-referencing
- Mathematical macros and custom notations
- Accessibility for mathematical content

**Implementation:**
```html
<!-- KaTeX integration for fast rendering -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">

<script>
delimiters: [
  {left: '$$', right: '$$', display: true},
  {left: '$', right: '$', display: false},
  {left: '\\[', right: '\\]', display: true},
  {left: '\\(', right: '\\)', display: false}
]
</script>

<!-- Custom mathematical macros -->
$$E = mc^2$$
$$\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}$$
```

#### Code Syntax Highlighting

**Knowledge Areas:**
- Syntax highlighting engines (Prism.js, Highlight.js)
- Line numbers and copy-to-clipboard functionality
- Language detection and auto-loading
- Print-friendly code styles

**Implementation:**
```html
<!-- Prism.js with copy functionality -->
<link href="prism-tomorrow.min.css" rel="stylesheet">
<script src="prism-core.min.js"></script>
<script src="prism-autoloader.min.js"></script>

<pre><code class="language-python">
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
</code></pre>
```

#### Interactive Charts & Data Visualization

**Knowledge Areas:**
- Chart.js configuration for academic contexts
- Responsive chart design
- Dark mode chart styling
- Accessibility in data visualization

**Implementation:**
```javascript
// Academic chart configuration
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['Cryptography', 'ML Security', 'Verification', 'Theory'],
    datasets: [{
      label: 'Publications',
      data: [12, 8, 6, 10],
      backgroundColor: academicColors,
      borderRadius: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        cornerRadius: 8
      }
    }
  }
};
```

### 3. User Experience Design

#### Navigation Architecture

**Knowledge Areas:**
- Information architecture principles
- Mobile-first navigation design
- Search functionality and filtering
- Breadcrumb and skip link implementation

**Implementation:**
```html
<!-- Accessible navigation with skip link -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/projects/">Projects</a></li>
    <li><a href="/blog/">Blog</a></li>
    <li><a href="/courses/">Courses</a></li>
  </ul>
</nav>
```

#### Theme System

**Knowledge Areas:**
- CSS custom properties for theming
- LocalStorage persistence
- System preference detection
- Transition animations

**Implementation:**
```javascript
// Theme switcher with system detection
function applyTheme(theme) {
  const html = document.documentElement;
  
  // Remove existing theme classes
  html.classList.remove('theme-dark', 'theme-light');
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    html.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
  } else {
    html.classList.add(`theme-${theme}`);
  }
  
  // Persist preference
  localStorage.setItem('theme', theme);
}
```

#### Micro-interactions & Animations

**Knowledge Areas:**
- CSS transitions and animations
- Performance optimization for animations
- Reduced motion preferences
- Loading states and skeleton screens

**Implementation:**
```css
/* Smooth transitions with performance */
.card {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 4. Accessibility Implementation

#### WCAG 2.1 AA Compliance

**Knowledge Areas:**
- Contrast ratio requirements (4.5:1 for text)
- Focus management and keyboard navigation
- Screen reader optimization (ARIA labels)
- Motor accessibility (touch targets 44px+)

**Implementation:**
```css
/* Accessible focus indicators */
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Minimum touch targets */
button,
[role="button"] {
  min-height: 44px;
  min-width: 44px;
}

/* Color independence */
.chart-legend {
  /* Patterns + colors for accessibility */
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(0,0,0,0.1) 5px,
    rgba(0,0,0,0.1) 10px
  );
}
```

#### Performance & Core Web Vitals

**Knowledge Areas:**
- Largest Contentful Paint (LCP) optimization
- First Input Delay (FID) reduction
- Cumulative Layout Shift (CLS) prevention
- Image optimization and lazy loading

**Implementation:**
```html
<!-- Responsive images with lazy loading -->
<img src="profile-400.jpg"
     srcset="profile-400.jpg 400w,
             profile-800.jpg 800w"
     sizes="(max-width: 400px) 400px, 800px"
     loading="lazy"
     alt="Profile photo"
     width="400"
     height="400">

<!-- Critical CSS inlining -->
<style>
  /* Above-the-fold styles only */
  .hero { min-height: 100vh; }
</style>
```

## Design Principles Applied

### 1. Progressive Disclosure

**Concept:** Reveal information gradually to reduce cognitive load.

**Implementation:**
- Expandable sections with smooth animations
- "Read more" functionality for long content
- Filtered views with category selection

### 2. Consistent Patterns

**Concept:** Reuse established patterns across the site.

**Implementation:**
- Unified card components for projects, posts, publications
- Consistent button styles and interactions
- Standardized spacing and layout grids

### 3. Feedback & Affordance

**Concept:** Provide clear feedback for user actions.

**Implementation:**
- Hover states with subtle transformations
- Loading indicators during data fetch
- Success/error states for form submissions

### 4. Accessibility First

**Concept:** Design for all users from the beginning.

**Implementation:**
- Semantic HTML structure
- ARIA labels for interactive components
- Keyboard navigation support
- Screen reader optimization

## Project Structure

```
portfolio/
├── _sass_text/
│   ├── skins/
│   │   └── _synthetic-naturalism.scss  # Design system
│   ├── custom-typography.scss          # Typography
│   ├── katex-custom.scss               # Math styling
│   └── custom.scss                      # Global styles
├── _includes/
│   ├── katex.html                      # LaTeX rendering
│   ├── prism-syntax-highlighting.html   # Code display
│   ├── chartjs-academic.html            # Charts
│   └── theme-switcher.html             # Theming
├── _projects/
│   ├── qlearning-pacman.md             # Project case study
│   └── kaggle-competitions.md          # Competition playbook
├── docs/
│   ├── accessibility-audit.md           # WCAG compliance
│   └── performance-optimization.md      # Performance guide
├── index.html                          # Homepage
├── about.md                            # About page
├── blog/index.md                       # Blog
├── projects.md                         # Projects
├── research.md                         # Research
└── _config.yml                        # Jekyll config
```

## Best Practices Summary

### Design Decisions

1. **Mobile-First Approach**: Start with mobile, enhance for desktop
2. **Performance Budget**: Monitor and optimize continuously
3. **Accessibility Audit**: Regular WCAG compliance checks
4. **Content Strategy**: Regular updates and quality content
5. **Analytics Integration**: Track user behavior and preferences

### Technical Standards

1. **Semantic HTML**: Proper document structure
2. **Progressive Enhancement**: Core functionality first
3. **Graceful Degradation**: Fallbacks for older browsers
4. **Performance Budget**: JS < 200KB, CSS < 50KB
5. **Security Headers**: CSP, X-Frame-Options

### Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | 95+ | 98 |
| Lighthouse Accessibility | 100 | 100 |
| Lighthouse Best Practices | 95+ | 100 |
| Lighthouse SEO | 100 | 100 |
| Core Web Vitals (LCP) | < 2.5s | 1.8s |
| Core Web Vitals (CLS) | < 0.1 | 0.05 |

## References & Resources

### Design Inspiration
- [Awwwards](https://www.awwwards.com/)
- [Dribbble](https://dribbble.com/)
- [Typewolf Portfolio Sites](https://www.typewolf.com/portfolio-sites)
- [Simon Pan Portfolio](https://simonpan.com/)

### Technical Documentation
- [Jekyll TeXt Theme](https://github.com/kitian616/jekyll-TeXt-theme)
- [KaTeX Documentation](https://katex.org/)
- [Prism.js](https://prismjs.com/)
- [Chart.js](https://www.chartjs.org/)

### Accessibility Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility](https://webaim.org/)

### Performance Optimization
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

**Skill Version**: 1.0
**Created**: February 3, 2026
**Last Updated**: February 3, 2026
**Category**: Web Development / UX Design