# AI Assistant Onboarding — READ THIS FIRST

> **You are an AI assistant working with Robert on CushLabs. Before you touch anything
> client-facing — a proposal, a demo page, pricing, sales copy, the messenger service,
> a prospect deliverable — read this whole file.** It exists because assistants (repeatedly)
> invented services CushLabs does not offer and priced things that don't exist. Ten minutes
> here saves Robert hours of rework and protects the business's credibility with real clients.

**Last updated:** 2026-10-09 (Instagram and WhatsApp automation live on Premium/Ultra since 2026-09-18/19; Robert's 2026-10-08 WhatsApp decision)

---

## 0. Why this file exists (the mistakes to never repeat)

Real errors a prior assistant shipped by NOT reading the docs below:

- Built an entire client proposal **and** website around an **"AI assistant on WhatsApp"** — an AI answering the client's customers on WhatsApp, which CushLabs does **not** offer. (CushLabs does WhatsApp **automation** — owner alerts, reminders, promotions — see §2/§4.)
- Listed **"we build & run your Facebook page"** as an included service — CushLabs deploys AI onto a client's _existing_ page; it does not run/manage the page for them ongoing. (Building a website, by contrast, _is_ something Robert does — see §3 — just not a default tier inclusion.)
- Asked Robert questions (what do we charge? is Google reviews included? what's the offer?) whose answers are **written down, verbatim, in this repo.**

**The rule:** if it's about what we sell, price, or promise — the answer is in the canonical docs (§5), not your imagination and not Robert's inbox. Read them.

---

## 1. What CushLabs sells — one product, three tiers

**One managed monthly subscription per business.** No à-la-carte menu, no setup fee. You pick a tier; CushLabs builds, trains, deploys, and maintains everything. Every plan includes **up to 2 locations**, **unlimited conversations (fair use)**, a **1-week free trial**, and **no contract**.

| Tier                              | MXN/mo     | USD/mo   | What it adds                                                                                             |
| --------------------------------- | ---------- | -------- | -------------------------------------------------------------------------------------------------------- |
| **Basic** — getting started       | **$1,990** | **$129** | AI Messenger Assistant · Google review management · owner lead alerts · fully managed                    |
| **Premium** ⭐ most popular       | **$3,490** | **$229** | Everything in Basic **+** Instagram (comments + DMs) **+** website chatbot **+** WhatsApp reminders/confirmations and promotions from the client's own number **+** weekly local SEO & competitor report |
| **Ultra** — clinics / high-volume | **$5,490** | **$349** | Everything in Premium **+** AI Voice Agent (300 min/loc/mo) **+** priority support **+** industry tuning |

- **Extra location:** +$690 MXN / +$49 USD per month each (flat, any tier).
- **Voice overage (Ultra):** $8.50 MXN / $0.59 USD per minute past 300 min/loc/mo.
- **Currency follows the MARKET, not the language:** MXN for Mexico + Central/South America; USD for US + Canada. USD figures are **independently anchored marketing numbers — never a live FX conversion.** Do not auto-convert.

**"What do we charge 1,990 pesos for?" (Basic, verbatim):** AI Messenger Assistant on Facebook (24/7, bilingual, full feature set) + Google review management (owner-approved) + owner lead alerts + fully managed (setup, training, support). Per business, up to 2 locations, no setup fee, no contract, 1-week free trial, unlimited conversations (fair use). Clients invoiced in Mexico get a CFDI (prices plus IVA); clients outside Mexico get an itemized commercial invoice and can pay by PayPal or bank transfer.

> These figures restate `operating-system/cushlabs/commercial-terms.json` and `src/components/pricing/PricingSection.astro`. If this file ever disagrees with them, **they win** — fix this file, don't quote it.

---

## 2. What we DO offer (core services — the atoms inside the tiers)

- **AI Messenger Assistant** — a 24/7, bilingual (EN/es-MX) AI on the client's **Facebook page** (Messenger DMs + replies to comments on posts). Answers from their real products, prices, hours, policies, and tone, using only the information the client approved; when it isn't sure, it hands the customer to the owner. _(Basic+)_
- **Google review management** — drafts/manages responses to Google reviews, **owner-approved** before posting. _(Basic+)_
- **Owner lead alerts** — captures the lead (name/contact/intent, consent-gated) and **pings the owner on WhatsApp** the moment a lead is hot. **This is LIVE (since 2026-07-09).** _(Basic+)_
- **Fully managed** — CushLabs does setup, training, connection, testing, monitoring, weekly reports, monthly tuning. The client never touches a dashboard. _(All tiers)_
- **Instagram** — the same assistant answers comments on the client's Instagram posts in public, then follows up in DMs. _(Premium+)_
- **WhatsApp automation** — appointment reminders, confirmations, order updates and promotions sent from the client's **own** WhatsApp number to customers who opted in. Meta bills the client directly for delivery; no message allowances. Customer replies go to the owner, not to an AI (deliberate). Until the external-user onboarding test passes, each WhatsApp client is set up by hand with Robert (registry `commercial_decision_2026_10_08`). _(Premium+)_
- **Website chatbot** — the same AI brain as a chat widget on the client's website. _(Premium+)_
- **Weekly local SEO & competitor report** — Google Maps ranking + competitor watch, one action/week. _(Premium+)_ — this is the MarketSignal deliverable; distinct from the Messenger service's own "weekly performance report."
- **AI Voice Agent** — inbound phone agent for missed calls, 300 answered min/loc/mo. Live at `voice.cushlabs.ai`. _(Ultra)_
- **Industry tuning** — vertical-specific customization (e.g. healthcare). _(Ultra)_

---

## 3. What we DO NOT offer (never promise these)

These are **HELD (List 2)** or simply **not a service**. Never advertise, quote, or bake them into a proposal/demo:

- ❌ **An AI agent answering the client's customers on WhatsApp.** Not offered and not "coming": on WhatsApp, customer replies go to the owner. _(WhatsApp **automation** — alerts, reminders, promotions — IS offered; see §2.)_
- ❌ **Building or running a client's Facebook page** — not a service. (We deploy AI onto their _existing_ page.)
- ⚠️ **Website building** — NOT a standard 3-tier inclusion (don't list it as part of Basic/Premium/Ultra by default). BUT Robert **does build custom sites** — e.g. a simple website for a specific client, often on the client's own existing hosting. Include it when Robert decides to for a given client (as with La Tiendita). Separately, the _website chatbot_ (the AI chat widget) is a real Premium feature — different from building the site itself.
- ❌ **À-la-carte feature pricing / custom per-feature add-ons** — the model is tiered; extras fold into Basic/Premium/Ultra.
- ❌ **Outbound auto-dialing / cold-calling campaigns.**
- ❌ In-chat booking (the assistant captures the lead and sends the booking link / alerts the owner — it does not book), Meta notifications, lead-gen form blocks, multi-page OAuth picker, etc. — all List 2 roadmap. See `operating-system/strategy/from-marketing-site/MESSENGER-PREMIUM-UPGRADES-HELD.md`.

If a prospect's natural channel is WhatsApp-only (e.g. a corner store with no Facebook and no FB audience), the AI assistant itself is a **weak fit** — say so honestly. WhatsApp automation (reminders, promotions) may still fit on Premium; never invent an AI-on-WhatsApp offer.

---

## 4. The channel truth (the exact thing that gets confused)

> The AI talks to customers on **Facebook** (Messenger + comments), **Instagram** (Premium+), the website (Premium+) and the phone (Ultra). On **WhatsApp**, CushLabs does **automation**: owner alerts (every plan), reminders/confirmations and promotions (Premium+).
> "We automate WhatsApp" ≠ "an AI answers your customers on WhatsApp." The first is LIVE. The second is not offered — customer replies on WhatsApp go to the owner, deliberately.

Positioning for the Mexican SMB market (from CLAUDE.md): many local businesses have **no website — their Facebook page IS their storefront.** The pitch: _"We put your sales assistant where your customers already are — Facebook — and alert you on WhatsApp when someone's ready to talk."_ The owner needs no new app, no Meta Business Suite, nothing to learn.

**Business outcomes to lead with (all defensible, from the live feature set):**

- **Typically answered in seconds, 24/7** — fewer leads lost to slow replies (check claims-policy before putting a number on it).
- **Every comment becomes a conversation** — the AI replies to post comments and moves them to a private message.
- **You only step in to close** — it captures the lead with context and pings you on WhatsApp when they're ready.
- **Bilingual automatically** — EN + es-MX, following whatever the customer writes.
- **Grounded in what you approved** — hard facts (hours/prices) come from the client's own information; when unsure it offers a human. (Don't write "never invents" — claims-policy bans absolutes.)

---

## 5. Canonical sources — the source of truth (read before pricing/proposing)

**Nothing about price, promise, or feature availability is decided by you — it's recorded here.** When two sources disagree, the order below wins.

**In this repo (`cushlabs`):**

- `docs/strategy/ADVERTISED-COMMITMENTS.md` — **THE authoritative record** of everything we advertise, price, and promise, traced to the exact file that renders it. Start here.
- `operating-system/strategy/from-marketing-site/PRODUCT-AND-PRICING-SUMMARY.md` — the tiers/prices/terms in one place (mirrors `PricingSection.astro`).
- `operating-system/strategy/from-marketing-site/MESSENGER-PREMIUM-UPGRADES-HELD.md` — the HELD/List-2 features. **Never publish these.**
- `operating-system/strategy/from-marketing-site/MEXICO-GTM-STRATEGY.md` — go-to-market, ICP, the USD-anchoring rationale.
- `src/components/pricing/PricingSection.astro` — the price component; **if a doc disagrees with it, the component wins.**
- `src/pages/messenger-assistant.astro` (+ `es/`) — the live Messenger feature themes (List 1 only).

**In the bot repo (`C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot`):**

- `docs/FEATURE-INVENTORY.md` — **List 1 (live/advertisable) vs List 2 (held).** The site may only advertise List 1.
- `docs/MARKETING-CONTRACT.md` — the bot-side pointer back to `ADVERTISED-COMMITMENTS.md`.

**The two-repo model:** the **marketing repo (`cushlabs`)** owns what we _advertise/price/promise_; the **bot repo** owns what the bot _actually does_. They must never drift — a contradiction between them is a **P0 credibility bug**, not a rounding error.

---

## 6. Building client proposals & demo pages (the workflow you're likely here for)

- Client proposal/demo pages live in **`cushlabs/demos/<company>/<page>.html`** (NOT in `public/`) and are served **gated** at `https://www.cushlabs.ai/demo/<company>/<page>.html?token=<secret>` via `api/demo.ts` (the secret registry is inline in that file). Wrong/expired/absent secret → 404; `noindex` + `robots.txt` disallow keep them off search/bots. Reusable template: `demos/_template/`.
- **Every claim in a proposal or demo must map to §2 (offered) — never §3 (held/not-a-service).** If you catch yourself writing "WhatsApp ordering," "we run your page," or "we build your site," stop: those aren't real.
- **Lead with outcomes (§4), then the offer.** Hook the prospect on the result, sell the reality.
- **Spanish is es-MX** (Mexican Professional Spanish) — see the global CLAUDE.md standard. Every prospect deliverable is bilingual EN/es-MX, ES-default for Mexican clients.
- **Honesty gate:** if a prospect isn't a fit for the Facebook-first product, say so. Don't stretch the offer to fit the prospect.

---

## 7. One-paragraph summary (if you read nothing else)

CushLabs sells one managed subscription in three tiers (Basic $1,990 MXN / Premium $3,490 / Ultra $5,490 + IVA, or $129 / $229 / $349 USD; per business, 2 locations, no contract, 1-week free trial — canonical in `commercial-terms.json`). The core is a **bilingual AI on the client's Facebook** (Messenger + comments), trained to sound like them, that captures leads and **alerts the owner on WhatsApp**. Basic also includes Google review management; Premium adds Instagram, a website chatbot, WhatsApp reminders/confirmations and promotions, and a weekly SEO/competitor report; Ultra adds a voice agent. We do **not** put an AI agent on WhatsApp to answer customers, build/run Facebook pages, or build websites as a tier inclusion. The truth about all of this is in `docs/strategy/ADVERTISED-COMMITMENTS.md` — read it before you propose or price anything.
