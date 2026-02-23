---
# =============================================================================
# PORTFOLIO.md — CushLabs.ai
# =============================================================================
portfolio_enabled: true
portfolio_priority: 6
portfolio_featured: false
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

Your website is saying things about your business that you never approved.

When your portfolio hasn't been updated in six months, it says "I'm not busy." When your Spanish pages are two versions behind the English ones, it says "Bilingual is just a checkbox on my marketing." When a prospect clicks your booking link and lands on a Calendly page with different fonts and colors, it says "I outsource the details."

CushLabs.ai was built to stop the leaks. It's the production website for CushLabs AI Services — an AI consulting firm operating across the US and Mexico — and every system in it was designed to answer one question: *What if your website maintained itself to the same standard you'd demand from a junior employee?*

The portfolio syncs from your actual project repositories — automatically, weekly, without touching the site. The bilingual engine blocks deployment if a single translation key is missing in either language. The booking system runs on your own infrastructure, matches your brand pixel-for-pixel, and costs nothing per month. The pre-deploy audit scans for leaked secrets, broken pages, and content drift before anything reaches production.

The result is a site that gets more impressive over time without demanding more attention. That's not a feature. That's a competitive advantage.

## The Problems This Solves

### Your Portfolio Is Costing You Deals You'll Never Know About

Here's a scenario that plays out across thousands of small businesses every week: a qualified prospect Googles your company name, lands on your site, clicks "Portfolio" or "Our Work" — and sees three projects from last year. Maybe four. The descriptions are vague. The screenshots look dated. There might even be a "Coming Soon" placeholder that's been there since launch.

The prospect doesn't email you to say "your portfolio looks thin." They just leave. They click the back button and move on to the next result. You never know the deal existed, let alone that you lost it.

The root cause isn't laziness. It's friction. Adding a project to a traditional portfolio requires: writing a description, capturing screenshots, formatting content for the site, deploying the update, and — for a bilingual site — doing all of that twice. That's 45-90 minutes per project, competing against every other task on your list. It never gets prioritized because it doesn't feel urgent. The cost is invisible until you calculate how many prospects saw an outdated portfolio and made a decision based on it.

