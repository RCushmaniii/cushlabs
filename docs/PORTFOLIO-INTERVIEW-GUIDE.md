# CushLabs.ai — Portfolio Interview Guide

> Reference document for discussing the CushLabs.ai repository in interviews.
> Covers features, architecture decisions, and answers to technical deep-dive questions.

---

## What It Is

A fully bilingual (EN/ES) static marketing site for **CushLabs AI Services** — Robert Cushman's AI integration and software development consultancy. Built with **Astro 4 + Tailwind CSS**, deployed on Vercel as static HTML with serverless functions for dynamic features.

---

## Architecture Slide Deck

Visual walkthrough slides for presenting the CushLabs.ai system in interviews. Located in `public/images/portfolio/`.

### Slide 1 — Title
![CushLabs AI Services: The Self-Maintaining Bilingual Portfolio](/images/portfolio/cushlabs-01.png)
*A Technical Deep Dive into Automated Architecture*

### Slide 2 — System Overview
![Not Just a Website, But a System](/images/portfolio/cushlabs-02.png)
*Three pillars: Fully Bilingual (true localization with smart routing), Automated Sync (GitHub-to-Site pipeline), and Serverless Booking (custom wizard bypassing generic iframe embeds). Built with Astro, Tailwind CSS, TypeScript. Deployed on Vercel.*

### Slide 3 — Premium Design Behavior
![Premium Design is About Behavior, Not Just Colors](/images/portfolio/cushlabs-03.png)
*Zero-flash theme toggling (pre-paint script), time-based theming (7am–7pm logic), SVG fractalNoise texture at 1.5% opacity, micro-interactions (card lift, thumbnail zoom), and typography pairing (Space Grotesk display + Source Serif 4 body).*

### Slide 4 — Enterprise SEO Stack
![Engineering Visibility: The Enterprise SEO Stack](/images/portfolio/cushlabs-04.png)
*Layered stack: JSON-LD Schema.org structured data, auto-generated hreflang tags and canonicals, lazy video loading via requestIdleCallback, zero-JS FAQ accordion (CSS-only), and zero-JS interactive components.*

### Slide 5 — Bilingual Architecture
![True Bilingual Architecture (No-Library Approach)](/images/portfolio/cushlabs-05.png)
*Standard i18next: 40KB+ bundle, runtime overhead. Custom TypeScript solution: 24 lines of code, zero runtime bloat. Key features: smart routing, type-safe dictionaries, build-time parity enforcement via pre-deploy audit.*

### Slide 6 — Serverless Booking Wizard
![The Serverless Booking Wizard](/images/portfolio/cushlabs-06.png)
*3-step flow: Date & Time Selection → Details Input → Confirmation. Cloudflare Worker queries Google Calendar API for real-time availability. No iframes or external redirects. Auto-selects "Today" or "Tomorrow" based on current time (6pm cutoff). Fully branded UI matching the design system.*

### Slide 7 — WhatsApp Integration
![Localization Beyond Language: The WhatsApp Integration](/images/portfolio/cushlabs-07.png)
*LATAM clients prefer WhatsApp over email. The system provides first-class deep links that respect the user's current language context — pre-filled message changes based on EN/ES locale.*

### Slide 8 — Security & Anti-Scraping
![Security & Anti-Scraping](/images/portfolio/cushlabs-08.png)
*Email split-attribute obfuscation: `[data-u="robert"]` + `[data-d="cushlabs.ai"]` assembled into `mailto:` link only on click via JavaScript. The email address never exists as a contiguous string in the source code. Invisible to scrapers, seamless for humans.*

---

## Features & Benefits Overview

### 1. Full Bilingual Architecture (EN/ES)

- Custom TypeScript-only i18n system — no heavy library dependency
- Every page has a Spanish counterpart with full content parity
- Smart URL routing: English at `/`, Spanish at `/es/`
- Localized slugs where it matters (`/consultation` vs `/es/reservar`)
- Language switcher pills in the header with instant navigation
- WhatsApp deep links with locale-appropriate pre-filled messages
- Pre-deploy audit automatically validates that both language files have identical key structures

### 2. Automated GitHub Portfolio Sync

