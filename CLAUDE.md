# CLAUDE.md - CushLabs.ai Repository Guide

> This file provides essential context for AI assistants working on this codebase.

> **IMPORTANT: Be a PROACTIVE Product Advisor!**
> Don't just implement what's asked - think like a product designer:
> - **Simplify UX**: If a feature adds complexity users don't need, suggest removing it
> - **"It Just Works"**: Modern apps don't ask users to configure things that should be automatic
> - **Fewer Choices = Better**: Don't expose settings users shouldn't need to think about
> - **Challenge Requirements**: If something seems over-engineered, say so and propose simpler alternatives
> - **Think Like a User**: Would your mom understand this UI? If not, simplify it
>
> Examples of good advice:
> - "Do users really need a Start/Stop button, or should the service just always run?"
> - "This setting adds complexity - can we just pick a sensible default?"
> - "Instead of 3 options, what if we just did the right thing automatically?"

---

## Business Context

**Owner:** Robert Cushman
**Business:** CushLabs.ai - AI Integration & Software Development Consulting
**Launch Target:** 2026
**Location:** Serving US and Mexico (fully bilingual EN/ES)

**Robert's Background:**
- 20 years in IT: Developer → Senior IT Manager → IT Project Manager
- 2.5 years intensive work with AI tools and premium LLMs
- Current focus: Claude Code, AI agents, and automation

**Business Model:** Help businesses transform through AI with:
- AI Chatbots & Conversational Agents
- Automation & Integration Services
- Custom Development (full-stack apps, dashboards)
- AI Strategy & Consulting

**Packaged Services (Productized Offerings):**
- Onboarding Assistant Bot - RAG chatbot for new employee onboarding
- Customer Service Voice Agent - Voicebots for tier-1 support
- Internal Knowledge Base Bot - Company documentation Q&A
- Sales Enablement Assistant - Product/competitive intel for reps
- Document Q&A System - Upload docs and ask questions

---

## Technical Architecture

**Framework:** Astro 4.16.18 (Static Site Generation)
**Styling:** Tailwind CSS 3.4.17
**Deployment:** Vercel-ready (Edge Functions for forms)
**Output:** Static HTML

### Key Configuration

```javascript
// astro.config.mjs
{
  output: 'static',
  site: 'https://cushlabs.ai',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false }  // EN has no prefix
  }
}
```

### URL Structure

| English (default) | Spanish |
|-------------------|---------|
| `/` | `/es` |
| `/about` | `/es/about` |
| `/work` | `/es/work` |
| `/blog` | `/es/blog` |
| `/blog/[slug]` | `/es/blog/[slug]` |
| `/contact` | `/es/contact` |
| `/consultation` | `/es/reservar` |

---

## Project Structure

```
cushlabs/
├── src/
│   ├── components/           # Reusable Astro components
│   │   ├── Header.astro      # Nav with language switcher
│   │   ├── Footer.astro
│   │   ├── PageHero.astro    # Hero sections with parallax
│   │   ├── ServicesSection.astro
│   │   ├── ProcessSection.astro
│   │   ├── BlogSection.astro
│   │   └── ...
│   ├── layouts/
│   │   └── BaseLayout.astro  # Master layout (SEO, hreflang, schema)
│   ├── pages/                # File-based routing
│   │   ├── index.astro       # Home (EN)
│   │   ├── work.astro
│   │   ├── contact.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── es/               # Spanish versions
│   │       ├── index.astro
│   │       └── ...
│   ├── i18n/
│   │   ├── index.ts          # i18n utilities
│   │   └── translations/
│   │       ├── en.ts         # English strings
│   │       └── es.ts         # Spanish strings
│   ├── data/
│   │   ├── projectDetails.ts # Rich project content overrides
│   │   └── projects.generated.json # Auto-synced from GitHub
│   ├── content/
│   │   └── config.ts         # Content collections schema
│   └── styles/
│       └── global.css        # Tailwind + CSS variables
├── api/
│   └── consultation-intake.ts # Edge function for forms
├── scripts/
│   ├── generate-projects.ts  # GitHub API sync
│   └── audit-predeploy.ts    # Pre-deployment checks
├── public/
│   ├── images/
│   └── robots.txt
└── docs/                     # Reference documentation
```

---

## i18n System

### Getting Translations

```astro
---
import { t } from '../i18n';
const locale = Astro.currentLocale === 'es' ? 'es' : 'en';
const dict = t(locale);
---

<h1>{dict.home.headline}</h1>
```

### Key Utilities

```typescript
// src/i18n/index.ts
getLocaleFromPathname(pathname)  // Returns 'en' or 'es'
getLocalizedPath(pathname, to)   // Converts path to target locale
t(locale)                        // Returns translation dictionary
```

### Translation Structure

