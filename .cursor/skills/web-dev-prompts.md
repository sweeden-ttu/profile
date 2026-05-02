# Web Developer AI Prompts Skill

A collection of proven AI prompts for common web development tasks, organized by category.

## Usage

Use these prompts with Claude, ChatGPT, or other AI assistants to generate production-ready code for web development tasks.

---

## 1. Navigation Components

### Semantic Navigation Bar with Dropdowns
```
Create a semantic navigation bar component with dropdowns and ARIA accessibility attributes.
```

**What it does:** Generates a responsive drop-down menu with ARIA compliance for screen readers.

**Customization tips:**
- Add specific menu items: "Home, About, Services, Contact"
- Specify mobile behavior: "collapsible menus nested under hamburger icon"
- Add submenu depth limits

---

## 2. Page Templates

### About Page Generator
```
Draft an About Us page using structured HTML5 elements and add schema.org markup for enhanced SEO.
```

**What it does:** Creates HTML with placeholders for company story, team, mission, and contact info.

**Customization tips:**
- Provide company history, team details, mission statement
- Specify industry and brand tone

### Blog Template Builder
```
Generate a Markdown/MDX blog template optimized for SEO and internal link structure about [your topic]:
```

**What it does:** Creates SEO-optimized MDX template with internal linking, FAQ schema, and canonical URLs.

**Customization tips:**
- Provide specific blog outline
- Include internal linking strategy requirements

---

## 3. Component Generation

### Expandable FAQ Component
```
Create an expandable FAQ section using accessible accordion UI patterns and FAQ schema markup for [my business].
```

**What it does:** Generates accessible FAQ with ARIA attributes, keyboard support, and JSON-LD schema.

**Customization tips:**
- List specific Q&A pairs
- Specify number of FAQs
- Set behavioral style (single vs. multiple expanded)

### Accessible Contact Form
```
Design a publish-ready contact form layout for optimal usability, including client-side validation and contextual help for my website.
```

**What it does:** Creates form with name, email, subject fields, client-side validation, and helpful error messages.

**Customization tips:**
- Specify mandatory fields
- Add field limits (message length, phone format)
- Provide desired error messages

### Interactive Search Component
```
Implement client-side search with debounce, highlighting, and fuzzy matching
```

**What it does:** Generates search bar with typo tolerance, result highlighting, and debounce optimization.

**Customization tips:**
- Specify debounce delay (300ms-500ms)
- Define search output format
- Set fuzzy matching sensitivity

### Multi-Step Signup Flow
```
Design a multi-step signup flow with progressive disclosure and input masking.
```

**What it does:** Creates onboarding wizard with field masking (phone numbers, dates) and navigation.

**Customization tips:**
- Specify exact steps and fields
- Request wireframes for each step
- Add field validation rules

---

## 4. Design System

### WCAG-Compliant Color Palette
```
Generate a WCAG 2.2 compliant color system with CSS custom properties and dark mode support.
```

**What it does:** Creates color system meeting WCAG contrast requirements with dark mode CSS variables.

**Customization tips:**
- Describe brand style preferences
- Provide reference websites
- Specify contrast ratio targets (4.5:1 for normal text)

### Typography Scale Builder
```
Create a typographic scale with heading sizes, Google Fonts preload links, and optimal line heights.
```

**What it does:** Generates complete typography system using clamp() for responsive scaling with font preloading.

**Customization tips:**
- Request live browser preview
- Specify font preferences
- Set base font size

### Mobile-First Grid Layout
```
Outline mobile-first responsive grid setup using CSS Grid.
```

**What it does:** Creates CSS Grid layout with responsive breakpoints for various screen sizes.

**Customization tips:**
- Specify page type (product listing, blog post)
- Define column/row requirements

---

## 5. Schema & SEO

### Product/Service Schema Generator
```
Write descriptions with JSON-LD schema for each item [name your products/services].
```

**What it does:** Generates product/service descriptions with rich snippet schema (ratings, price, availability).

**Customization tips:**
- Specify SEO goals (rich results)
- Request specific fields (rating, price, availability)

### Sitemap & Robots.txt Generator
```
Create a sitemap.xml and robots.txt setup to optimize crawlability based on [website URL list].
```

**What it does:** Generates SEO files with crawl directives to prevent indexing low-value pages.

**Customization tips:**
- Set URL limit per sitemap (max 50,000)
- Specify pages to disallow

---

## 6. Accessibility

### Accessibility Audit Report
```
Create an audit report on WCAG 2.2 AA compliance, including keyboard, color, and screen reader tests for [website].
```

**What it does:** Runs comprehensive accessibility audit with severity-prioritized findings and fix code snippets.

**Customization tips:**
- Request findings in table format
- Ask for remediation checklists
- Specify validation tools

### Tappable Elements Audit
```
Audit tappable elements on [website] to achieve a minimum target size of 44px and responsive typography scaling.
```

**What it does:** Analyzes button/touch targets and typography for mobile accessibility compliance.

**Customization tips:**
- Reference WCAG 2.2 as standard
- Request actionable recommendations

---

## 7. Security

### Web Security Checklist
```
Outline HTTPS setup, input sanitization, security headers, and CSRF/XSS protections.
```

**What it does:** Creates security implementation guide with code snippets for common vulnerabilities.

**Customization tips:**
- Specify tech stack (WordPress, Node.js, etc.)
- List hosting environment

---

## 8. Workflow & Content

### Content Workflow Setup
```
Recommend content workflow setup using a headless CMS with versioning and scheduling.
```

**What it does:** Designs content publishing workflow with role-based access and scheduling.

**Customization tips:**
- Specify content type and industry
- Name target CMS (Contentful, Strapi, HubSpot)

---

## Simplified Prompts for Non-Technical Users

| Task | Simplified Prompt |
|------|------------------|
| Navigation | "Generate a simple navigation menu listing [pages]" |
| About Page | "Write an About Us explaining my site, team, and values" |
| Blog Post | "Write beginner-friendly blog on [topic] with headings" |
| Products | "Create short product descriptions for [products]" |
| FAQ | "Draft FAQ answering common questions about [business]" |
| Colors | "Suggest color palette that feels [mood]" |
| Typography | "Recommend two easy-to-read fonts for headings and body" |
| Contact Form | "List ways to make contact form easier for visitors" |
| Mobile | "Suggest ways to make website look good on phones" |
| Accessibility | "List accessibility must-haves for users with disabilities" |
| Security | "Explain basic steps to keep website secure" |
| SEO | "Suggest ways to organize content for search ranking" |
| CMS | "Suggest easy ways to update content without coding" |

---

## Best Practices

1. **Be Specific:** Always include your tech stack, frameworks, and constraints
2. **Iterate:** Use AI outputs as starting points; refine with follow-up prompts
3. **Validate:** Test generated code in browser before deployment
4. **Accessibility First:** Always request WCAG compliance and ARIA attributes
5. **SEO Integration:** Include schema markup from the start
6. **Security:** Never skip security prompts, especially for user-facing forms