- **GitHub Actions workflow** runs weekly (Sundays at 2am UTC) to fetch all public repos via the GitHub API
- Extracts metadata: languages (byte counts), stars, forks, topics, demo URLs
- Reads each repo's README to extract demo links and summaries via regex
- Outputs to `projects.generated.json` — zero manual maintenance
- Featured projects controlled by simply adding a `"featured"` topic to the GitHub repo
- Smart diffing in CI — only commits if the JSON actually changed, with `[skip ci]` to prevent loops
- **Rich content override system** (`projectDetails.ts`) layers curated marketing copy, screenshots, and video URLs on top of the auto-synced data without touching the pipeline

### 3. Custom Booking Wizard (No Calendly Embed)

- 3-step flow: Date/Time → Details → Confirmation
- Fetches real-time availability from a **Cloudflare Worker** that queries Google Calendar's FreeBusy API
- Auto-selects today (or tomorrow if after 6pm)
- Auto-advances on time slot selection (300ms delay for visual feedback)
- Automatically creates a Google Calendar event with Google Meet link and email reminders
- IP-based rate limiting (5 bookings/hour per IP)
- Bilingual error messages and confirmation copy
- Fully styled to match the site's design system — not a third-party iframe

### 4. Project Detail Pages with Media

- Dynamic `[slug]` routes for each portfolio project
- **Image carousel/slider** with hover-reveal prev/next arrows, dot navigation, and slide counter — all vanilla JS, no external library
- **Video walkthrough** with custom poster and play button overlay
- Lazy video loading via `requestIdleCallback`
- Challenge → Solution → Results narrative structure
- "Good for" / "Not for" / "What you get" highlights
- Tech stack tags, live demo links, source code links

### 5. Services Page with Sticky Navigation

- Secondary sticky nav bar anchored to service sections and pricing
- 3 core services with problem/solution split presentation
- 3 pricing tiers (Starter / Core / Premium) with comparison table
- Founding client discount (15% off for first 3 clients) baked into copy

### 6. Enterprise-Grade SEO

