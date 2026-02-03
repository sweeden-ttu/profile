# Jekyll Setup for GitHub Pages

## Ruby Version Compatibility

**Current Setup**: Ruby 3.4.1 (as specified in `.ruby-version`)

**GitHub Pages Compatibility**: 
- GitHub Pages currently uses **Ruby 3.0.0** or **Ruby 3.2.x** depending on the `github-pages` gem version
- The `github-pages` gem locks Jekyll to version ~3.x or ~4.x depending on the gem version
- For maximum compatibility, consider using Ruby 3.0.0 or 3.2.x locally to match GitHub Pages

### Recommended Ruby Version for GitHub Pages

```bash
# Update .ruby-version to match GitHub Pages
echo "3.2.0" > .ruby-version
```

Or use the `github-pages` gem which handles version compatibility:

```ruby
# In Gemfile
gem "github-pages", group: :jekyll_plugins
```

## Popular Jekyll Themes for Academic Sites

### 1. **Minimal Mistakes**
- **Best for**: Blogs, faculty portfolios, mixed content
- **Highlights**: Well documented, multiple layouts, built-in search, highly customizable
- **GitHub**: [mmistakes/minimal-mistakes](https://github.com/mmistakes/minimal-mistakes)
- **Installation**: `gem "minimal-mistakes-jekyll"` or `remote_theme: "mmistakes/minimal-mistakes"`

### 2. **Chirpy**
- **Best for**: Technical writing, fast blogs, documentation
- **Highlights**: Dark mode, TOC, tags, SEO-friendly, active maintenance
- **GitHub**: [cotes2020/jekyll-theme-chirpy](https://github.com/cotes2020/jekyll-theme-chirpy)
- **Installation**: `remote_theme: "cotes2020/jekyll-theme-chirpy"`

### 3. **Just the Docs**
- **Best for**: Documentation sites, course materials
- **Highlights**: Sidebar navigation, clean layout, search, ideal for course sites
- **GitHub**: [just-the-docs/just-the-docs](https://github.com/just-the-docs/just-the-docs)
- **Installation**: `remote_theme: "just-the-docs/justthedocs"`

### 4. **Academic (al-folio)**
- **Best for**: Academic profiles, CV, publications, course listings
- **Highlights**: Clean and minimal, designed for academia
- **GitHub**: [alshedivat/al-folio](https://github.com/alshedivat/al-folio)
- **Installation**: `remote_theme: "alshedivat/al-folio"`

### 5. **Cayman** (Official GitHub Pages Theme)
- **Best for**: Minimal personal/academic sites
- **Highlights**: Part of official GitHub Pages themes, very simple and clean
- **Installation**: `theme: jekyll-theme-cayman` in `_config.yml`

## Current Theme Setup

This site uses a **custom theme** built from scratch with:
- Custom SASS styling
- Responsive design
- Academic-focused layout
- Support for MathJax/KaTeX
- Syntax highlighting with Prism.js
- Mermaid.js for diagrams

## GitHub Pages Deployment

### Using GitHub Pages Gem (Recommended)

Add to `Gemfile`:

```ruby
gem "github-pages", group: :jekyll_plugins
```

This ensures compatibility with GitHub Pages' locked gem versions.

### Local Development

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Build for production
JEKYLL_ENV=production bundle exec jekyll build
```

### GitHub Actions (Alternative)

If you want to use newer Jekyll versions, use GitHub Actions:

```yaml
# .github/workflows/jekyll.yml
name: Jekyll site CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      - name: Jekyll build
        run: bundle exec jekyll build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

## Faculty Collection

The site now includes a `faculty` collection for professor profiles:

```yaml
# In _config.yml
collections:
  faculty:
    output: true
    permalink: /faculty/:name/
```

Faculty pages are stored in `_faculty/` directory and use the `page` layout.

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Themes](https://pages.github.com/themes/)
- [Jekyll Themes Directory](https://jekyllthemes.io/)
