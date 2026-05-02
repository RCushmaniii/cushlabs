# voice.cushlabs.ai — Site Audit & Rebuild Briefing

> This document is a briefing for an AI assistant working on the voice.cushlabs.ai repo.
> Written by Robert Cushman with context from the cushlabs.ai pricing overhaul completed 2026-04-13.
> Read this entire document before touching any code.

---

## Who This Site Is For

**voice.cushlabs.ai** is a product showcase site for CushLabs AI Voice Agents — the premium $1,497/mo (US) / $10,997 MXN/mes (MX) standalone product. It is NOT a general CushLabs company site. The main company site is cushlabs.ai.

**Robert Cushman** is the sole operator. He lives in Mexico, serves US and Mexico/LATAM markets, and does bilingual (EN/ES) delivery. He builds AI-powered voice agents for small-to-medium businesses.

---

## Current State of the Site (audited 2026-04-13)

### What exists and is working well
- **Homepage** — Strong hero: "Stop Losing Leads to Voicemail." Good pain-first framing. Describes 4 capabilities (Lead Qualification, Appointment Booking, Customer Support, AI Front Desk). Has a "How It Works" 4-step process.
- **Live Demo pages** — 5 demo agents: Clara (lead qual), James (exec coaching scheduler), Sophia (med spa front desk), Mike (home services dispatcher), David (real estate setter). These are the strongest asset on the site — they let prospects actually talk to the AI.
- **Portfolio page** — Exists (not yet audited in detail)
- **Contact page** — Exists
- **Consultation booking** — Exists (`/consultation`)
- **Bilingual toggle** — ES button exists in nav

### What is MISSING
1. **No Services/Pricing page** — The biggest gap. A prospect who wants to know what it costs and what they get has nowhere to go. They either leave or have to book a call just to find out the price. This is the #1 thing to build.
2. **No FAQ page** — Common objections (does it sound robotic? what if I go over minutes? do I need a developer?) are unanswered.
3. **"New York, NY" in the footer** — WRONG. Robert is based in Mexico and serves US + Mexico. This needs to be removed or changed to "Serving US & Mexico."

### Messaging issues to fix
- Footer says `"Built by Robert Cushman — powered by AI and voice."` — fine, keep it.
- The `/nyc-coaching` demo page says **"NEW YORK ENGLISH"** as a brand — this is a different client brand (possibly the ny-english-teacher client). Make sure this isn't creating confusion about CushLabs' location/identity.
- Homepage process step says **"Clara lives inside your CRM and Calendar"** — this hardcodes the demo agent name into generic copy. Should say "Your agent lives inside your CRM..." since every client gets a custom agent, not Clara.
- No pricing anywhere on the site. A prospect landing here has no idea what this costs. This creates friction and may filter out exactly the qualified buyers you want (who are ready to pay but need a number to evaluate).

---

## The Services/Pricing Page to Build

### URL
`/services` (and `/es/services` for Spanish)

### What it should communicate

This page should answer: **"What do I get, what does it cost, and how does this work?"**

#### Price
- **US:** $1,497/mo
- **Mexico/LATAM:** $10,997 MXN/mes
- 500 minutes included per month
- Overage: $0.50/min (US) / $8.50 MXN/min (MX)
- Free 2-week trial
- No setup fee. No long-term contract. Cancel anytime.

#### What's included (feature list)
- Natural-sounding AI voice matched to your brand
- Answers every call on the first ring, 24/7
- 500 minutes/mo included
- Appointment booking directly into your calendar (Google Calendar, Calendly, etc.)
- Lead capture — name, number, intent texted to you instantly
- Call transfer with context when a human is needed
- Bilingual EN/ES (automatic language detection)
- Monthly call reports and ongoing optimization
- Custom voice, persona, and script tuned for your business
- No IT team needed — fully managed setup and maintenance

#### Pain-first framing (use this, don't lead with features)
Lead with the cost of inaction. The buyer's real problem is missed calls = missed revenue. Frame it like this:

- You miss 3–5 calls a day while you're with clients, driving, or at lunch.
- Each one could be a $500–$1,500 customer.
- That's $7,500–$37,500/month walking away to a competitor who picked up.
- A full-time receptionist costs $3,000–$4,500/mo and works 8 hours.
- Your AI voice agent works 24/7 for $1,497/mo and never calls in sick.

#### Who it's for (use these as "scenario cards" or bullet points)
- **Home services companies** (plumbing, HVAC, roofing) — every missed call is a $1,200 job
- **Med spas and clinics** — front desk that never puts callers on hold
- **Real estate teams** — outbound follow-up and inbound lead qualification
- **Law firms and professional services** — intake without a receptionist
- **Any business that misses calls** — if your phone rings and nobody picks up, this is for you