- Auto-generated **hreflang tags** (en, es, x-default) on every page
- Canonical URLs computed automatically from `Astro.site` + pathname
- Full **Open Graph** and **Twitter Card** meta tags
- **JSON-LD Schema.org** structured data (Organization type)
- `@astrojs/sitemap` with proper i18n alternate links
- Custom OG images (falls back to GitHub's OpenGraph image API for projects)

### 7. Anti-Scraper Email Protection

- Email address split across `data-u` and `data-d` attributes in the HTML
- Assembled into a `mailto:` link only via client-side JavaScript on `DOMContentLoaded`
- The email never appears as a readable string in the HTML source

### 8. Smart Dark/Light Theme

- **Time-based default**: light mode 7am–7pm Mexico City time, dark otherwise
- User preference persists in `localStorage`
- Inline script runs **before paint** to prevent flash-of-wrong-theme (FOUC)
- Smooth sun/moon icon toggle in the header

### 9. Premium Visual Design

- **SVG fractalNoise texture overlay** at 1.5% opacity across the entire viewport — subtle depth
- Animated gradient orb blobs on hero sections (CSS `blur-[120px]` + `animate-pulse`)
- Staggered `fade-in-up` entrance animations with deliberate delays
- Hover micro-interactions: card lift (`-translate-y-1`), thumbnail zoom (`scale-105`), arrow slide (`translate-x-1`)
- Orange selection highlight (`::selection` styled)
- `.glow-orange` box-shadow utility for accents

### 10. Typography & Brand System

- **Space Grotesk** (display) + **Source Serif 4** (body)
- CSS custom properties for semantic theming (`--bg`, `--fg`, `--muted`, `--surface`, `--border`)
- Brand orange `#FF6A3D` used consistently for CTAs, active states, tags, borders

### 11. Contact Form (Formspree)

- Client-side submission to Formspree (no backend needed)
- Loading spinner on submit, inline error display with 5-second auto-hide
- Form replaced with success message on completion
- Two-column layout: form + contact info sidebar (email, WhatsApp, timezone, CTA)

### 12. FAQ Accordion

- Native HTML `<details>`/`<summary>` — **zero JavaScript**
- CSS-only chevron rotation on open (`group-open:rotate-180`)

### 13. Solutions/Portfolio Gallery

- JS filter buttons (All / Featured) — shows/hides cards via display toggle
- Project cards with thumbnails, status badges, tech tags
- Empty state handling when no projects match the filter

### 14. Video Section with Performance Optimization

- Custom branded play button overlay with poster image
- `requestIdleCallback` lazy-loads video after page idle (2s Safari fallback)
- Video ships with `preload="none"` — zero bytes on initial load
- Auto-restores poster when video ends

### 15. CI/CD Pipeline & Quality Gates

- **GitHub Actions** for automatic portfolio sync (weekly + on push + manual)
- Smart diffing — only commits if data actually changed
- Pre-deploy audit script with 6 validation checks:
  - Git working tree hygiene
  - Required environment variables
  - Secret leak detection (GitHub tokens, OpenAI keys)
  - i18n dictionary parity (en/es key sync)
  - TypeScript / Astro type checking
  - Build output verification (13 expected HTML paths in dist/)

---

## Problems This Site Solves

| Problem | Solution |
|---------|----------|
| Portfolio gets stale | Automated GitHub sync keeps it current weekly |
| Bilingual sites are hard to maintain | TypeScript i18n with enforced parity via pre-deploy audit |
| Calendly embeds break design consistency | Custom booking wizard with same design system |
| Email scrapers harvest contact info | Split-attribute obfuscation, assembled only in JS |
| Dark mode flash on page load | Inline theme script runs before paint |
| LATAM clients prefer WhatsApp | First-class WhatsApp integration with pre-filled messages |
| SEO for bilingual sites is tricky | Auto-generated hreflang, canonical, OG, sitemap |
| Project pages need rich content but data comes from GitHub | Override system layers marketing copy on auto-synced data |
| Video kills page load performance | `requestIdleCallback` defers loading until browser is idle |
| Secrets accidentally committed | Pre-deploy audit scans all tracked files for token patterns |
| Translation keys drift between languages | Automated key-by-key diff catches any mismatch before deploy |

---

## What Makes It Special

The standout quality is that this isn't just a marketing site — it's a **self-maintaining portfolio system**. The GitHub-to-site pipeline means you can push a new project to GitHub, add a `featured` topic, optionally write rich content overrides, and the site updates itself. Combined with the fully custom booking flow, anti-scraper protections, time-aware theming, and true bilingual parity (not just translated strings but localized URLs and culturally appropriate copy), this is a surprisingly sophisticated static site that punches well above its weight.

---

## Technical Interview Deep-Dive Questions

### Q1: "How do you handle portfolio stale-data?"

**Answer:**

The portfolio is a two-layer system — automated data plus curated overrides.

**Layer 1: Automated GitHub sync** (`scripts/generate-projects.ts`)

A GitHub Actions workflow runs every Sunday at 2am UTC (also on manual dispatch or when the sync script changes). It uses `@octokit/rest` to paginate through every public repo, and for each one:

- Fetches repo metadata (description, stars, forks, topics, language, dates)
- Calls `repos.listLanguages()` for byte-count breakdowns per language
- Reads the README via `repos.getReadme()` and runs regex patterns to extract demo URLs (matches `vercel.app`, `netlify.app`, `github.io`, or markdown links labeled "demo"/"live"/"preview")
- Extracts the first paragraph over 50 characters as a summary (skipping headings, images, code blocks)
- Categorizes topics using a prefix convention: `cat-` = category, `stack-` = tech stack, `status-` = project status, `featured` = marks it for the homepage

Output is sorted (featured first, then by last-pushed date) and written to `src/data/projects.generated.json`.

**Layer 2: Rich content overrides** (`src/data/projectDetails.ts`)

For featured projects, a separate TypeScript file provides:

- Custom thumbnail, demo URL, and video walkthrough URL
- An array of screenshots with bilingual alt text
- Full EN/ES copy: headline, subheadline, challenge narrative, solution overview, technical highlights, "good for"/"not for" lists, deliverables, and measurable results

The project detail page merges both layers at build time via `getProjectDetailOverride(slug)`. GitHub data is the baseline; the override enriches it. Projects without overrides still render a complete page from auto-synced data alone.

**Key point:** Adding a new portfolio piece requires zero code changes. Push a repo, add a `featured` topic if desired, optionally add an override entry. The site handles the rest.

---

### Q2: "Why didn't you just use an i18n library like i18next?"

**Answer:**

The entire i18n system is 24 lines of TypeScript:

```typescript
export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/es') ? 'es' : 'en';
}

export function getLocalizedPath(pathname: string, to: Locale): string {
  const normalized = pathname.startsWith('/es')
    ? pathname.replace(/^\/es(\/|$)/, '/')
    : pathname;
  if (to === 'en') return normalized === '' ? '/' : normalized;
  return normalized === '/' ? '/es' : `/es${normalized}`;
}

export function t<L extends Locale>(locale: L) {
  return dictionaries[locale];
}
```

That's the entire runtime. No initialization, no middleware, no namespace loading, no pluralization engine, no ICU message format parser.

**What i18next would have added for a two-language static site:**
- ~40KB+ minified for the library + language detection + HTTP backend plugins
- Runtime initialization and async namespace loading
- A `useTranslation` hook or equivalent that runs on every render
- Configuration for interpolation, pluralization, and context features that aren't needed here

**Why it's unnecessary:** Astro is static-site-generation. Every page knows its locale at build time from the URL structure (`/` = English, `/es/` = Spanish). There's no client-side language detection or runtime switching — the language switcher is just an `<a>` tag pointing to `getLocalizedPath(currentPath, otherLocale)`. The URL *is* the locale.

The translation dictionaries (`en.ts` and `es.ts`) are typed TypeScript objects that get tree-shaken at build time, so each page only ships the strings it uses. And the pre-deploy audit validates parity automatically — it imports both files, flattens all nested keys, and diffs them. If one language has a key the other doesn't, the build fails with the exact missing keys listed.

---

### Q3: "How does the booking system handle timezone availability without a backend server?"

**Answer:**

It does have a backend — just not a traditional one. It's a **Cloudflare Worker** (`workers/booking-worker.js`) acting as a serverless API between the static site and Google Calendar.

**Architecture:**

The Astro site injects `API_BASE` (the Worker URL) into the page via a `<script type="application/json">` config block. The booking wizard's JavaScript reads that config and makes two API calls:

1. `GET /slots/{date}?lang=en|es` — Fetch available time slots
2. `POST /book` — Create the booking

**How the Worker calculates availability:**

- Checks day of week: Sundays blocked. Saturdays: `09:00-13:00`. Weekdays: `09:00-14:00` + `16:00-20:00` (lunch break gap). All configurable via env vars.
- Authenticates to Google Calendar using OAuth2 refresh token flow with token caching (reuses access token until 5 min before expiry).
- Calls Google Calendar's **FreeBusy API** to get all existing events for that day's range.
- Generates 30-minute slot candidates, filters out those that overlap with busy periods and those less than 3.5 hours from now (giving Robert preparation time).
- Results cached for 5 minutes per date with a 30-entry LRU eviction strategy.

**When a booking is confirmed (`POST /book`):**

- Input sanitization: strips HTML/control characters, truncates to 200 chars
- Email regex validation
- IP-based rate limiting (default 5 bookings/hour/IP)
- Creates a Google Calendar event with:
  - Bilingual summary ("AI Strategy Consultation" / "Consulta de Estrategia de IA")
  - Auto-generated Google Meet link via `conferenceData.createRequest`
  - Email reminders at 24 hours and 1 hour before
  - Client added as attendee (they receive a calendar invite automatically)

**Why this matters:** The site ships as static HTML with zero server runtime cost. The Cloudflare Worker handles real-time logic on the free tier. No third-party widget means the booking UI matches the site's design system perfectly.

---

### Q4: "How do you ensure the video backgrounds don't slow down the page load?"

**Answer:**

The video ships with `preload="none"` — the browser downloads zero video bytes on initial page load. The loading strategy is two-phase:

**Phase 1 — Poster-only render:** The user sees a static JPEG poster with a branded play button overlay. The `<video>` element is hidden via CSS class. LCP (Largest Contentful Paint) scores against the poster image, not the video.

**Phase 2 — Idle preloading:**

```javascript
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    video.preload = 'auto';
  }, { timeout: 3000 });
} else {
  // Safari fallback
  window.addEventListener('load', () => {
    setTimeout(() => {
      video.preload = 'auto';
    }, 2000);
  });
}
```

`requestIdleCallback` fires only after all critical rendering, layout, and JavaScript execution is complete — during the browser's idle periods between frames. The `timeout: 3000` is a safety net: if the browser is never idle for 3 seconds, the callback fires anyway.

Safari doesn't support `requestIdleCallback`, so the fallback waits for the `load` event plus 2 seconds, then flips `preload` to `auto`.

**On click:** Poster hides, video unhides, `.play()` fires. Since the video has been quietly preloading during idle time, playback usually starts instantly.

**On video end:** Video resets (`currentTime = 0`), hides itself, poster reappears.

**Net effect on Core Web Vitals:** The video contributes zero bytes to initial page weight, doesn't block FCP or LCP, and doesn't compete with critical resources for bandwidth.

---

### Q5: "How do you prevent the site from deploying if the data sync fails?"

**Answer:**

Three layers of protection:

**Layer 1: Graceful degradation in the sync script** (`generate-projects.ts`)

If `GITHUB_TOKEN` isn't set, the script checks whether `projects.generated.json` already exists. If it does, it exits cleanly — the build proceeds with last-known-good data. If it doesn't exist (first-time setup without a token), it exits with code 1, killing the build.

```typescript
if (!GITHUB_TOKEN) {
  if (existsSync(outputPath)) {
    console.warn('GITHUB_TOKEN not set, using existing projects.generated.json');
    process.exit(0);
  }
  console.error('GITHUB_TOKEN environment variable is required');
  process.exit(1);
}
```

**Layer 2: Smart diffing in CI** (`.github/workflows/refresh-projects.yml`)

The GitHub Actions workflow diffs the output after sync:

```yaml
git diff --exit-code src/data/projects.generated.json || echo "changed=true" >> $GITHUB_OUTPUT
```

If the JSON is identical to what's committed (no new repos, no updated metadata), it skips the commit. The `[skip ci]` commit message tag prevents triggering another CI run.

**Layer 3: Pre-deploy audit** (`scripts/audit-predeploy.ts`)

A comprehensive validation script with 6 checks:

1. **Repo hygiene** — warns on uncommitted changes
2. **Environment variables** — fails on missing `GITHUB_TOKEN` / `GITHUB_OWNER`; warns on optional vars
3. **Secret leak detection** — walks every text file, runs regex for GitHub tokens (`ghp_`, `github_pat_`), OpenAI keys (`sk-`). Secrets in tracked source files = hard FAIL. Secrets in `.env` files = WARN.
4. **i18n parity** — dynamically imports `en.ts` and `es.ts`, flattens every nested key path, diffs both sets. Any missing key in either language = hard FAIL with exact keys listed.
5. **TypeScript / Astro check** — runs `astro check` (compiler-level type validation)
6. **Build + artifact verification** — runs full build, then confirms `dist/` contains 13 expected HTML files across both languages (including `es/reservar/index.html`, `projects/react-vite-tailwind-base/index.html`, etc.)

Any FAIL exits with code 1, blocking the deploy. The audit catches everything from missing translations to leaked secrets to broken builds before anything reaches production.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Astro 4.16 (Static Site Generation) |
| Styling | Tailwind CSS 3.4 |
| Language | TypeScript |
| Deployment | Vercel (static) |
| Booking API | Cloudflare Workers |
| Calendar | Google Calendar API (OAuth2) |
| Contact Form | Formspree |
| Portfolio Sync | GitHub Actions + Octokit |
| Fonts | Space Grotesk (display) + Source Serif 4 (body) |
| i18n | Custom 24-line TypeScript system |

---

## Pages Inventory

| English | Spanish | Purpose |
|---------|---------|---------|
| `/` | `/es` | Homepage (Hero, Video, Problem/Solution, HowItWorks, WhyCushLabs, FeaturedWork, FAQ, CTA) |
| `/about` | `/es/about` | Trust stats, approach pillars, Robert's bio, target clients |
| `/services` | `/es/services` | Service catalog, sticky nav, 3 tiers, pricing table |
| `/solutions` | `/es/solutions` | Portfolio gallery with filter (All / Featured) |
| `/contact` | `/es/contact` | Formspree form + contact sidebar |
| `/consultation` | `/es/reservar` | Custom booking wizard (localized slug) |
| `/projects/[slug]` | `/es/projects/[slug]` | Dynamic project detail with media |
| `/faq` | `/es/faq` | FAQ page |
| `/blog` | `/es/blog` | Blog listing |
| `/blog/[slug]` | `/es/blog/[slug]` | Blog post |
| `/privacy` | `/es/privacy` | Privacy policy |
| `/terms` | `/es/terms` | Terms of service |
| `/404` | — | Custom 404 |
