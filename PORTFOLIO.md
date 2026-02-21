---
# =============================================================================
# PORTFOLIO.md — CushLabs.ai
# =============================================================================
portfolio_enabled: true
portfolio_priority: 1
portfolio_featured: true
portfolio_last_reviewed: "2026-02-20"

title: "CushLabs.ai"
tagline: "Self-maintaining bilingual portfolio with serverless booking and build-time i18n enforcement"
slug: "cushlabs"

category: "Tools"
target_audience: "Solo consultants and small agencies needing a low-maintenance bilingual web presence"
tags:
  - "astro"
  - "tailwind"
  - "typescript"
  - "i18n"
  - "cloudflare-workers"
  - "google-calendar"
  - "github-actions"
  - "seo"
  - "bilingual"
  - "serverless"

thumbnail: "/images/portfolio/cushlabs-01.png"
hero_images:
  - "/images/portfolio/cushlabs-01.png"
  - "/images/portfolio/cushlabs-02.png"
  - "/images/portfolio/cushlabs-03.png"
  - "/images/portfolio/cushlabs-04.png"
  - "/images/portfolio/cushlabs-05.png"
  - "/images/portfolio/cushlabs-06.png"
demo_video_url: ""

live_url: "https://cushlabs.ai"
demo_url: "https://cushlabs.ai"
case_study_url: ""

problem_solved: |
  Bilingual marketing sites go stale the moment you stop manually updating them. Portfolio pages die after 3-4 projects because maintenance costs multiply across languages. Third-party booking widgets break design consistency and add monthly fees. And static sites — while fast and cheap — traditionally can't handle dynamic features like scheduling without a full backend.

key_outcomes:
  - "27+ portfolio projects synced automatically from GitHub with zero manual data entry"
  - "0 KB i18n runtime overhead — 24-line custom system replaces 40KB+ i18next"
  - "6 automated pre-deploy checks enforcing bilingual parity, secret scanning, and build validation"
  - "Sub-second page loads with static HTML edge-cached globally"
  - "$0/month booking system via Cloudflare Workers replacing $8-16/month Calendly"
  - "100% EN/ES content parity enforced at build time — no language drift"

tech_stack:
  - "Astro 4.16"
  - "TypeScript 5.9"
  - "Tailwind CSS 3.4"
  - "Cloudflare Workers"
  - "Google Calendar API"
  - "GitHub Actions"
  - "JSON-LD"

complexity: "Production"
---

## Overview

CushLabs.ai is the production website for CushLabs AI Services — an AI integration and software development consultancy serving small and mid-sized businesses across the US and Mexico. It's not a brochure site with a contact form. It's an operational system designed to run itself.

The site serves two audiences simultaneously: English-speaking US businesses and Spanish-speaking Mexican businesses, with full content parity enforced at build time. Every page, every translation key, every SEO meta tag exists in both languages — or the build fails. This isn't a best practice documented in a wiki somewhere. It's a gate that blocks deployment.

Three systems make the site self-maintaining. First, the GitHub account itself is the source of truth for portfolio data — a weekly CI pipeline fetches metadata from every repository and the site consumes it at build time, so adding a project to the portfolio never requires touching the website code. Second, a custom Cloudflare Worker replaces third-party booking services entirely, querying Google Calendar availability and creating events with Meet links — matching the site's design system exactly, at zero monthly cost. Third, a 6-check pre-deploy audit validates everything from secret leaks to translation parity to build artifact integrity before any code reaches production.

The architecture reflects a core belief: the best systems are the ones you don't have to think about. Portfolio updates happen automatically. Bilingual consistency is enforced mechanically. Security scanning runs on every deploy. The site gets better over time without requiring attention.

## The Challenge

### Portfolio Pages Are Where Consulting Credibility Goes to Die

Every consultant knows they need a portfolio. Few maintain one past the first quarter. The problem isn't motivation — it's friction. Each new project means writing a description, taking screenshots, formatting the content, adding it to the site, and deploying. For a bilingual site, double every step. For a solo consultant who's also doing the actual client work, this maintenance cost compounds until the portfolio section quietly becomes the oldest, most outdated part of the site.