#### How it works (keep it to 3–4 steps)
1. **Discovery call (free)** — We learn your call flow, customer questions, and business rules
2. **We build your agent** — Custom voice, persona, and scripts in days, not months
3. **Connect your systems** — Calendar, CRM, text notifications
4. **Go live + monthly optimization** — Launch, then we tune it based on real call data

#### CTA
Primary: "Start Free Trial" → `/consultation`
Secondary: "Talk to Clara first" → demo embed or `/` anchor

#### ROI block
Include this comparison:

| | Full-time receptionist | AI Voice Agent |
|---|---|---|
| Cost | $3,000–$4,500/mo | $1,497/mo |
| Hours | 8/day, 5 days/week | 24/7, 365 days/year |
| Sick days | Yes | Never |
| Bilingual | Rarely | Always |
| Appointment booking | Manual | Automatic |

---

## FAQ Page to Build

Common objections to address:

**Does it sound like a robot?**
No. Modern AI voices are natural and conversational. You can hear it yourself — talk to Clara on the homepage.

**What if a caller gets frustrated and wants a human?**
The agent detects frustration and transfers the call to you or a team member, with full context of the conversation so far.

**What if I go over 500 minutes?**
Overage is billed at $0.50/min (US) / $8.50 MXN/min (MX). Most clients use 200–400 minutes per month. You'll be alerted before you hit the cap.

**How long does setup take?**
Most agents are live within 3–5 business days after the discovery call.

**Do I need a developer or IT team?**
No. CushLabs handles everything — setup, integration, maintenance, and monthly optimization.

**How does the free 2-week trial work?**
The agent is built and deployed during the trial — you see it working with real callers before you pay. If you're not happy, walk away. No invoice.

**Can it speak Spanish?**
Yes. Every agent is bilingual EN/ES with automatic language detection.

**What systems does it connect to?**
Google Calendar, Calendly, most CRMs via webhook/Zapier/Make. Ask about your specific stack on the discovery call.

**Do you sign NDAs?**
Yes. Happy to sign a mutual NDA before any sensitive business information is shared.

---

## Cross-Site Consistency Checklist

Before shipping the services page, verify these match cushlabs.ai exactly:

| Element | cushlabs.ai | voice.cushlabs.ai |
|---|---|---|
| US Voice Agent price | $1,497/mo | Must match |
| MX Voice Agent price | $10,997 MXN/mes | Must match |
| Minutes included | 500 | Must match |
| Overage rate | $0.50/min US / $8.50 MXN | Must match |
| Free trial length | 2 weeks | Must match |
| CTA text | "Start Free Trial" | Should match |
| Consultation URL | /consultation/ | Already matches |
| Location | "Serving US & Mexico" | Fix footer — remove "New York, NY" |
| Free trial messaging | "No setup fee. No contract. Cancel anytime." | Add this |

---

## Navigation Changes Needed

Current nav: DEMOS → Portfolio → Contact → Book a Free Call

Recommended nav after adding services page:
`DEMOS | SERVICES | PORTFOLIO | CONTACT | [Start Free Trial CTA button]`

Add "SERVICES" as a primary nav link. This is the most important missing piece — a prospect who sees "Services" in the nav knows there's a page that tells them what they'll pay.

---

## What NOT to change

- The live demo pages (James, Sophia, Mike, David) — these are the strongest sales tool on the site. Don't touch the functionality.
- The homepage hero copy — "Stop Losing Leads to Voicemail" is strong.
- Clara demo embed on homepage — good.
- The "How It Works" 4-step section — solid.

---

## Tone and Voice Guidelines

Match the tone of cushlabs.ai:
- **Direct, not corporate.** Write like a smart person talking to a business owner, not like a SaaS marketing team.
- **Pain-first, not feature-first.** Lead with what it costs them NOT to have this.
- **Confident without bragging.** Let the live demos do the selling — your job is to get them to try one.
- **No jargon.** "AI voice agent" is fine. "Large language model orchestration" is not.
- **Bilingual matters.** When you build the Spanish version, translate for the Mexican market — not Google Translate word-for-word. The MXN pricing is different from USD pricing. Never auto-convert. $10,997 MXN is the correct Mexico price. Do not calculate it as a currency conversion.

---

## Files Likely Needing Updates (confirm against actual repo structure)

- `src/pages/services.astro` — CREATE THIS
- `src/pages/es/services.astro` — CREATE THIS (Spanish version)
- `src/components/` — New pricing card component, FAQ accordion
- `src/layouts/` or navigation component — Add "Services" link to nav
- Footer component — Remove "New York, NY", update to "Serving US & Mexico"
- Homepage (if needed) — Fix "Clara lives inside your CRM" → "Your agent lives inside your CRM"

---

*Briefing written 2026-04-13 based on cushlabs.ai pricing overhaul (PR #66) and live site audit of voice.cushlabs.ai.*
