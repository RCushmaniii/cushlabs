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

CushLabs.ai is the production website for CushLabs AI Services — an AI integration and software development consultancy serving small and mid-sized businesses in the US and Mexico. Built as a static Astro site with serverless escape hatches, it solves three problems that plague solo consultants: portfolio staleness, bilingual content drift, and dependency on third-party scheduling services.

The core architecture treats the GitHub account as the source of truth for project data. A weekly GitHub Actions pipeline fetches `portfolio.md` metadata from every repository, outputs structured JSON, and the site consumes it at build time. Rich marketing content layers on top via a TypeScript override system, keeping automated data and curated copy cleanly separated. The booking flow is a custom Cloudflare Worker that replaces Calendly entirely — same UX, matching design system, zero monthly cost.

The i18n system is deliberately minimal: three functions totaling 24 lines, with a pre-deploy audit that diffs every nested key between English and Spanish translation files and fails the build on any mismatch. Bilingual parity isn't a guideline — it's a gate.

## The Challenge

- **Portfolio maintenance doesn't scale.** Every new project means editing the site, re-deploying, and hoping the descriptions stay current. Multiply by two languages and most consultants abandon their portfolio after a handful of entries. The maintenance cost quietly kills the section that's supposed to demonstrate capability.

- **Bilingual sites drift apart.** English gets updated, Spanish gets forgotten, and search engines penalize the inconsistency with hreflang errors. Most agencies solve this with CMS translation workflows. For a solo consultant, that's overhead that doesn't ship.

- **Booking widgets undermine premium positioning.** Calendly works, but embedding an iframe with mismatched fonts, colors, and spacing inside a carefully designed site sends the wrong message about attention to detail. And it's another $8-16/month subscription for something that's essentially a calendar query and a form.

- **Static sites hit a wall at dynamic features.** Forms, booking flows, and API integrations typically require a server. Going full-stack adds hosting costs, cold start latency, and infrastructure maintenance — all for a site that's 95% static content.

## The Solution

**Self-maintaining portfolio via GitHub sync:**
A weekly GitHub Actions pipeline scans every repository, extracts `portfolio.md` metadata, and outputs structured JSON consumed at build time. Smart diffing only commits when data changes, `[skip ci]` prevents deployment loops, and graceful degradation uses last-known-good data when the GitHub token is unavailable. Adding a project to the portfolio means pushing a file to any repo — the site handles the rest.

**Custom serverless booking wizard:**
A Cloudflare Worker authenticates to Google Calendar via OAuth2, queries FreeBusy availability, generates 30-minute slots (filtering conflicts and same-day bookings under 3.5 hours away), and creates calendar events with auto-generated Google Meet links. Rate limiting (5/hour/IP), input sanitization (HTML stripping, 200-char truncation), and 5-minute slot caching are built in. The UI matches the site's design system exactly.

**Build-time bilingual enforcement:**
A 24-line TypeScript i18n system handles locale resolution at compile time with zero runtime cost. The pre-deploy audit dynamically imports both translation files and diffs every nested key — if any key exists in one language but not the other, the build fails. Six total checks run before every deploy: repo hygiene, env vars, secret leak scanning, i18n parity, TypeScript validation, and build artifact verification across 13 expected HTML paths.

**Static core with serverless edges:**
Astro generates pure HTML for the content-heavy pages, edge-cached globally for sub-second loads. The booking wizard and contact form route through Cloudflare Workers — no server, no cold starts, no infrastructure cost beyond free tier.

## Technical Highlights

- **Zero-maintenance portfolio pipeline** — GitHub Actions weekly sync, smart diffs, `[skip ci]` loop prevention, graceful degradation without tokens
- **24-line custom i18n** replacing i18next — compile-time locale resolution, build-time parity enforcement, zero runtime JavaScript
- **Cloudflare Worker booking system** — Google Calendar OAuth2, FreeBusy queries, Meet link generation, IP rate limiting, input sanitization
- **requestIdleCallback video preloading** — homepage video contributes zero bytes to initial page weight, upgrades during idle time with Safari-specific fallback
- **Split-attribute email obfuscation** — `data-u` / `data-d` assembly via client-side JS defeats scraper bots
- **6-check pre-deploy audit** — repo hygiene, env vars, secret scanning (GitHub tokens, OpenAI keys), i18n parity, TypeScript, build artifacts
- **Organization + WebPage JSON-LD schemas** for rich search results
- **WCAG AA accessibility** — semantic HTML, ARIA labels, `prefers-reduced-motion`, contrast ratios

## Results

**For the Business Owner:**
- Portfolio updates require zero site maintenance — push a `portfolio.md` to any repo and it appears on the site within a week
- Bilingual content never drifts — build-time enforcement catches missing translations before they reach production
- Booking flow matches the brand exactly, replacing a $96-192/year Calendly subscription with a free Cloudflare Worker
- Sub-second page loads globally via static HTML edge caching
- Zero hosting cost for the static site (Netlify/Vercel free tier)

**For the Developer Evaluating This Work:**
- Production-quality static site architecture with clean serverless integration at the dynamic edges
- i18n system that solves the "two languages, one truth" problem without heavyweight dependencies
- GitHub Actions pipeline demonstrating CI/CD patterns: smart diffing, loop prevention, graceful degradation
- Pre-deploy audit pattern transferable to any project requiring multi-dimensional build validation
- Cloudflare Worker demonstrating OAuth2 service integration, rate limiting, and input sanitization in a serverless context

**For the IT Manager Considering CushLabs as a Vendor:**
- The site itself is a working demonstration of the engineering quality CushLabs delivers to clients
- Every system is automated — portfolio sync, bilingual enforcement, pre-deploy validation — reflecting a bias toward eliminating manual processes
- Security practices (secret scanning, email obfuscation, rate limiting, input sanitization) are built in, not bolted on
- The approach prioritizes long-term maintainability over impressive-looking complexity
