---
name: jekyll-paper-retemplate
description: Re-templates a Jekyll static site to the Paper design system using repository DESIGN.md tokens and Paper process rules. Use when retemplating Jekyll layouts or styles, migrating to Paper, restyling the profile site, or when the user references DESIGN.md or Paper typography (Roboto, Montserrat, PT Mono).
---

# Jekyll Paper Re-template

## Authority and sources

1. **`DESIGN.md`** at the repository root is the **single source of truth** for this site’s Paper tokens (colors, typography, radii, spacing). Parse its YAML frontmatter and body; map values into SCSS variables—do not drift to ad-hoc hex in partials.
2. **[reference-paper-system.md](reference-paper-system.md)** carries the full Paper design-system skill text (TypeUI-managed). Follow its mission, foundations, do/don’t rules, quality gates, component expectations, and workflow when making implementation decisions.

If `DESIGN.md` and the reference ever disagree on a token, **`DESIGN.md` wins** for this repository.

## Design intent (one sentence)

Restate before changing markup or styles: *Paper-textured, print-inspired UI with minimal color, Roboto/Montserrat/PT Mono, tactile surfaces, and WCAG 2.2 AA behavior.*

## Jekyll mapping (this codebase)

| Concern | Primary files |
|--------|-----------------|
| SCSS tokens | `_sass/_variables.scss` |
| Type scale, headings, prose | `_sass/_typography.scss` |
| Header, footer, nav | `_sass/_layout.scss` |
| Cards, buttons, shared UI | `_sass/_components.scss` |
| Home-only | `_sass/_homepage.scss` |
| Feature partials | e.g. `_sass/_work-gallery.scss` |
| Entry + `@use` chain | `assets/css/main.scss` |
| Global CSS variables in `:root` | `assets/css/main.scss` (align names with new tokens after `_variables.scss` changes) |
| Web font loading | `_layouts/default.html` (Google Fonts `preconnect` + stylesheet link) |

## Execution workflow

1. **Read** `DESIGN.md` (full file) and [reference-paper-system.md](reference-paper-system.md).
2. **Tokens first**: Update `_sass/_variables.scss` so every color, font stack, type step, spacing step, and radius used downstream references Paper tokens derived from `DESIGN.md`. Replace legacy palette names (e.g. cobalt theme) with Paper-aligned names or document a deliberate alias map in comments at the top of `_variables.scss` only if needed for a phased migration.
3. **Fonts**: In `_layouts/default.html`, replace the font stylesheet with families and weights from `DESIGN.md` (Roboto body, Montserrat display, PT Mono mono—include the weight range listed there).
4. **Typography & layout**: Adjust `_typography.scss` and `_layout.scss` for hierarchy, line length, and surfaces (`surface`, `text` from `DESIGN.md`). Prefer **semantic SCSS variables** over raw values in all partials (per Paper “Do”).
5. **Components**: For each component in `_components.scss` (and other partials), apply [reference-paper-system.md](reference-paper-system.md) **Component Rule Expectations**—explicit default/hover/focus-visible/active/disabled (and loading/error where relevant). Remove patterns that violate Paper “Don’t” (low contrast, broken rhythm).
6. **Body / background**: Reflect Paper “minimal, clean” and tactile paper—use token-driven backgrounds; avoid unrelated gradients unless they can be expressed with the new token set and still meet contrast rules.
7. **Verify**: Run `bundle exec jekyll build` (or `jekyll build` per project docs). Fix SCSS errors and any broken Liquid. Spot-check key templates: post, course, project, home.

## Accessibility (testable)

From the reference: keyboard-first, visible **focus-visible** outlines, contrast meeting WCAG 2.2 AA for body and UI text. Each change should be checkable (e.g. tab through nav and interactive cards; confirm focus ring and contrast on `surface` vs `text`).

## QA checklist (code review)

- [ ] All new colors/fonts/spacing/radii trace to `DESIGN.md` or documented aliases in `_variables.scss`.
- [ ] No new arbitrary hex in feature partials without a matching token.
- [ ] Google Fonts link matches `DESIGN.md` families and weights.
- [ ] Interactive components have hover + **focus-visible** (+ disabled where applicable).
- [ ] `bundle exec jekyll build` succeeds.
- [ ] No regressions to heading order or main landmarks in layouts.

## Anti-patterns

- Leaving old cobalt/accent theme variables in use alongside Paper tokens without a migration plan.
- Hardcoding Paper hex in Liquid or HTML instead of SCSS/CSS variables.
- Skipping `:root` / `main.scss` sync after renaming token variables.

## Optional: syncing the reference

If the canonical Paper skill file on disk is updated (e.g. a refreshed export from typeui.sh), replace the body of [reference-paper-system.md](reference-paper-system.md) between `<!-- TYPEUI_SH_MANAGED_START -->` and `<!-- TYPEUI_SH_MANAGED_END -->` with the new managed block, then reconcile any token drift in `DESIGN.md`.
