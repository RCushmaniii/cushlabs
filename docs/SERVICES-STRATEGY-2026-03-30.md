# Services Strategy Review — 2026-03-30

## Context

Full review of CushLabs service offerings to align the website services page with what Robert can actually deliver confidently, what the market wants, and what doesn't require educating the buyer before selling.

---

## Decisions Made

### Core Services (4 — on services page)

| # | Service | Price | Timeline | Status |
|---|---------|-------|----------|--------|
| 1 | **AI Assistants & Chatbots** | $3,500–$8,500 | 2–4 weeks | Flagship, unchanged |
| 2 | **Local Competitive Intelligence** | $299–$1,500/mo | Ongoing | **NEW** — replaces Document & Knowledge Systems |
| 3 | **Custom AI Tools & Automation** | $5,000–$15,000+ | 4–8 weeks | Unchanged |
| 4 | **AI Clarity Sprint** | $1,500 flat | 5–10 days | Entry point, unchanged |

### Dropped from Core Services

- **Document & Knowledge Systems** — Robert hasn't built one. The capability lives as a feature inside AI Assistants (the chatbot's knowledge base IS a document system). Removed as standalone to avoid selling something undelivered.

### Featured Capabilities (own landing pages, NOT on main services page)

- **Scrollytelling Pitch Decks** — Config-driven cinematic bilingual pitch decks (cushlabs-scrollytelling repo). Niche but premium. Gets its own landing page targeting startups/investors. Not a core service because the addressable market is narrow.
- **AI Brand Voice / Context Writing System** — Context-engineering framework for consistent AI-generated content (context-writing-system repo). Marketable but targets a different buyer persona (marketing directors vs. ops leaders). Gets its own landing page to avoid diluting the main services message.

### Portfolio Showcase (NOT a service)

- **CushLabs OS Dashboard** — Best case study for the Custom AI Tools service. Demonstrates complex full-stack internal tool delivery (Next.js 15, 7 views, 7 API routes, GitHub aggregation). Used as proof of capability, not sold directly.

---

## Service #2: Local Competitive Intelligence — Detail

### What It Is
Google Maps competitive monitoring with weekly WhatsApp intelligence reports. Based on the Azucar swimwear retail proof of concept.

### Pricing Strategy

**Original pricing:** $750–$1,500/month — too high for Mexican SMB market.

**Revised pricing:** $299–$1,500/month.

**Rationale:**
- Mexican SMBs spend $3,000–10,000 MXN/month ($150–$500 USD) on ALL digital marketing combined
- $750 USD/month = ~$15,000 MXN — equivalent to a full-time junior employee salary
- Even dental clinics (highest-value target) typically spend $8,000–20,000 MXN on marketing
- $299/month ($5,999 MXN) sits under the psychological $6K barrier
- Comparable SaaS tools (BrightLocal, LocalFalcon) cost $30–100/month for self-serve, so $299 for a managed service with human analysis and WhatsApp delivery is competitive
- Multi-location / US-based clients go up to $499–$1,500/month

**Revenue projections at $299/month:**
- 10 clients = $2,990/month
- 15 clients = $4,485/month
- 20 clients = $5,980/month
- Tool costs ~$40–50/client, so margin on 15 clients = ~$3,735–$3,885/month

### Target Verticals (in priority order)
1. Dental clinics / cosmetic dentistry — highest ROI, understand Google
2. Aesthetic / plastic surgery clinics — medical tourism hubs
3. Auto dealerships / premium repair — high ticket, reputation-driven
4. Real estate agencies — especially Lake Chapala/Ajijic expat market
5. Boutique hotels / Airbnb property managers — reviews = bookings
6. High-end restaurants (not casual) — Providencia, Americana zones
7. Gyms / CrossFit boxes — competitive, membership-driven

### What's Included
- Competitor mapping & baseline (5–10 competitors)
- Google Maps position tracking (weekly snapshots)
- Review velocity monitoring
- Weekly WhatsApp intelligence report (Monday delivery)
- Threat alerts & early warnings
- One clear action item per week
- Monthly performance dashboard

### Not Included
- SEO / Google Ads / paid advertising management
- Review generation or response writing
- Social media management or content creation

---

## Files Changed

### Services page components updated:
- `src/components/services2/ServiceBlock.astro` — Replaced `knowledge-systems` data with `competitive-intelligence` (full EN/ES)
- `src/components/services2/ScenarioQualifier.astro` — New scenario: "My competitors keep showing up above me on Google" with eye icon
- `src/components/services2/InvestmentOverview.astro` — New pricing row: $299–$1,500/mo ongoing
- `src/components/services2/FAQ.astro` — Added FAQ explaining recurring vs. project-based service model
- `src/components/services2/WhoItIsFor.astro` — Added local businesses competing for Google Maps visibility
- `src/pages/services.astro` — Updated block ID and meta descriptions

### CLAUDE.md packaged services
The 5 "packaged services" listed in CLAUDE.md (Onboarding Bot, Voice Agent, Knowledge Base, Sales Enablement, Doc Q&A) should be updated to reflect the actual 4 core services. **TODO** — not done in this session.

---

## Future Landing Pages Needed

1. `/scrollytelling` or `/pitch-decks` — Scrollytelling capability showcase
2. `/brand-voice` or `/content-systems` — Context Writing System showcase
3. These are NOT on the main services page navigation — they're standalone landing pages for specific audiences

---

## Key Principle

> The services page should only list things Robert can confidently deliver. Four services keeps the page clean and focused. Don't re-add Document & Knowledge Systems. The Competitive Intelligence service is the biggest differentiator — nobody else in this market is pitching weekly Google Maps intelligence reports delivered via WhatsApp.
