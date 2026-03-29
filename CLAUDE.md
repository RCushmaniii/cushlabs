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
│   ├── generate-projects.ts  # GitHub API sync → projects.generated.json
│   ├── upload-to-r2.ts       # Sync local assets → Cloudflare R2 CDN
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

1. **Blog needs migration** - Move from TypeScript translations to markdown files

### Medium Priority

2. Content collections (blog, case-studies) are defined but empty
3. Some placeholder content in testimonials
4. Pre-deploy audit script incomplete

### Low Priority

5. Additional structured data (FAQPage, HowTo schemas)

### Resolved

- ~~Sitemap broken~~ — @astrojs/sitemap 3.2.1 installed and configured with i18n locales
- ~~No og-image~~ — OG image exists at `public/images/og/cushlabs_logo_lt.jpg`
- ~~Image optimization~~ — All portfolio/logo/client images converted to WebP, lazy loading added
- ~~Broken portfolio images~~ — All 28 project pages migrated to Cloudflare R2 CDN (`cdn.cushlabs.ai`), 399 assets, 28/28 pages verified clean

---

## Portfolio Pipeline — Adding or Updating a Project

The portfolio system has **three layers** that must all be in sync for a project to render correctly on the site (card on `/portfolio` + detail page at `/projects/[slug]`).

### PORTFOLIO.md — Required Fields

Every project repo needs a `PORTFOLIO.md` in its root. These frontmatter fields control what appears on the site:

| Field | Required for | What it controls |
|-------|-------------|-----------------|
| `portfolio_enabled: true` | Visibility | Project appears in portfolio at all |
| `portfolio_priority` | Card ordering | Lower number = higher position (99 = hidden from cards) |
| `portfolio_featured` | Badge | "Featured" badge on card |
| `title` | Card + detail | Display name |
| `tagline` | Card | Description text under the title |
| `thumbnail` | **Card image** | Path to card thumbnail (e.g. `/images/portfolio/thumb.webp`) |
| `slides` | Detail page slider | Array of `{src, alt_en, alt_es}` objects |
| `demo_video_url` | Detail page video | Path to walkthrough video |
| `video_poster` | Detail page | Poster image for video player |
| `category` | Card badge | Category label (e.g. "Tools", "AI Automation") |
| `tech_stack` | Card + detail | Technology badges |
| `problem` | Detail page | "The Challenge" section |
| `key_features` | Detail page | Feature bullet list |
| `metrics` | Detail page | Results section |
| `status` | Card badge | e.g. "Production" |

**If `thumbnail` is missing, the card falls back to first slide → default SVG placeholder.**

### Thumbnail Resolution Chain

`portfolio.astro` → `getThumbnail()` resolves card images in this order:

1. **`projectDetails.ts` override** (`override.thumbnail`) — for cushlabs self-repo
2. **Generated JSON `thumbnail`** — from PORTFOLIO.md, resolved to CDN URL (`https://cdn.cushlabs.ai/...`) or local `/images/` path
3. **First slide** (`project.slides[0].src`) — fallback if no thumbnail
4. **Default SVG** (`/images/portfolio/default-card.svg`)

### Three-Step Sync Process

When adding a new project or updating assets:

```bash
# 1. Upload assets to R2 CDN (auto-detects diffs via MD5 hash)
npx tsx scripts/upload-to-r2.ts <repo-name>

# 2. Regenerate the portfolio JSON (pulls PORTFOLIO.md → projects.generated.json)
npx tsx scripts/generate-projects.ts

# 3. Build, commit, and push
npm run build
git add -A && git commit -m "chore: refresh projects data" && git push
```

**All three steps are required.** Skipping step 1 = broken images. Skipping step 2 = stale data. The JSON was last regenerated at the `generatedAt` timestamp in `projects.generated.json`.

For a full sync of all projects: `npx tsx scripts/upload-to-r2.ts` (no args).

### Optional: Rich Detail Page Copy (projectDetails.ts)

For projects that deserve better copy than the raw PORTFOLIO.md text, add a bilingual entry to `src/data/projectDetails.ts`. This controls:
- Headline, subheadline, challenge/solution narrative
- "Good For" / "Not For" / "What You Get" sections
- Results with checkmark styling

**Only use for rich text content and `demoUrl`.** Do NOT put image/video URLs here — they come from the generated JSON via PORTFOLIO.md.

### Cloudflare R2 CDN Details

All portfolio assets are served from **Cloudflare R2** (`cdn.cushlabs.ai`), not from individual project deployments.

- **R2 bucket:** `cushlabs-assets` with custom domain `cdn.cushlabs.ai`
- **Hash detection:** Compares local MD5 against R2 ETag — only re-uploads changed files
- **Repo aliases:** Some local clones differ from GitHub names (e.g., `stock-alert` clone is `ai-stock-alert`) — mapped in `REPO_ALIASES` in the upload script
- **Path resolution:** Searches `public/`, `assets/`, `client/public/`, `dist/` and scans `public/portfolio/`, `public/images/portfolio/`, `public/video/`, etc.
- **CI/Vercel skip:** `generate-projects.ts` detects `VERCEL`/`CI` env vars and uses committed JSON instead of regenerating (avoids stale GitHub API data)

### Upload Script Flags

```bash
npx tsx scripts/upload-to-r2.ts                # upload all (skip unchanged via hash)
npx tsx scripts/upload-to-r2.ts ny-eng         # upload one project only
npx tsx scripts/upload-to-r2.ts --dry-run      # preview without uploading
npx tsx scripts/upload-to-r2.ts --force         # re-upload all (ignore hash cache)
npx tsx scripts/upload-to-r2.ts ny-eng --force  # force re-upload one project
```

### Required .env Vars for R2

```
R2_ACCESS_KEY_ID=         # Cloudflare R2 API token (Object Read & Write)
R2_SECRET_ACCESS_KEY=     # Cloudflare R2 API secret
S3_API=                   # R2 S3-compatible endpoint URL
```

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
R2_ACCESS_KEY_ID=         # Cloudflare R2 access key
R2_SECRET_ACCESS_KEY=     # Cloudflare R2 secret key
S3_API=                   # R2 S3-compatible endpoint
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