The irony is brutal: the section of the website that's supposed to demonstrate current capability ends up demonstrating that you stopped updating your website six months ago. Prospective clients see a portfolio with 3 projects from last year and draw conclusions about your workload, your relevance, and your attention to detail.

Enterprise agencies solve this with dedicated content teams and CMS workflows. Solo consultants and small agencies don't have that luxury. They need a system where the portfolio updates itself from the work they're already doing.

### Bilingual Content Drift Is a Silent SEO Killer

Running a site in two languages isn't twice the work — it's more like 2.5x, because of the coordination overhead. When you update the English services page, do you remember to update the Spanish one? When you add a new FAQ entry, does it exist in both translation files? When you fix a typo in a meta description, did you check both language versions?

The answer, consistently, is no. English gets the updates. Spanish lags behind. Over weeks and months, the two versions drift apart. Search engines notice: mismatched hreflang tags, pages that exist in one language but not the other, canonical URLs that point to the wrong version. Google's crawler interprets these inconsistencies as low-quality signals and ranks both versions lower.

For a consultancy serving the US-Mexico corridor, this drift directly undermines the bilingual positioning that's supposed to be a competitive advantage. The site claims "Fully Bilingual EN/ES" while the Spanish version is three updates behind. Prospective clients who switch to Spanish and find outdated content form an immediate trust impression — and it's not a good one.

Most bilingual site solutions involve heavyweight CMS platforms with translation management workflows, review cycles, and approval chains. For a two-language site run by one person, that infrastructure costs more in overhead than the problem it solves.

### Third-Party Booking Widgets Undermine Premium Positioning

Calendly, Cal.com, Acuity — they all work. They handle scheduling, send confirmation emails, integrate with calendars. But they all share the same fundamental problem: they embed a third-party interface inside your carefully designed site, and it never quite fits.

The fonts are different. The colors are close but not exact. The spacing doesn't match your grid. The loading behavior adds a visible flash. On mobile, the iframe scrolling feels wrong. The confirmation page has the scheduling service's branding, not yours.

For a consultancy selling premium AI integration services — where the pitch is "we build systems with attention to detail" — having a booking flow that visually breaks from the rest of the site contradicts the message. Every design inconsistency is a tiny credibility leak. Individually they're forgettable. Collectively they shape the prospect's perception of quality before the first conversation happens.

Beyond design, there's the cost. Calendly's Professional plan runs $12/month. Cal.com's Team plan is $12/month. These are modest amounts individually, but they represent recurring costs for functionality that boils down to: check if a calendar slot is open, show available times, create an event. That's an API call, a filter, and a write — not $144/year of value.

### Static Sites Traditionally Can't Do Dynamic Things

Static site generators produce fast, cheap, globally distributed HTML. They're the right choice for content-heavy marketing sites. But the moment you need anything dynamic — a booking flow, a contact form that doesn't use a third-party service, real-time availability — you're told to reach for a full-stack framework.

Next.js, Nuxt, SvelteKit — they can handle it, but they bring server-side rendering, serverless functions in a framework context, larger build outputs, and hosting that costs more than a CDN. For a site that's 95% static marketing content and 5% interactive booking, deploying a full-stack framework is architectural overkill with ongoing cost implications.

The gap in the market is: static performance and simplicity for the content, with surgical serverless intervention for the two or three features that actually need it.

### Security Is an Afterthought Until It's an Incident

Solo consultants rarely think about security for their marketing site. But the site has a contact form (injection surface), a booking system (API abuse surface), email addresses (scraping target), and environment variables (secret leak risk). One exposed GitHub token in a build log, one rate-limit-free booking endpoint, one scraped email address feeding a spam list — these are small problems that become real ones.

Enterprise sites have security teams and penetration testing. Small consultancy sites have whatever the developer remembered to add. The gap isn't capability — it's systematic enforcement. Without automated scanning, rate limiting, and input sanitization built into the deployment pipeline, security depends entirely on human discipline, which degrades over time.

## The Solution

### Self-Maintaining Portfolio via GitHub Sync

The site treats the GitHub account as a database. Every repository that contains a `portfolio.md` file with `portfolio_enabled: true` becomes a portfolio entry on the site automatically. The metadata — title, tech stack, description, demo URL, thumbnail — lives alongside the code it describes, in the repo where it's most likely to stay current.

