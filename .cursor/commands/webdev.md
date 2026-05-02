# Web Development Prompts Command

Quick access to proven AI prompts for common web development tasks.

## Usage

`/webdev [category] [options]`

## Categories

### Components
| Command | Description |
|---------|-------------|
| `/webdev nav` | Semantic navigation bar with dropdowns and ARIA |
| `/webdev faq` | Expandable FAQ with accordion patterns and schema |
| `/webdev contact` | Contact form with validation and accessibility |
| `/webdev search` | Client-side search with debounce and fuzzy matching |
| `/webdev signup` | Multi-step signup flow with progressive disclosure |

### Design
| Command | Description |
|---------|-------------|
| `/webdev colors` | WCAG-compliant color palette with dark mode |
| `/webdev typography` | Responsive typography scale with font preloading |
| `/webdev grid` | Mobile-first CSS Grid layout setup |

### SEO & Schema
| Command | Description |
|---------|-------------|
| `/webdev about-page` | About page with schema.org markup |
| `/webdev blog-template` | SEO-optimized MDX blog template |
| `/webdev product-schema` | JSON-LD schema for products/services |
| `/webdev sitemap` | sitemap.xml and robots.txt generator |

### Audit
| Command | Description |
|---------|-------------|
| `/webdev audit [url]` | WCAG 2.2 AA accessibility audit |
| `/webdev audit-tap [url]` | Check 44px minimum touch target compliance |
| `/webdev security` | Security checklist (HTTPS, headers, XSS protection) |

## Examples

Generate a navigation component:
```
/webdev nav --items "Home, About, Services, Contact" --mobile "hamburger"
```

Create accessible color palette:
```
/webdev colors --mood "professional" --dark-mode --contrast "4.5:1"
```

Generate blog template:
```
/webdev blog-template --topic "machine learning" --seo
```

Audit website for accessibility:
```
/webdev audit https://example.com --level AA
```

## Options

| Option | Description |
|--------|-------------|
| `--items LIST` | Comma-separated list of items |
| `--level [A\|AA\|AAA]` | WCAG compliance level |
| `--mobile STYLE` | Mobile navigation style (hamburger, bottom-bar) |
| `--dark-mode` | Include dark mode support |
| `--contrast RATIO` | Minimum contrast ratio (default: 4.5:1) |
| `--verbose` | Include detailed explanations |

## Notes

- Generated prompts are optimized for ChatGPT, Claude, and Gemini
- Always customize prompts with your specific requirements
- Validate generated code before production use
- See `~/.cursor/skills/web-dev-prompts.md` for full documentation