**What consultants typically try:**
- WordPress portfolio plugins (add CMS maintenance, plugin updates, and security vulnerabilities)
- Notion or Airtable embeds (look out of place, break mobile, create third-party dependency)
- "I'll update it when I have time" (you won't — this has never worked for anyone)
- Hiring a VA or content person ($500-1,500/month for someone to chase you for project details)

**What actually works:** Make the portfolio update itself from the work you're already doing. Your project repositories already contain the metadata — title, tech stack, description, demo URL. A pipeline extracts it weekly and the site renders it automatically. The 28th project is as effortless as the 1st.

### Your "Bilingual" Website Is Silently Costing You Rankings

If you serve customers in two languages, your website needs to work equally well in both. Not "mostly." Not "the important pages." All of it.

Here's what actually happens: You update the English services page on Monday. You tell yourself you'll do the Spanish version tomorrow. Tomorrow becomes next week. Next week becomes never. Three months later, your English site describes five service offerings and your Spanish site describes three. Google's crawler notices the mismatch, flags conflicting hreflang signals, and quietly downgrades both versions in search results.

You don't see a dramatic ranking drop. You see a slow erosion — 5% fewer impressions this month, 8% fewer next month — that you attribute to "algorithm changes" or "increased competition." The real cause is that your site is telling search engines it's bilingual while the content proves otherwise.

For businesses operating in the US-Mexico corridor, this isn't an abstract SEO concern. It directly affects whether your ideal customer — the one searching in Spanish for the exact service you offer — ever sees your site at all.

**The math is unforgiving.** A bilingual site has twice the content surface area, twice the SEO metadata, twice the translation keys, and roughly 2.5x the coordination overhead (because you have to verify parity, not just create content). Manual processes fail at this scale. Not because people are careless, but because coordination overhead grows until something gets missed, and "something" is always the language that gets less daily attention.

**What this site does differently:** The build system diffs every translation key between English and Spanish before deployment. If a key exists in one language but not the other, the deploy is blocked with a specific error naming the missing key. Bilingual parity isn't maintained through discipline — it's enforced mechanically. You literally cannot deploy a version where the two languages have drifted apart.

### Your Booking Widget Is Undermining Your Sales Pitch

You spend weeks perfecting your site's design. Custom fonts. Carefully chosen colors. Consistent spacing. Premium feel throughout. Then a prospect clicks "Book a Call" and lands on... a Calendly embed. Different fonts. Close-but-not-quite colors. An iframe that scrolls weirdly on mobile. A confirmation page with Calendly's logo, not yours.

For most businesses, this is fine. But if your business sells technical expertise, design quality, or attention to detail — if your pitch includes phrases like "seamless integration," "custom solutions," or "pixel-perfect execution" — then a booking flow that visually disconnects from your site contradicts your core message before the prospect even speaks to you.

Every design inconsistency between your site and your embedded booking tool is a micro-friction point. Individually, none of them would lose a deal. Collectively, they shape a prospect's subconscious assessment of your quality bar. By the time they're on the discovery call, they've already formed an impression — and you didn't control what shaped it.

Beyond brand, there's the subscription cost. Calendly Professional is $12/month. Cal.com Team is $12/month. Acuity is $16/month. You're paying $144-192/year for software that does three things: checks if a calendar slot is open, shows available times, and creates an event. That's one API call, one filter, and one write operation.

**What this site does instead:** A custom booking wizard — same 3-step flow (date/time, details, confirmation) — built with the site's own design system. It queries Google Calendar directly for real-time availability. It creates events with auto-generated Meet links. Rate limiting prevents abuse. Input sanitization blocks malicious submissions. The UI is indistinguishable from the rest of the site because it IS the site. Monthly cost: $0.

### Your Site Is Fast or Dynamic — Pick One (Until Now)

If you've ever been told "you need Next.js for that" when all you wanted was a booking form on your marketing site, you know this problem. Static sites are fast, cheap, and globally distributed — but they can't do anything interactive. Full-stack frameworks can do interactive things — but they bring server costs, cold starts, complexity, and hosting bills.

For a site that's 95% marketing content and 5% booking/contact functionality, deploying a full-stack framework is like renting a commercial kitchen because you need to heat up leftovers. It works, but the cost structure doesn't match the requirement.

**This site's approach:** Generate static HTML for everything that doesn't need to be dynamic (which is almost everything). Route the two features that need real-time behavior (booking and contact) through lightweight serverless functions at the network edge. The content pages load in under a second from a global CDN. The booking wizard responds in under 50ms from the nearest Cloudflare edge node. The hosting bill is $0/month.

### Your Site's Security Is Based on "I Think We're Fine"

When was the last time you checked whether your environment variables leaked into a build log? Whether your contact form endpoint has rate limiting? Whether your email addresses are being scraped by bots? Whether an API key was accidentally committed to your repository?

For enterprise companies, there are security teams and automated scanning tools. For small businesses and solo consultants, security is whatever the developer remembered to add — and it degrades over time as new features get added without the same scrutiny.

**This site's approach:** Security is part of the deployment pipeline, not a separate process. Every build scans the codebase for exposed secrets (GitHub tokens, OpenAI keys). The booking API enforces rate limits per IP address. Every form input is sanitized to strip HTML and control characters. Email addresses are split across HTML attributes and assembled only via JavaScript, defeating the scrapers that feed spam lists. None of this requires manual execution. It runs automatically, every time, and blocks deployment when standards aren't met.

## Features and How They Benefit Your Business

### Self-Syncing Portfolio System

**What it does:** A weekly automated pipeline scans your GitHub repositories, extracts project metadata from `portfolio.md` files, and publishes updated portfolio entries to your site. A curated override system lets you layer marketing copy on top of the automated data.

**What it means for you:**
- Add a project to your portfolio by pushing a single file to your project repo. No CMS, no manual site update, no deployment.
- Your portfolio is always current. The 28th project is exactly as effortless as the 1st.
- Curated descriptions layer on top of automated data, so the site stays polished without requiring constant attention.
- Smart diffing means the pipeline only updates when something actually changes — no noise, no unnecessary deploys.
- If the data source is temporarily unavailable, the site builds with the last known good version rather than failing. Your site never goes down because an API hiccupped.

**Business impact:** Your portfolio becomes a living asset that grows with your business instead of a static page that ages out of relevance. Prospects always see your most recent work. The "I need to update the website" task disappears from your to-do list permanently.

### Build-Enforced Bilingual Parity

**What it does:** A lightweight translation system resolves languages at compile time with zero runtime cost. Before every deployment, an automated audit compares every translation key between English and Spanish and blocks the deploy if any key is missing from either language.

**What it means for you:**
- Your Spanish-speaking prospects see exactly the same depth of content as your English-speaking ones. Not "most of it." All of it.
- Search engines get consistent hreflang signals, clean canonical URLs, and matching content across language versions — rewarding both versions with higher rankings.
- You can never accidentally deploy a version where one language is behind the other. The system catches the gap before it reaches production.
- The entire translation system adds zero bytes of JavaScript to the pages your visitors load. Pages are fast in both languages.

**Business impact:** Your bilingual positioning stops being a marketing claim and starts being a verifiable fact. Prospects who switch to Spanish and find complete, polished content develop trust immediately. SEO performance in both languages improves because Google stops penalizing hreflang inconsistencies.

### Custom Branded Booking System

**What it does:** A 3-step booking wizard (select time, enter details, confirm) queries Google Calendar in real time, shows available 30-minute slots, and creates calendar events with auto-generated Google Meet links. Built with your own design system. Rate-limited and input-sanitized.

**What it means for you:**
- Your booking flow looks and feels like part of your site — same fonts, same colors, same spacing, same dark mode behavior. No iframe, no third-party branding.
- Availability is always accurate because it reads directly from your Google Calendar. Block time on your calendar, and those slots disappear from the booking widget instantly.
- Confirmed bookings appear on your calendar with Meet links attached. Both you and the prospect receive calendar invitations. Zero manual coordination.
- Rate limiting (5 bookings per hour per IP) and input sanitization (HTML stripping, length truncation) prevent abuse without affecting legitimate prospects.
- Same-day bookings are excluded if they're less than 3.5 hours away, preventing last-minute surprise meetings.

**Business impact:** Your booking conversion improves because the experience is frictionless and trust-consistent. You save $144-192/year in scheduling tool subscriptions. You eliminate a third-party dependency that could change pricing, features, or terms at any time. The booking flow reinforces your brand rather than diluting it.

### Automated Pre-Deploy Quality Assurance

**What it does:** Before every deployment, six automated checks run in sequence: repository hygiene (required files exist), environment variable validation, secret leak scanning (GitHub tokens, OpenAI keys), bilingual translation parity, TypeScript type validation, and build artifact verification (confirming all 13 expected HTML pages exist in both languages). Any failure blocks deployment.

**What it means for you:**
- Leaked API keys are caught before they reach production — not after a security incident.
- Missing pages or broken builds are caught at deploy time, not by a prospect reporting a 404.
- Translation gaps are flagged with the specific missing key and which language it's missing from.
- Every deploy that reaches production has passed all six quality gates. The site in production is always in a known-good state.

**Business impact:** Your site quality has a floor that never drops. Bad deploys don't reach customers. Security incidents from leaked credentials don't happen. The quality assurance process runs in seconds, on every deploy, without human involvement.

### Performance-Optimized Static Architecture

**What it does:** Every content page is pre-rendered as pure HTML at build time, deployed to a global CDN, and served from the edge node closest to your visitor. The homepage video loads zero bytes initially and preloads during browser idle time.

**What it means for you:**
- Pages load in under one second globally. Sub-second first-paint regardless of whether your visitor is in Dallas, Guadalajara, or Tokyo.
- No server to crash, scale, or pay for. The static files are distributed across hundreds of edge nodes with built-in redundancy.
- Google's Core Web Vitals scores improve because there's no server-side processing delay, no JavaScript framework initialization, and no render-blocking resources.
- The video on your homepage doesn't compete with your content for bandwidth. It loads invisibly in the background after the important content is already rendered.

**Business impact:** Faster sites convert better — this is one of the most well-documented correlations in digital marketing. Google explicitly uses Core Web Vitals as a ranking signal. Your site loads faster than most competitors' sites because there's no server round-trip between the visitor and the content. Your hosting bill is $0/month because static CDN distribution falls within free-tier limits.

### Built-In Security Infrastructure

**What it does:** Email obfuscation splits addresses across HTML attributes (assembled via JavaScript, invisible to scrapers). Secret scanning checks every source file for exposed API keys. Booking endpoints enforce per-IP rate limiting. All form inputs are sanitized to prevent injection.

**What it means for you:**
- Your email addresses stop appearing in spam databases harvested by bots crawling your HTML.
- API keys can't accidentally leak into production — the build catches them before deployment.
- Your booking endpoint can't be abused by bots submitting hundreds of fake bookings.
- Malicious input in form fields gets stripped before it reaches your systems.

**Business impact:** You don't wake up to a spam-flooded inbox, a surprise API bill from leaked keys, or a calendar full of fake bookings. Security isn't a feature you enable — it's an ambient property of how the site works.

## Why Business Owners and Managers Love This Approach

### It Treats Your Website Like a System, Not a Project

Most websites are built once and then maintained reluctantly. Updates happen when someone remembers. Quality depends on who's paying attention that week. Content freshness decays until someone notices and fixes it in a burst of effort — which itself decays over the following months.

This site inverts that model. The portfolio updates itself from the work you're already doing. The bilingual parity is mechanically enforced. The security scanning runs on every deploy. Quality isn't maintained — it's guaranteed by the architecture. The site doesn't need a "website person." It needs nothing, because the system handles what humans forget.

For a business owner, this means the website stops being a to-do item and starts being an asset that compounds. Every new project automatically strengthens the portfolio. Every deploy automatically passes quality checks. The site gets better over time, without requiring more time.

### It Eliminates an Entire Category of Recurring Costs

Traditional approach for a bilingual consulting site with booking:
- Hosting: $20-50/month (Vercel Pro, Netlify Pro, or similar)
- Scheduling tool: $12-16/month (Calendly, Cal.com, Acuity)
- CMS: $0-29/month (WordPress hosting, Contentful, Sanity)
- Translation management: $0-49/month (or manual labor)
- Security monitoring: $0-20/month (or nothing, which is worse)
- **Total: $384-1,968/year** in SaaS subscriptions and hosting

This site's operating cost:
- Hosting: $0/month (CDN free tier)
- Scheduling: $0/month (Cloudflare Worker free tier)
- CMS: $0/month (GitHub is the CMS)
- Translation enforcement: $0/month (build pipeline)
- Security scanning: $0/month (build pipeline)
- Domain registration: ~$12/year
- **Total: ~$12/year**

That's not a marginal savings. That's the elimination of a cost category. For a consultancy in its first two years, reallocating $400-2,000/year from infrastructure to marketing or runway is a meaningful strategic advantage.

### It Proves What You Sell Before You Say a Word

Every business claims to deliver quality. Few demonstrate it before the sales conversation begins.

When a prospect visits this site, they experience the product before they're asked to buy anything. The page loads instantly — that's engineering quality they can feel. The booking flow is seamless and branded — that's attention to detail they can see. The Spanish version is complete and polished — that's bilingual capability they can verify. The portfolio has 27+ current projects — that's track record they can evaluate.

By the time the prospect is on a discovery call, they've already absorbed hours of trust-building signals through a 3-minute site visit. The site didn't claim quality. It exhibited quality. That's a fundamentally different starting position for a sales conversation.

For business owners who've experienced the frustration of being one of many similar-sounding consultants in a competitive evaluation, this approach creates differentiation that prospects can perceive directly. You're not saying "we're different." Your website is showing it.

### It Scales Without Adding Headcount

Adding the 28th portfolio project requires the same effort as adding the 1st: push a file to a repo. Adding the 14th page in Spanish requires the same quality assurance as adding the 1st: the build system checks it automatically. Handling the 100th booking in a month costs the same as the 1st: $0.

For a growing consultancy, this means the website infrastructure doesn't create hiring pressure. You don't need a content person to maintain the portfolio. You don't need a translator to verify parity. You don't need a webmaster to deploy updates. You don't need a sysadmin to keep servers running.

The systems that would normally require 0.25-0.5 FTE of ongoing attention in a traditional setup require zero attention here. That headcount (or fractional headcount) can go toward revenue-generating activities instead.

### It Works for Multiple Business Models

This architecture isn't limited to AI consulting. The same system benefits:

- **Any service business operating bilingually** — law firms, accounting practices, medical offices, real estate agencies serving multilingual markets. The build-enforced parity and locale-aware UX translate directly.
- **Solo consultants and freelancers in any field** — the self-syncing portfolio pattern works for designers, developers, writers, strategists — anyone whose work lives in repositories or structured data sources.
- **Small agencies managing multiple client engagements** — the automated quality gates (secret scanning, build verification, translation parity) prevent the kinds of mistakes that happen at 2am before a deadline.
- **Professional service firms** — law, consulting, finance — where the website is the first credibility evaluation and needs to project precision and attention to detail.
- **Cross-border businesses** — any company operating in both the US and Latin America, where bilingual execution is a competitive requirement, not a nice-to-have.

The underlying principle is universal: **automate what humans forget, enforce what humans skip, and eliminate what humans shouldn't be doing manually.** The specific implementation is bilingual websites with portfolio sync and booking. The pattern applies everywhere.

## Technical Highlights

- **Zero-maintenance portfolio pipeline** — GitHub Actions weekly sync, smart diffs, `[skip ci]` loop prevention, graceful degradation without tokens, TypeScript override layer for curated marketing content
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

| Metric | Before | After |
|--------|--------|-------|
| Portfolio maintenance | 45-90 min per project, per language | 0 min (automated sync) |
| Bilingual content drift | Caught by prospects or Google penalties | Caught at build time, before deploy |
| Scheduling tool cost | $144-192/year (Calendly/Cal.com/Acuity) | $0/year (Cloudflare Worker free tier) |
| Total infrastructure cost | $384-1,968/year | ~$12/year (domain only) |
| Page load time | 1.5-4s (typical full-stack app) | <1s (static CDN, global edge) |
| Security scanning | Manual / never | Automated on every deploy |
| Translation parity verification | Manual spot-check | Mechanical enforcement, 100% coverage |
| Portfolio projects displayed | 3-5 (manual maintenance ceiling) | 27+ (automated, growing) |
| Headcount for website ops | 0.25-0.5 FTE equivalent | 0 FTE |

### The Bottom Line

This site costs $12/year to operate, maintains itself without human intervention, enforces bilingual quality mechanically, converts prospects through brand-consistent booking, and grows its portfolio automatically from the work you're already doing.

It's not a website. It's a business system that happens to have a URL.
