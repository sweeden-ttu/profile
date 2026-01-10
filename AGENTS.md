# Repository Guidelines

## Project Structure & Module Organization
- Jekyll source lives in `_layouts`, `_includes`, `_sass`, and `assets/{css,js,images}`; main content is in `_posts` (blog), `_projects` (portfolio), `_drafts` (unpublished), and top-level pages like `about.md`, `research.md`, and `index.html`.
- Tests reside in `tests/site.spec.ts` (Playwright). Build output goes to `_site/` (do not commit). Workflow templates and LaTeX assets sit under `templates/`.

## Build, Test, and Development Commands
- `bundle install` to pull Ruby/Jekyll deps; `npm install` only if Playwright deps need refreshing.
- Local serve: `bundle exec jekyll serve --livereload` (opens at `http://localhost:4000`, watches content and Sass).
- Production build: `JEKYLL_ENV=production bundle exec jekyll build` (writes to `_site/` with minified assets if configured).
- Tests: `npm test` (headless Playwright suite); `npm run test:headed` for visual debugging; `npm run report` to view the latest Playwright report.

## Coding Style & Naming Conventions
- Use 2-space indentation for Liquid, HTML, YAML front matter, and Sass; favor descriptive classes over IDs.
- Posts follow `YYYY-MM-DD-title.md`; projects use concise kebab-case filenames. Keep front matter minimal and include `title`, `layout`, and relevant `description`/`tags`.
- Sass partials live in `_sass/` and are imported via `assets/css/main.scss`; keep variables and mixins in `_variables.scss` and `_typography.scss` before adding component styles.
- Prefer small, reusable includes in `_includes/`; keep navigation or meta tweaks in existing partials instead of scattering inline HTML.

## Testing Guidelines
- Primary checks are Playwright UI smoke tests (`tests/site.spec.ts`), covering navigation, SEO meta tags, responsiveness, and accessibility basics. Extend by adding focused `test.describe` blocks rather than growing the monolith.
- When adding features, include at least one Playwright assertion for new routes or interactive elements (e.g., verifying hero copy or link behavior).
- Run `npm test` after content or layout changes; failures often indicate missing meta tags, alt text, or broken navigation.

## Commit & Pull Request Guidelines
- Use short, action-oriented commit messages (observed pattern: `Add ...`, `Merge ...`); keep subject under ~72 chars and scope by area when helpful (`layout:`, `styles:`, `tests:`).
- Pull requests should state the change, rationale, and testing done (commands run); include screenshots for visual updates and link any relevant issues.
- Avoid committing `_site/`, `node_modules/`, or local Playwright artifacts (`playwright-report`, `test-results`)—they are generated. Keep changes focused and grouped by feature or fix.

## Content Generation Guidelines (Gemini/Claude)
- **Math Rendering**: Refer to `@math-rules.md` for all LaTeX/KaTeX usage.
- **Reasoning**: Provide step-by-step, detailed reasoning. Explicitly state rules for axioms/equivalencies.
- **Categorization**: All blog posts must categorize under: "Logic for Computer Scientists", "Intelligent Systems", or "Theory of Automata".
- **Resources**: Always search for and append external resource links to the bottom of posts.

