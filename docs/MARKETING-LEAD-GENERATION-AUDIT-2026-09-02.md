# Marketing and Lead-Generation Audit

**Project:** CushLabs.ai  
**Date:** September 2, 2026  
**Scope:** Marketing, positioning, conversion, lead capture, client generation, and growth architecture. This was not a build-quality review.

## Verdict

CushLabs already has the bones of a credible sales site: clear outcomes, real demos, transparent pricing, bilingual delivery, direct booking, and unusually strong risk reversal.

Its main weakness is not persuasion—it is funnel discipline. The site creates several opportunities to convert, but it does not reliably record which message, service, demo, plan, industry, or acquisition channel produced the lead. As a result, CushLabs can generate clients, but it cannot yet systematically learn how to generate more of them.

## What Is Working

- The homepage explains the customer problem in business language: unanswered questions, lost leads, interrupted work, and missed appointments—not abstract AI capabilities. The hero also gives visitors both a low-commitment demo and a direct booking option (`src/components/home2/Hero.astro:28`, `src/components/home2/Hero.astro:60`).

- “Try it before you believe it” is the right strategy for this market. The live assistant is a stronger credibility device than another page of claims.

- Pricing is public, concrete, bilingual, and low-risk: three plans, no setup fee, no contract, and a one-week trial (`src/components/pricing/PricingSection.astro:40`). This eliminates a major source of sales friction.

- The guarantee directly answers the objections small-business buyers actually have: cost, lock-in, implementation risk, and ownership (`src/components/home2/Guarantee.astro:13`).

- The salon landing pages are much more commercially focused than the general site. They name a specific buyer, a recognizable situation, a single product, an ROI argument, and a single next step. That is the shape to replicate.

- Technical discoverability foundations are strong: canonical URLs, hreflang, structured data, sitemap handling, article metadata, and bilingual content are all present. The production homepage also matches the current positioning.

## Material Findings

### P0 Credibility: Salon Outreach Advertises a Capability That Is Not Currently Offered

The outreach playbook says the assistant answers Instagram and Facebook messages, including in the default opener and objection handling (`docs/outreach/salones-outreach-es.md:21`). The same document says Meta approval remains a go-live requirement (`docs/outreach/salones-outreach-es.md:70`).

Meanwhile, the landing page correctly says Facebook works today and Instagram is coming later (`src/pages/salones.astro:91`). The authoritative commitments also prohibit advertising Instagram as currently available (`docs/strategy/ADVERTISED-COMMITMENTS.md:146`).

Fix this before using that outreach copy again. A prospect who replies specifically about Instagram will discover the mismatch immediately.

### P1 Growth: Traffic Analytics Exist, but Revenue-Funnel Measurement Does Not

Ahrefs and Vercel Analytics are installed (`src/layouts/BaseLayout.astro:249`), but the project does not define conversion events for:

- Demo opened
- Demo conversation completed
- Pricing plan selected
- Booking started
- Booking completed
- Contact form submitted
- WhatsApp CTA clicked
- Lead source, campaign, landing page, service, or language
- Trial started or converted to paid

The salon strategy explicitly says to track “DMs → replies → visits → diagnoses → trials → paid,” but the implementation only measures page visits (`docs/outreach/salones-outreach-es.md:81`).

This is the highest-leverage growth improvement after correcting the false claim.

### P1 Conversion: Every Pricing CTA Discards Buying Intent

All three plan buttons say “Get started” and lead to the same generic consultation page. The comparison table does the same (`src/components/pricing/PricingComparison.astro:95`).

A visitor who clicks Premium should arrive with Premium already recorded. Carry `plan=premium`, service, locale, landing page, and campaign through the booking flow. Displaying “You’re asking about Premium” would also reassure the visitor that the next page remembers their decision.

### P1 Positioning: The Main Site Is Broader Than the Go-to-Market Strategy

The homepage sells messaging assistants, voice, WhatsApp follow-up, competitive intelligence, workflow automation, and sometimes custom development to “small businesses in the US and Mexico.” That is credible—but broad.

The salon pages are far more persuasive because they describe one buyer and one loss: missed appointments caused by unanswered messages. Unfortunately, those landing pages default to `noindex` and are excluded from the sitemap (`src/layouts/LandingLayout.astro:6`). That is reasonable for campaign pages, but it means the strongest positioning does not compound organically.

Keep the outbound versions private, but create indexable, evidence-rich industry pages for the verticals CushLabs genuinely intends to pursue.

### P1 Trust: Most Proof Demonstrates Capability, Not Client Outcomes

The homepage has one named LinkedIn recommendation, but it is from another AI professional. The quantified case study is Robert's own business (`src/components/home2/SocialProof.astro:24`, `src/components/home2/SocialProof.astro:27`).

