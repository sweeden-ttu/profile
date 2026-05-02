# Workspace Setup Guide

This guide explains the workspace configuration for Ruby/Jekyll (GitHub Pages) and Python development.

## Workspace Settings

### Location
- `.vscode/settings.json` - Workspace-specific settings (gitignored, local only)
- `.vscode/extensions.json` - Recommended extensions

## Ruby & Jekyll Configuration

### Required Setup

1. **Install Ruby** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install ruby

   # Or use rbenv/rvm for version management
   ```

2. **Install Bundler**:
   ```bash
   gem install bundler
   ```

3. **Install Jekyll dependencies**:
   ```bash
   bundle install
   ```

### Jekyll Development Server

Start the local development server:
```bash
bundle exec jekyll serve
# Or with auto-reload
bundle exec jekyll serve --livereload
```

The site will be available at `http://localhost:4000`

## Workspace Settings for Ruby/Jekyll

- **Language Server**: Ruby LSP enabled
- **Linting**: RuboCop (via Bundler)
- **Formatting**: RuboCop
- **File Associations**:
  - `*.html` → Liquid templates
  - `Gemfile` → Ruby
  - `_config.yml` → YAML
  - `*.scss` → SCSS

### Excluded Directories

The following are excluded from file watching and search:
- `_site/` - Jekyll build output
- `.jekyll-cache/` - Jekyll cache
- `.sass-cache/` - Sass cache
- `.bundle/` - Bundler files
- `vendor/` - Vendor dependencies

## Python Configuration

### Required Setup

1. **Create Virtual Environment**:
   ```bash
   python3 -m venv .venv
   ```

2. **Activate Virtual Environment**:
   ```bash
   # macOS/Linux
   source .venv/bin/activate

   # Windows
   .venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Python Version

- **Specified Version**: Python 3.11 (see `.python-version`)
- **Interpreter Path**: `.venv/bin/python` (auto-detected)

### Workspace Settings for Python

- **Formatter**: Black (line length: 88)
- **Linting**:
  - Flake8 (enabled)
  - MyPy (type checking, enabled)
  - Pylint (disabled)
- **Testing**: pytest (enabled)
- **Format on Save**: Enabled
- **Organize Imports**: Enabled

### Python File Settings

- **Tab Size**: 4 spaces
- **Indentation**: Spaces (not tabs)
- **Trailing Whitespace**: Auto-trimmed
- **Final Newline**: Auto-added

## GitHub Pages Configuration

### Build Process

GitHub Pages automatically builds the Jekyll site when you push to the repository. The build process:

1. Uses the `Gemfile` to install dependencies
2. Runs `jekyll build` to generate static files
3. Serves the `_site/` directory

### Local Testing

Test your site locally before pushing:
```bash
# Build the site
bundle exec jekyll build

# Serve locally
bundle exec jekyll serve
```

## Playwright Testing

Run Playwright tests (which start Jekyll server automatically):
```bash
npm test
# Or
npm run test:headed  # With browser visible
```

## Recommended Extensions

Install recommended extensions:
```bash
# VS Code will prompt you to install, or:
code --install-extension <extension-id>
```

Key extensions:
- **Ruby**: `rebornix.ruby`
- **Liquid**: `sissel.shopify-liquid`
- **Python**: `ms-python.python`
- **Markdown**: `yzhang.markdown-all-in-one`
- **YAML**: `redhat.vscode-yaml`
- **Playwright**: `ms-playwright.playwright`

## Troubleshooting

### Ruby/Jekyll Issues

**Problem**: `bundle install` fails
- **Solution**: Ensure Ruby and Bundler are installed
- Check Ruby version: `ruby --version`
- Update Bundler: `gem update bundler`

**Problem**: Jekyll server won't start
- **Solution**: Check if port 4000 is in use
- Try: `bundle exec jekyll serve --port 4001`

**Problem**: Sass compilation errors
- **Solution**: Ensure `sass-embedded` gem is installed
- Run: `bundle update sass-embedded`

### Python Issues

**Problem**: Python interpreter not found
- **Solution**: Create virtual environment: `python3 -m venv .venv`
- Reload VS Code window to detect interpreter

**Problem**: Import errors
- **Solution**: Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

**Problem**: Formatting not working
- **Solution**: Install Black formatter: `pip install black`
- Or install VS Code extension: `ms-python.black-formatter`

### GitHub Pages Issues

**Problem**: Site not updating after push
- **Solution**: Check GitHub Actions for build errors
- Verify `_config.yml` syntax is correct
- Check that all required plugins are in `Gemfile`

**Problem**: Math formulas not rendering
- **Solution**: Ensure KaTeX is properly configured in `_layouts/default.html`
- Check that `kramdown-math-katex` gem is in `Gemfile`

## Quick Reference

### Common Commands

```bash
# Jekyll
bundle exec jekyll serve          # Start dev server
bundle exec jekyll build           # Build site
bundle exec jekyll clean           # Clean build artifacts

# Python
python -m venv .venv               # Create venv
source .venv/bin/activate          # Activate venv
pip install -r requirements.txt    # Install deps
python tor_browser_scraper.py      # Run script

# Testing
npm test                           # Run Playwright tests
bundle exec htmlproofer _site      # Check HTML links
```

## File Structure

```
.
├── .vscode/              # Workspace settings (gitignored)
│   ├── settings.json     # Editor settings
│   └── extensions.json   # Recommended extensions
├── .venv/                # Python virtual environment (gitignored)
├── _site/                # Jekyll build output (gitignored)
├── Gemfile               # Ruby dependencies
├── requirements.txt      # Python dependencies
├── .python-version       # Python version specification
└── _config.yml           # Jekyll configuration
```

## Next Steps

1. Install recommended extensions (VS Code will prompt)
2. Create Python virtual environment: `python3 -m venv .venv`
3. Install Python dependencies: `pip install -r requirements.txt`
4. Install Ruby dependencies: `bundle install`
5. Start Jekyll server: `bundle exec jekyll serve`
6. Verify everything works!
