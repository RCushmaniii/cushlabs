# CushLabs.ai — PRD (Marketing Site + Portfolio + Content)

## 1) Summary

CushLabs.ai will be a **content-forward, bilingual (EN/ES) marketing site** for my solo AI engineering studio.

Primary goals:

- Present a cohesive brand story (solo operator, enterprise experience, modern stack)
- Convert visitors to conversations (email/contact CTA)
- Publish content (blog + case studies) that builds domain authority
- Showcase work via `/work` fed by GitHub automation

Market focus (v1):

- Mexico-first positioning, Spanish-first readability
- Cross-border delivery (US/MX), with clear outcomes and accountability

Voice & accountability:

- Use first-person voice ("I" / "me"), not "we" / "us"
- I own delivery end-to-end: architecture, implementation, performance, and outcomes

Non-goals (for v1):

- Full SaaS app / authenticated user accounts
- Client portal / billing

## 2) Target Users

- SMB founders / operators
- Technical leads at small teams
- Non-technical stakeholders evaluating “AI” vendors

Mexico-specific ideal customers:

- Professional services (legal, accounting, clinics) needing automation and better response time
- E-commerce / retail operators needing support automation and operational reporting
- Agencies and internal marketing teams needing faster content + lead workflows

## 3) Core Pages / Information Architecture

### v1 Pages

- `/` (Home)
  - Hero + positioning
  - Services overview
  - Proof (featured projects / outcomes)
  - Process (how engagements work)
  - CTA (contact)
- `/work`
  - Project directory with filtering
  - Featured projects emphasized
- `/blog`
  - SEO-friendly listing
- `/blog/[slug]`
- `/case-studies`
  - Listing
- `/case-studies/[slug]`
- `/about` (optional v1, but recommended)

### Locale routing

- English default at root:
  - `/`, `/work`, `/blog`, ...
- Spanish under prefix:
  - `/es/`, `/es/work`, `/es/blog`, ...

## 4) Bilingual Requirements (EN + ES)

### Requirements

- All UI labels and marketing copy must be available in **English and Spanish**
- SEO must include:
  - Correct `<html lang>`
  - `hreflang` alternates between EN and ES
  - Canonicals per locale

### Proposed Implementation (Astro)

- Use Astro’s i18n routing (defaultLocale: `en`, locales: `['en','es']`)
- Store translations in `src/i18n/translations/{en,es}.ts`
- Use a small `t(key, locale)` helper
- Language switcher generates equivalent route:
  - `/work` ↔ `/es/work`

### Lessons to carry over (NY project)

- Don’t rely on querystring for language (`?lang=es`) for SEO; use **path-based locale**
- Keep translation keys stable; avoid ad-hoc strings
- Make language switching predictable and crawlable

Mexico-specific language guidance:

- Spanish should read naturally for Mexico (not generic machine translation)
- Prefer short, direct copy and clear CTAs

## 5) Theme (Light/Dark)

### Requirements

- Site supports light + dark
- Theme persists between visits
- Defaults to OS preference if user has not chosen
- Ensure contrast remains accessible (WCAG AA as baseline)

### Proposed Implementation

- Tailwind `darkMode: 'class'`
- CSS tokens for semantic colors:
  - `--bg`, `--fg`, `--muted`, `--surface`, `--border`
- Apply `.dark` class to `<html>`
- Toggle component:
  - stores `theme=light|dark` in `localStorage`
  - applies before paint (prevent flash)

## 6) SEO / Metadata Convention

### Site pages

- Page-level title/description via layout props
- OpenGraph + Twitter meta
- JSON-LD Organization

### `/work` data metadata

- Use **GitHub Topics** as “metadata we make up”
  - `featured`
  - `cat-ai`, `cat-web`, `cat-automation`, `cat-devtools`
  - `stack-astro`, `stack-nextjs`, `stack-supabase`
  - `status-shipped`, `status-wip`

## 7) Portfolio Generator (GitHub Automation)

### Inputs

- GitHub repos for owner

### Output

- `src/data/projects.generated.json` committed to repo

### Extraction rules

- Title: prettified repo name
- Summary: repo description OR first meaningful README paragraph
- Demo URL: homepage field OR README “Demo/Live/Production” link OR GitHub Pages guess (if enabled)
- Metadata: topics, primary language(s), last push date, stars

### Automation

- GitHub Actions scheduled workflow to refresh JSON weekly

## 8) Performance Requirements

- Static output (Astro SSG)
- Keep JS minimal on marketing pages
- Images optimized (use modern formats and lazy loading)
- Avoid layout shift

## 9) Security / Safety Requirements

- No secrets in client bundles
- `.env` must never be committed
- If tokens are exposed locally, rotate them
- Use dependency updates + audits regularly

## 10) Quality Bar

- Accessibility: semantic HTML, keyboard navigation, focus states, reduced motion
- Error handling: graceful empty states (especially `/work`)
- Codebase: clear structure, SRP/SoC, reusable components

## 11) v1 Milestones

- M1: Site foundation (Astro, routing, layout, header/footer, theme)
- M2: Bilingual system + content scaffolding (blog/case studies)
- M3: `/work` integrated + filtering + featured projects
- M4: Polish (SEO, performance, copy, analytics)