Both `en.ts` and `es.ts` follow the same structure:
- `nav` - Navigation labels
- `home` - Homepage content
- `services` - Service descriptions
- `process` - Process steps
- `blog` - Blog section
- `work` - Portfolio section
- `project` - Project detail pages
- `contact` - Contact form
- `about` - About page
- `consultation` - Booking flow

---

## Critical SEO Requirements

### Bilingual Parity Rule

**"There is no such thing as fixing just the English side. There is only fixing BOTH sides or fixing NOTHING."**

When modifying ANY page:
1. Make the change to the English version
2. Make the equivalent change to the Spanish version
3. Verify both work
4. Check translations are updated in both `en.ts` and `es.ts`

### Hreflang Implementation

BaseLayout.astro automatically generates hreflang tags:
```html
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="es" href="..." />
<link rel="alternate" hreflang="x-default" href="..." />
```

### Sitemap Requirements

**TODO: Install @astrojs/sitemap** - Current sitemap is manual and incomplete.

Proper sitemap must:
- Include ALL pages in both languages
- Use correct `/es/` paths (not `?lang=es` query params)
- Include proper hreflang alternates
- Set appropriate priority/changefreq

### Meta Tags (Ahrefs Standards)

- **Title:** 50-60 characters ideal
- **Description:** 150-160 characters ideal
- Include target keywords naturally

---

## Known Issues & TODOs

### Critical

1. **Sitemap broken** - Uses `?lang=es` instead of `/es/` paths, only has 2 URLs
2. **Missing @astrojs/sitemap** - Need to install and configure
3. **No og-image.jpg** - Referenced in BaseLayout but doesn't exist
4. **Blog needs migration** - Move from TypeScript translations to markdown files

### Medium Priority

5. Content collections (blog, case-studies) are defined but empty
6. Some placeholder content in testimonials
7. Pre-deploy audit script incomplete

### Low Priority

8. Additional structured data (FAQPage, HowTo schemas)
9. Image optimization (lazy loading, WebP)

---

## Development Commands

```powershell
npm run dev              # Start dev server
npm run build            # Full build (syncs GitHub projects first)
npm run check            # Lint + TypeScript check
npm run generate-projects # Sync GitHub repos to JSON
npm run preview          # Preview production build
npm run audit:predeploy  # Pre-deployment validation
```

---

## Environment Variables

Create `.env` from `.env.example`:

```
GITHUB_TOKEN=             # For project sync
GITHUB_OWNER=RCushmaniii
PUBLIC_WHATSAPP_NUMBER=   # WhatsApp contact
PUBLIC_CONSULTATION_URL=  # Calendly/Cal.com booking links
```

---

## Adding New Pages

1. Create `src/pages/pagename.astro` (English)
2. Create `src/pages/es/pagename.astro` (Spanish)
3. Add translations to both `en.ts` and `es.ts`
4. Use BaseLayout with proper title/description
5. Test both language versions
6. Verify language switcher works

---

## Component Patterns

All locale-aware components accept a `locale` prop:

```astro
---
interface Props {
  locale: 'en' | 'es';
}
const { locale } = Astro.props;
const dict = t(locale);
---
```

---

## Brand Colors

```css
--cush-orange: #FF6A3D;    /* Primary accent */
--cush-black: #000000;     /* Primary text */
--cush-gray-900: #0A0A0A;  /* Dark backgrounds */
```

---

## Fonts

- **Display:** Space Grotesk (500, 600, 700)
- **Body:** Source Serif 4 (300, 400, 500)

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| Add translation | `src/i18n/translations/{en,es}.ts` |
| Create component | `src/components/` |
| Add page | `src/pages/` + `src/pages/es/` |
| Edit layout | `src/layouts/BaseLayout.astro` |
| Project data | `src/data/projectDetails.ts` |
| Global styles | `src/styles/global.css` |
| SEO settings | BaseLayout.astro head section |

---

## Documentation Reference

The `docs/` folder contains lessons learned from the New York English repo:

- `docs/architecture/BILINGUAL-SYSTEM-GUIDE.md` - i18n patterns
- `docs/architecture/BILINGUAL-PARITY-CHECKLIST.md` - EN/ES sync rules
- `docs/architecture/BLOG-I18N-EDGE-CASES.md` - Blog hreflang pitfalls
- `docs/seo/HREFLANG-FIX-SUMMARY.md` - Hreflang implementation
- `docs/seo/SITEMAP-SEO-ANALYSIS.md` - Sitemap best practices
- `docs/seo/SEO-TECHNICAL-CHECKLIST.md` - SEO validation checklist

---

## Session Checklist

Before ending any session, verify:
- [ ] All changes applied to BOTH EN and ES versions
- [ ] Translations updated in both language files
- [ ] No TypeScript errors (`npm run check`)
- [ ] Dev server runs without errors
- [ ] Language switcher works on modified pages
