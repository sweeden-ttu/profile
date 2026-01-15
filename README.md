# Scott Weeden - Personal Profile & Blog

Personal profile and academic blog for **Scott Weeden**, Master of Computer Science student at Texas Tech University. This Jekyll-based static site showcases research, projects, and technical writing in computer science and machine learning.

## Overview

This site features:
- **About** - Personal introduction and academic journey
- **Resume/CV** - Academic and professional experience
- **Research & Projects** - Showcase of publications and technical projects
- **Blog** - Technical articles on CS, ML, and algorithm analysis

**Design Philosophy**: Academic Minimalism with Technical Precision - inspired by Linear, Notion, and Stripe.

## Technology Stack

### Core Technologies
- **[Jekyll 4.x](https://jekyllrb.com/)** - Static site generator
- **[Liquid](https://shopify.github.io/liquid/)** - Templating language
- **[Kramdown](https://kramdown.gettalong.org/)** - Markdown processor with math support
- **[Sass/SCSS](https://sass-lang.com/)** - CSS preprocessing
- **[Ruby](https://www.ruby-lang.org/)** - Build environment

### UI & Display Libraries

#### Mathematical Formulas - KaTeX
**[KaTeX](https://katex.org/)** is used for rendering complex mathematical formulas in research articles and blog posts.

**Why KaTeX over MathJax:**
- **Performance**: ~2x faster rendering, smaller bundle size (~115KB vs ~600KB)
- **Synchronous rendering**: No page reflows or layout shifts
- **Better Core Web Vitals**: Improved LCP and CLS scores
- **Server-side compatible**: Can be pre-rendered during Jekyll build

**Usage in blog posts:**
```markdown
Inline math: $E = mc^2$

Display math:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Configuration**: Auto-render plugin configured in `_layouts/default.html`

**References:**
- [KaTeX Documentation](https://katex.org/docs/api.html)
- [KaTeX vs MathJax Comparison](https://www.intmath.com/cg5/katex-mathjax-comparison.php)

#### Syntax Highlighting - Prism.js
**[Prism.js](https://prismjs.com/)** provides beautiful, lightweight syntax highlighting for code blocks.

**Why Prism.js over Highlight.js:**
- **Smaller footprint**: Core is ~2KB (vs ~10KB), modular language loading
- **Better performance**: 15KB/ms parsing speed vs 9KB/ms
- **Customization**: Extensive theming and plugin ecosystem
- **Line highlighting**: Built-in support for line numbers and highlights

**Supported Languages** (loaded in default layout):
- Python, JavaScript, Java, C++, Bash
- Add more in `_layouts/default.html` as needed

**Usage:**
```markdown
​```python
def hello_world():
    print("Hello, World!")
​```
```

**Custom Theme**: Using `prism-tomorrow.css` for clean, minimalist code display

**References:**
- [Prism.js Documentation](https://prismjs.com/)
- [Performance Comparison](https://www.peterbe.com/plog/benchmark-compare-highlight.js-vs-prism)

#### Responsive Navigation
**Vanilla JavaScript** with minimal Alpine.js-inspired patterns for responsive menu.

**Why No Heavy Framework:**
- **Performance**: < 1KB of custom JS vs 50KB+ frameworks
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: Semantic HTML + ARIA attributes
- **Maintainability**: Simple, readable code

**Features:**
- Mobile hamburger menu with smooth transitions
- Keyboard navigation support
- Focus management for accessibility
- No external dependencies

**Implementation**: See `assets/js/main.js`

### Additional Tools

#### Development
- **[html-proofer](https://github.com/gjtorikian/html-proofer)** - HTML validation and link checking
- **[pa11y-ci](https://github.com/pa11y/pa11y-ci)** - Accessibility testing (WCAG AA compliance)
- **[markdownlint](https://github.com/DavidAnson/markdownlint)** - Markdown linting
- **[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)** - Performance and SEO auditing

#### CI/CD
- **GitHub Actions** - Automated deployment and testing
- **Jekyll Build Action** - Optimized Jekyll builds
- **Pages Deploy** - Automated GitHub Pages deployment

## Quick Start

### Prerequisites

```bash
# Check Ruby version (2.7+ required)
ruby --version

# Install Bundler
gem install bundler

# Install Jekyll
gem install jekyll
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/profile.git
cd profile

# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Visit http://localhost:4000
```

### Build for Production

```bash
# Set production environment
JEKYLL_ENV=production bundle exec jekyll build

# Output in _site/ directory
```

### Git Hooks

This repository uses git hooks to ensure code quality and build integrity. Hooks are stored in `.githooks/` and automatically used via `git config core.hooksPath .githooks`.

**Available Hooks:**

- **`pre-push`** - Requires successful Jekyll build before allowing push
  - Runs `bundle exec jekyll build` (or `jekyll build` if bundle unavailable)
  - Prevents pushing code that would break the site build
  - Can be bypassed with `git push --no-verify` if needed (not recommended)

- **`post-checkout`** / **`post-merge`** - Regenerates Agent A lecture inventory after repository updates

**Testing the Build Hook:**

```bash
# The hook will automatically run on git push
git push

# If build fails, fix errors and try again
# To skip the hook (not recommended):
git push --no-verify
```

## Project Structure

```
profile/
├── _config.yml              # Jekyll configuration
├── Gemfile                  # Ruby dependencies
├── CLAUDE.md               # AI assistant instructions
│
├── _layouts/                # Page templates
│   ├── default.html        # Base layout with KaTeX + Prism.js
│   ├── page.html           # Standard pages
│   ├── post.html           # Blog posts
│   └── project.html        # Project showcases
│
├── _includes/              # Reusable components
│   ├── header.html         # Site header with navigation
│   ├── footer.html         # Site footer
│   ├── nav.html            # Navigation menu
│   └── meta.html           # SEO meta tags
│
├── _sass/                  # Sass partials
│   ├── _variables.scss     # Design tokens (colors, spacing, typography)
│   ├── _typography.scss    # Typography styles
│   ├── _layout.scss        # Layout and structure
│   └── _components.scss    # Reusable components
│
├── assets/
│   ├── css/
│   │   └── main.scss       # Main stylesheet (imports all partials)
│   ├── js/
│   │   └── main.js         # Vanilla JS for navigation & enhancements
│   └── images/             # Images and media
│
├── _posts/                 # Blog posts (YYYY-MM-DD-title.md)
├── _projects/              # Project collection
├── _drafts/                # Draft posts (not published)
│
├── templates/              # Templates and utilities
│   ├── latex/              # LaTeX templates
│   │   ├── academic-paper.tex          # IEEE-style research paper
│   │   ├── academic-resume.tex         # CV template
│   │   └── blog-post-supplement.tex    # Technical supplement
│   │
│   └── ci-cd/              # GitHub Actions workflows
│       ├── jekyll-deploy.yml          # Auto-deploy to GitHub Pages
│       ├── quality-checks.yml         # HTML validation, link checking
│       └── lighthouse-performance.yml  # Performance testing
│
├── about.md                # About page
├── resume.md               # Resume/CV page
├── research.md             # Research & Projects page
├── blog/                   # Blog index
└── index.html              # Homepage
```

## Files, Templates, and Utilities

### LaTeX Templates

Professional templates for academic writing and research documentation.

#### 1. Academic Research Paper (`templates/latex/academic-paper.tex`)
IEEE-style conference paper template for research publications.

**Features:**
- IEEE conference format
- Abstract, keywords, sections
- Figure and table support
- Bibliography with BibTeX
- Mathematical equation support

**Usage:**
```bash
cd templates/latex
pdflatex academic-paper.tex
bibtex academic-paper
pdflatex academic-paper.tex
pdflatex academic-paper.tex
```

#### 2. Academic Resume/CV (`templates/latex/academic-resume.tex`)
ModernCV template for professional academic CVs.

**Features:**
- Clean, professional design
- Education, research, publications sections
- Project and skills showcase
- Customizable colors and styles

**Usage:**
```bash
cd templates/latex
pdflatex academic-resume.tex
```

#### 3. Blog Post Supplement (`templates/latex/blog-post-supplement.tex`)
Extended technical documentation for blog posts.

**Features:**
- Mathematical proofs and derivations
- Algorithm pseudocode
- Code listings with syntax highlighting
- Theorem environments

**Usage:**
Companion to blog posts for readers wanting deep mathematical details.

### CI/CD Workflows

GitHub Actions workflows for automated testing and deployment.

#### 1. Jekyll Deploy (`templates/ci-cd/jekyll-deploy.yml`)
Automatic deployment to GitHub Pages on push to main.

**Setup:**
1. Copy to `.github/workflows/jekyll-deploy.yml`
2. Enable GitHub Pages in repository settings
3. Push to main branch - automatic deployment

#### 2. Quality Checks (`templates/ci-cd/quality-checks.yml`)
Automated testing on pull requests.

**Tests:**
- HTML validation (html-proofer)
- Markdown linting (markdownlint)
- Accessibility checks (pa11y-ci)
- Broken link detection

**Setup:**
```bash
# Copy workflow
cp templates/ci-cd/quality-checks.yml .github/workflows/

# Install local testing tools
gem install html-proofer
npm install -g pa11y-ci markdownlint-cli
```

#### 3. Lighthouse Performance (`templates/ci-cd/lighthouse-performance.yml`)
Performance and SEO auditing with Google Lighthouse.

**Targets:**
- Performance Score: 90+
- Accessibility Score: 90+
- Best Practices: 90+
- SEO Score: 90+
- FCP < 1.5s, LCP < 2.5s

**Setup:**
1. Copy workflow to `.github/workflows/`
2. Lighthouse config in `.lighthouserc.json` (already configured)
3. Results posted as PR comments

## Development Workflow

### Creating a Blog Post

```bash
# Create new post file
touch _posts/2026-01-10-your-post-title.md

# Add frontmatter and content
cat > _posts/2026-01-10-your-post-title.md << 'EOF'
---
layout: post
title: "Your Post Title"
date: 2026-01-10
categories: [machine-learning, research]
tags: [python, algorithms]
excerpt: "Brief description for previews"
reading_time: 8
---

Your post content here with $\LaTeX$ math and ```code``` blocks.
EOF

# Preview locally
bundle exec jekyll serve --drafts

# Commit and push
git add _posts/2026-01-10-your-post-title.md
git commit -m "Add blog post: Your Post Title"
git push
```

### Creating a Project

```bash
# Create project file
touch _projects/project-name.md

# Add project frontmatter
cat > _projects/project-name.md << 'EOF'
---
layout: project
title: "Project Name"
subtitle: "Brief tagline"
date: 2026-01-10
status: "Completed"
tech_stack: [Python, TensorFlow, Docker]
links:
  demo: https://demo.example.com
  github: https://github.com/username/project
  paper: https://doi.org/xxxx
outcomes:
  - "Achieved 92% accuracy on benchmark dataset"
  - "Published in IEEE Conference 2026"
---

Project description and details here.
EOF
```

## Testing & Quality Assurance

### Local Testing

```bash
# Serve locally
bundle exec jekyll serve

# Build production site
JEKYLL_ENV=production bundle exec jekyll build

# Validate HTML
bundle exec htmlproofer ./_site --disable-external

# Check accessibility
pa11y http://localhost:4000

# Lint Markdown
markdownlint _posts _projects *.md
```

### Performance Testing

```bash
# Serve production build
cd _site && python3 -m http.server 8000

# Run Lighthouse
npm install -g @lhci/cli
lhci autorun --config=.lighthouserc.json
```

## Design System

The site uses a comprehensive design system defined in `_sass/_variables.scss`:

### Colors
- **Primary**: Academic Blue (#2563eb)
- **Text**: Slate scale (#0f172a to #94a3b8)
- **Backgrounds**: White to light gray (#ffffff to #f1f5f9)

### Typography
- **Sans**: Inter, SF Pro Display, system fonts
- **Mono**: JetBrains Mono, Fira Code, SF Mono
- **Scale**: 1.250 (Major Third) - 16px base

### Spacing
- **Base**: 8px grid system
- **Scale**: 4px to 96px (xs to 4xl)

See `CLAUDE.md` for complete design specifications.

## Deployment

### GitHub Pages

The site auto-deploys to GitHub Pages via GitHub Actions.

**Setup:**
1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at `https://username.github.io/`

### Custom Domain (Optional)

```bash
# Add CNAME file
echo "yourdomain.com" > CNAME

# Configure DNS A records:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

git add CNAME
git commit -m "Add custom domain"
git push
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

## Contributing

This is a personal portfolio site. If you find issues or have suggestions:

1. Open an issue describing the problem
2. For code contributions, fork and submit a pull request
3. Ensure all tests pass (`bundle exec htmlproofer ./_site`)

## License

Content is © 2026 Scott Weeden. All rights reserved.

Code is MIT licensed - feel free to use the Jekyll setup and design system for your own projects.

## Resources

### Documentation
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [KaTeX Documentation](https://katex.org/docs/api.html)
- [Prism.js Documentation](https://prismjs.com/)
- [GitHub Pages Guide](https://docs.github.com/en/pages)

### Design References
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [HTML Proofer](https://github.com/gjtorikian/html-proofer)
- [Pa11y Accessibility Testing](https://pa11y.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Contact

- **Email**: your.email@ttu.edu
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [yourprofile](https://linkedin.com/in/yourprofile)

---

**Built with precision and care.** Every pixel matters.