That establishes competence, but a salon, clinic, or local-service owner needs evidence from someone like them. The next proof asset should show:

- Before: message volume, response time, and missed inquiries
- What was installed
- After: conversations answered, qualified leads, bookings, and hours saved
- A customer quote and recognizable business identity, with permission

One genuine vertical case study will likely outperform adding ten more portfolio projects.

### P2 Conversion: The Experience Contains Too Many Competing Paths

The homepage has a demo, booking, industry demos, services, portfolio, contact, floating chat, pricing, and repeated calls to action. The header, however, has no visually dominant conversion button—only seven navigation links ending in Contact (`src/components/Header.astro:31`).

Make “Book a Free Call” or “Get a Free Assessment” persistent in the header. Treat the demo as the primary low-commitment action and booking as the primary commercial action. Everything else should support those two paths.

The pricing page is also extremely long: concise plan cards are followed by a complete matrix and sixteen FAQs. Preserve the detail, but collapse it behind “Compare every feature” or another buyer-controlled disclosure.

### P2 Lead Operations: Leads Land in Separate Destinations With Little Context

The contact form sends name, email, phone, and an open-ended message to Formspree (`src/pages/contact.astro:373`). Booking captures name, email, optional phone, and notes, then creates a calendar event (`src/components/booking/BookingFormSteps.astro:109`).

That is appropriately low-friction, but neither creates a common marketing record. A heavyweight CRM is unnecessary at the current volume. A lightweight lead ledger is sufficient:

```text
created_at · source · campaign · page · locale · service · plan · status · next_action · outcome
```

### P2 Maintenance: A Legacy Demo Worker Still Contains Retired Pricing

The active site loads the Converso embed (`src/layouts/BaseLayout.astro:293`), but the older deployable demo worker still says projects start at $3,500 USD (`workers/demo-chat.js:62`). It does not appear to drive the current homepage, but it can reintroduce the recently fixed pricing contradiction if redeployed or linked directly.

## Recommended Order of Work

### 1. Correct the Instagram outreach claims immediately

**Why:** Prevents a credibility failure at the first point of contact.  
**Effort:** Under one hour.  
**Confidence:** 99%.

### 2. Instrument the complete funnel

Preserve attribution through booking, forms, WhatsApp, demos, and plan selection.

**Why:** Makes every future marketing decision evidence-based.  
**Effort:** 1–3 days.  
**Confidence:** 95%.

### 3. Turn the salon wedge into a measurable campaign system

Give each outreach batch a campaign URL, record replies and outcomes, and use one dashboard or lead ledger.

**Why:** Converts a promising landing page into a repeatable acquisition channel.  
**Effort:** 1–2 days.  
**Confidence:** 90%.

### 4. Produce one real customer-results case study

This depends on access to baseline and post-launch data.

**Why:** Target-market evidence will reduce perceived risk more effectively than additional portfolio volume.  
**Effort:** 2–5 days plus observation time.  
**Confidence:** 85%.

### 5. Improve conversion continuity

Add a persistent header CTA, preserve the selected service or plan on the consultation page, and simplify the pricing comparison.

**Why:** Reduces decision loss between interest and booking.  
**Effort:** 1–2 days.  
**Confidence:** 90%.

### 6. Build a capture path for visitors who are not ready to book

A “missed-message audit” or “after-hours lead-loss assessment” fits the offer better than a generic newsletter. Capture email or WhatsApp permission and follow up with a useful result.

**Why:** Gives early-stage visitors a valuable next step instead of losing them.  
**Effort:** 3–5 days.  
**Confidence:** 80%.

## What Not to Do Yet

Do not add more generic service pages, portfolio projects, broad blog categories, or a sophisticated CRM. The site already has enough surface area. The next constraint is learning which existing surface produces qualified conversations and paid trials.

## Verification Performed

The review covered:

- Repository structure and routes
- Homepage positioning and conversion components
- Pricing and plan-comparison experience
- Contact and booking flows
- Industry landing pages and outreach material
- Analytics hooks
- SEO and bilingual infrastructure
- Current strategy and advertised-commitment documents
- Recent commit history
- Rendered desktop and mobile pages
- Production search-footprint spot checks
- Files-only secret scan
- Rate-limiting controls around paid demo and booking endpoints

No tracked secrets were found in the files-only scan. The paid demo and booking endpoints contain rate-limiting controls.

Build, lint, typecheck, and test execution were intentionally skipped because this was a marketing and client-generation review, not a build-quality audit.

## Strategic Summary

The site does not need more breadth right now. It needs a closed learning loop:

```text
Audience → Message → Landing page → Demonstrated value → Captured intent
         → Qualified conversation → Trial → Paid client → Measured outcome
         → Case study → Stronger acquisition
```

CushLabs already has most of the visible pieces. The next phase is connecting them so every lead teaches the business how to earn the next one.