A weekly GitHub Actions pipeline runs `generate-projects.ts`, which authenticates to the GitHub API, fetches every public (and private) repository, extracts the `portfolio.md` frontmatter, and outputs `src/data/projects.generated.json`. Astro consumes this JSON at build time and renders the portfolio page.

The pipeline includes three safeguards. Smart diffing compares the new JSON against the existing file and only creates a commit when data actually changes — no noise in the git history. `[skip ci]` on automated commits prevents the commit from triggering another build, which would trigger another commit, which would loop infinitely. And graceful degradation means that if the GitHub token expires or the API is down, the build proceeds with the last known good data instead of failing.

A TypeScript override system (`src/data/projectDetails.ts`) lets curated marketing copy layer on top of the automated data. The GitHub sync handles the structured metadata; the overrides handle the storytelling. Clean separation, no conflicts.

The result: 27+ portfolio projects displayed with zero manual site updates. When a new project ships, the developer pushes a `portfolio.md` file to the repo. Within a week, the site has a new portfolio entry. No CMS. No deployment. No "I need to update the website" task that never gets prioritized.

### Custom Serverless Booking Wizard

The booking system is a Cloudflare Worker that replaces Calendly entirely. The 3-step flow — select a date/time, enter your details, confirm — runs against Google Calendar's API in real time.

**Step 1: Availability.** The Worker authenticates to Google Calendar via OAuth2 service account credentials, queries the FreeBusy endpoint for the selected date, and generates 30-minute slots. Slots are filtered to remove conflicts with existing events, and same-day bookings are excluded if they're less than 3.5 hours away (preventing last-minute surprise meetings). Results are cached for 5 minutes to reduce API calls during high-traffic periods.

**Step 2: Details.** The prospect enters their name, email, company, and a brief description of what they need. Every field is sanitized: HTML and control characters are stripped, inputs are truncated to 200 characters. A honeypot field catches basic bot submissions.

**Step 3: Confirmation.** The Worker creates a Google Calendar event with the prospect's details in the description and auto-generates a Google Meet link. Both parties receive calendar invitations.

Rate limiting enforces 5 bookings per hour per IP address, preventing abuse without affecting legitimate prospects. CORS headers restrict which origins can call the Worker, preventing the booking endpoint from being embedded on unauthorized sites.

The UI is built with the site's own design system — Space Grotesk headings, `cush-orange` accent color, matching dark mode behavior. There's no iframe, no third-party branding, no visual inconsistency. The booking flow feels like part of the site because it is part of the site.

Cost: $0/month on Cloudflare's free tier. Calendly Professional equivalent: $12/month ($144/year).

### Build-Time Bilingual Enforcement

The i18n system is three TypeScript functions totaling 24 lines. `getLocaleFromPathname()` extracts the locale from the URL. `getLocalizedPath()` converts a path to the target locale. `t()` returns the translation dictionary. Every page knows its locale at build time from the URL structure (`/` for English, `/es/` for Spanish) — there's no client-side language detection, no runtime switching, no JavaScript shipped for translation.

The pre-deploy audit is where enforcement happens. It dynamically imports both `en.ts` and `es.ts`, walks every nested key in both objects, and diffs the key sets. If any key exists in English but not Spanish (or vice versa), the build fails with a specific error message identifying the missing key and which language it's missing from.

This turns bilingual parity from a manual review step into a mechanical constraint. A developer can't accidentally deploy a page that exists in one language but not the other. A translation key can't be added to English without adding it to Spanish. The system doesn't rely on discipline or checklists — it relies on the build pipeline refusing to produce output.

The 6-check pre-deploy audit also covers: repository hygiene (required files exist), environment variables (critical vars are set), secret leak scanning (regex patterns for `ghp_`, `github_pat_`, `sk-` across all source files), TypeScript/Astro type validation, and build artifact verification (13 expected HTML paths across both languages confirm the output is complete).

### Static Core with Serverless Edges

Astro generates pure static HTML for every content page — home, about, services, portfolio, blog, contact, and their Spanish mirrors. The HTML is pre-rendered at build time, deployed to a CDN edge network, and served globally with sub-second time-to-first-byte. No server processes, no cold starts, no compute costs.

The two features that need dynamic behavior — the booking wizard and the contact form — route through Cloudflare Workers at the edge. Workers execute in under 50ms, have no cold start penalty, and run on Cloudflare's free tier for the volume a consultancy site generates.

This architecture means the entire site costs $0/month to host and operate (within CDN and Workers free tiers), while delivering performance that most full-stack applications can't match. The tradeoff is that content updates require a rebuild and deploy — but since the portfolio syncs automatically and translation changes are infrequent, this is a non-issue in practice.

### Performance Engineering

The homepage includes a brand video that could easily dominate initial page weight. Instead, the video element ships with `preload="none"` — zero bytes downloaded on page load. A script uses `requestIdleCallback` to switch the preload attribute to `"auto"` only when the browser reports idle time, with a 3-second timeout fallback. A Safari-specific path uses the `load` event plus a 2-second delay (Safari doesn't support `requestIdleCallback`). The video loads invisibly in the background, ready to play when the user scrolls to it, without ever competing with critical content for bandwidth.

### Security by Default

Security isn't a section in a checklist — it's embedded in the deployment pipeline. Email addresses are split across `data-u` and `data-d` HTML attributes and assembled into `mailto:` links only via client-side JavaScript, defeating the HTML scrapers that feed spam lists. The pre-deploy audit scans every tracked source file for patterns matching GitHub tokens and OpenAI keys, failing the build if any secrets leak into the codebase. The booking Worker sanitizes every input field (stripping HTML, truncating to safe lengths) and enforces per-IP rate limits. CORS configuration restricts which domains can call the Worker endpoints.

## Technical Highlights

- **Zero-maintenance portfolio pipeline** — GitHub Actions weekly sync, smart diffs, `[skip ci]` loop prevention, graceful degradation without tokens, TypeScript override layer for curated content
- **24-line custom i18n** replacing 40KB+ i18next — compile-time locale resolution from URL structure, build-time key parity enforcement, zero runtime JavaScript overhead
- **Cloudflare Worker booking system** — Google Calendar OAuth2 service account auth, FreeBusy availability queries, 30-minute slot generation with conflict filtering, auto-generated Meet links, IP-based rate limiting (5/hour), input sanitization, 5-minute slot caching
- **6-check pre-deploy audit** — repo hygiene, env vars, secret scanning (GitHub tokens, OpenAI keys), i18n key parity, TypeScript/Astro validation, build artifact verification (13 HTML paths across both languages)
- **requestIdleCallback video preloading** — homepage video contributes zero bytes to initial page weight, upgrades during idle time with Safari-specific fallback path
- **Split-attribute email obfuscation** — `data-u` / `data-d` assembly via client-side JS defeats scraper bots without affecting user experience
- **Organization + WebPage JSON-LD schemas** for rich search results and knowledge graph eligibility
- **WCAG AA accessibility** — semantic HTML, ARIA labels, `prefers-reduced-motion` support, AA contrast ratios, keyboard navigation
- **System-aware dark mode** with manual override, persisted in localStorage, zero-flash initial render via inline script
- **WhatsApp integration** with locale-aware pre-filled messages — Spanish visitors get Spanish greeting, English visitors get English

## Results

### For the Solo Consultant or Freelancer

The fundamental value proposition is time. A solo consultant's most constrained resource isn't money — it's the hours available for billable work versus administrative overhead. Every hour spent updating a website, maintaining bilingual content, configuring booking tools, or manually checking for broken translations is an hour not spent on client work.

This site eliminates the maintenance category entirely:

- **Portfolio updates: 0 hours/month.** Push a `portfolio.md` to any new project repo. The site picks it up automatically within a week. No CMS login, no content editing, no deployment trigger, no screenshot uploads. Twenty-seven projects are currently displayed without a single manual site update after initial setup.
- **Bilingual content management: 0 hours of debugging.** Translation mismatches are caught at build time with specific error messages. No more discovering (or worse, having a prospect discover) that the Spanish version of the services page is missing a section that was added to English three weeks ago.
- **Booking administration: 0 hours/month.** No Calendly account to manage, no subscription to renew, no availability sync to configure. The booking system reads directly from Google Calendar. When you block time on your calendar, the booking widget reflects it immediately. When a prospect books, the event appears on your calendar with a Meet link. The feedback loop is instant and requires zero intervention.
- **Cost savings: ~$200/year.** Eliminating Calendly ($144/year) and operating on free-tier hosting removes recurring costs that compound over time. For a consultancy in its first two years, every dollar saved on infrastructure is a dollar available for marketing or runway.

The deeper benefit is professional credibility. When a prospect visits the site, they see a polished, fast, consistent experience in both languages with a booking flow that matches the design exactly. The site doesn't just describe the quality of work CushLabs delivers — it demonstrates it in real time, in every interaction. For a solo consultant competing against agencies with dedicated design and marketing teams, this is a meaningful differentiator.

### For the Small Business Owner Evaluating a Consultant

Business owners evaluating AI consultants face a trust gap. Every consultancy claims to build quality software. Few provide tangible evidence before the first conversation. A consultant's website is the first artifact a prospective client evaluates — and it forms a lasting impression before any pitch deck or proposal.

What this site signals to a business owner:

- **Attention to detail.** The booking flow doesn't break visually. The Spanish version isn't a half-translated afterthought. The portfolio is current and comprehensive. These aren't features the business owner consciously evaluates — they're absence-of-friction signals that build unconscious trust.
- **Automation mindset.** The portfolio syncs itself. The bilingual parity is enforced mechanically. The pre-deploy checks run automatically. This reflects the same philosophy CushLabs brings to client projects: build systems that maintain themselves rather than requiring ongoing human attention.
- **Bilingual capability is proven, not claimed.** Any consultant can write "fully bilingual" on their website. When the entire site — navigation, content, booking flow, error messages, SEO meta tags — works seamlessly in both languages, the bilingual claim is demonstrated rather than asserted. For a US business serving Hispanic customers, or a Mexican business expanding into the US market, this proof point matters.
- **Security consciousness.** Rate limiting on the booking API, email obfuscation, automated secret scanning — these details signal that the consultant thinks about security proactively, not just when a client asks about it. For a business owner who may not know what to ask about security, these built-in practices provide implicit protection.

### For the IT Manager or Technical Decision Maker

An IT manager evaluating CushLabs as a vendor can treat the site itself as a code sample. The GitHub repository is public, the architecture decisions are documented, and the engineering patterns are visible in production.

What this site demonstrates about engineering quality:

- **Appropriate technology selection.** The site uses Astro (static generation) instead of Next.js or Nuxt (server-side rendering) because 95% of the content is static. The 5% that needs dynamic behavior uses Cloudflare Workers instead of spinning up a server. The i18n system is 24 lines of TypeScript instead of a 40KB library. Every technology choice reflects the question "what's the simplest tool that fully solves this problem?" rather than "what's the most impressive-sounding stack?"
- **Automated quality enforcement.** The pre-deploy audit isn't a README section about best practices — it's a script that blocks deployment when standards aren't met. Secret scanning, translation parity, build artifact verification — these checks run mechanically on every deploy. For an IT manager concerned about code quality in vendor deliverables, this pattern of automated enforcement is more reassuring than any quality assurance promise in a contract.
- **Maintainability over cleverness.** The codebase favors explicit, readable patterns over clever abstractions. Components accept a `locale` prop and call `t(locale)` to get translations. Pages follow a consistent structure. The portfolio data pipeline has clear separation between automated sync and curated overrides. A new developer could understand the codebase in an afternoon. For a client engagement, this means lower knowledge-transfer risk and easier long-term maintenance.
- **Security as infrastructure, not afterthought.** Secret scanning in the build pipeline, rate limiting on API endpoints, input sanitization on form fields, email obfuscation against scrapers — these aren't features added after a security review. They're built into the system architecture from the start. For an IT manager managing vendor risk, this proactive posture reduces the likelihood of security surprises during engagement.
- **Documentation that matches reality.** The CLAUDE.md, README, and docs folder describe the system as it actually works, not as it was originally designed. The bilingual parity rule, the portfolio sync mechanism, the pre-deploy checks — all documented, all verifiable in the running code. Documentation drift is a common problem in vendor codebases; here, the build system enforces alignment.

### For the Developer Evaluating This as a Technical Portfolio Piece

The site contains several engineering patterns that transfer directly to other contexts:

- **GitHub-as-CMS pattern.** Using repository metadata as a structured data source, consumed at build time via CI pipeline, with a curated override layer. This pattern works for any system where the source of truth lives in code repositories: documentation sites, team dashboards, package registries.
- **Build-time i18n with mechanical enforcement.** The 24-line i18n system proves that internationalization doesn't require heavyweight frameworks for small-to-medium scope. The key-diffing pre-deploy check is a pattern applicable to any multi-language application — it eliminates the category of "missing translation" bugs entirely.
- **Serverless escape hatches for static sites.** The Cloudflare Worker booking system demonstrates how to add targeted dynamic behavior to a static site without adopting a full-stack framework. OAuth2 service account authentication, FreeBusy calendar queries, rate limiting, and input sanitization in a single Worker file — a complete reference implementation for the "mostly static, occasionally dynamic" architecture.
- **Pre-deploy audit as quality gate.** Six checks covering different quality dimensions (repo hygiene, environment, secrets, i18n, types, build artifacts) running as a single script before every deploy. This pattern scales to any project where "it builds" isn't sufficient evidence that it's correct.
- **Performance optimization without complexity.** The `requestIdleCallback` video preloading pattern — with a Safari-specific fallback — is a clean example of progressive enhancement: the feature works perfectly without the optimization, and the optimization adds no user-facing complexity.

### For the Marketing Manager

The site addresses several marketing concerns that typically require dedicated tools or manual processes:

- **SEO for bilingual sites is handled architecturally.** Hreflang tags are generated automatically by the BaseLayout for every page pair. The URL structure (`/` for English, `/es/` for Spanish) follows Google's recommended prefix pattern. JSON-LD structured data includes Organization and WebPage schemas. The sitemap covers both language versions with proper alternate links. These aren't configurations to maintain — they're outputs of the build system.
- **Brand consistency is enforced, not hoped for.** Every page uses the same design system: Space Grotesk for headings, Source Serif 4 for body text, `#FF6A3D` for accent. The booking flow, the portfolio cards, the contact form — all rendered with the site's own components, no third-party styling leaking in. Dark mode is system-aware with manual override and zero-flash initial render. The visual experience is controlled end-to-end.
- **Content freshness signals are automated.** The portfolio page updates weekly with real project data. The "Last Updated" signals in the build reflect actual changes. Search engines reward fresh content — the automated portfolio sync means the site produces new, legitimate content without anyone writing it.
- **WhatsApp integration is locale-aware.** Spanish visitors get a pre-filled Spanish greeting message. English visitors get English. The phone number adapts to the visitor's language context. For a consultancy serving the US-Mexico corridor, this small detail — WhatsApp being the default communication tool in Mexico, less common in the US — demonstrates genuine bilingual thinking, not just translated text.

### For the Operations Manager

From an operations perspective, the site is designed to require near-zero ongoing attention:

- **No servers to monitor.** Static HTML on a CDN plus Cloudflare Workers. No uptime monitoring, no scaling configuration, no patching, no OS updates. The infrastructure is someone else's problem (Cloudflare's, Netlify's/Vercel's), and their SLA exceeds what any solo consultant could achieve with self-hosted infrastructure.
- **No content management system to maintain.** No WordPress updates, no plugin vulnerabilities, no database backups, no CMS hosting costs. Content lives in code (translation files, markdown, TypeScript data files) and in GitHub repositories (portfolio metadata). Version control is the CMS.
- **Automated deployment pipeline.** Push to main triggers a build and deploy. Weekly cron triggers portfolio data refresh. Pre-deploy audit catches problems before they reach production. The deployment pipeline is the operations team.
- **Incident surface area is minimal.** Static HTML can't crash. Cloudflare Workers have automatic failover across edge locations. The only external dependency is Google Calendar for the booking system, and if it's unreachable, the booking wizard shows a graceful error rather than breaking the site. There are no databases to corrupt, no sessions to expire, no caches to invalidate (beyond the 5-minute slot cache that expires naturally).
- **Cost is predictable and near-zero.** CDN hosting: free tier. Cloudflare Workers: free tier. GitHub Actions: free tier for public repos. Google Calendar API: free tier. Domain registration: ~$12/year. Total annual operating cost for a globally distributed, edge-cached, serverless-enhanced bilingual website: approximately $12.
