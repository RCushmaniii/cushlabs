# CushLabs — Product & Pricing Summary

**Last updated:** 2026-07-07
**Canonical price source:** `src/components/pricing/PricingSection.astro` (this doc mirrors it — if they ever disagree, the component wins).
**Related:** `MEXICO-GTM-STRATEGY.md` (strategy, edge cases, USD rationale) · `MESSENGER-PREMIUM-UPGRADES-HELD.md` (premium roadmap).

> **Currency follows the customer's MARKET, not their language.**
> 🇲🇽 **MXN** = Mexico + all of Central & South America (LatAm). 🇺🇸🇨🇦 **USD** = United States + Canada.
> USD prices are **independently anchored** marketing numbers (seeded once from FX, then owned as their own numbers) — **never** a live currency conversion. Do not auto-convert one from the other.

---

## 1. The Core Product — one managed subscription, three tiers

CushLabs sells **one product**: a fully-managed AI subscription for local/SMB businesses, billed monthly per business. There are no à-la-carte add-ons and no setup fee — you pick a tier, and everything in it is built, trained, deployed, and maintained for you.

Every plan includes **up to 2 locations**, **unlimited conversations (fair use)**, a **2-week free trial**, and **no contract**.

### Pricing table

| Tier                            | Best for              | MXN / month | USD / month | Headline inclusions                                                                                           |
| ------------------------------- | --------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| **Basic**                       | Getting started       | **$1,990**  | **$129**    | Messenger AI · Google review management · lead capture + owner alerts · fully managed                         |
| **Premium** ⭐ _(most popular)_ | Growing businesses    | **$3,490**  | **$229**    | Everything in Basic **+** website chatbot **+** weekly local SEO & competitor report                          |
| **Ultra**                       | Clinics & high-volume | **$5,490**  | **$349**    | Everything in Premium **+** AI Voice Agent (300 min/location/mo) **+** priority support **+** industry tuning |

### Add-ons & overage (flat across tiers)

| Item                                        | MXN                 | USD                | Notes                                                        |
| ------------------------------------------- | ------------------- | ------------------ | ------------------------------------------------------------ |
| Additional location (beyond the 2 included) | **+$690 / mo each** | **+$49 / mo each** | Flat, regardless of tier — reflects low marginal cost        |
| AI Voice Agent overage (Ultra only)         | **$8.50 / min**     | **$0.59 / min**    | Only past the 300 answered min/location/mo included in Ultra |

### Terms that apply to every plan

- **No setup fee. No contracts. Cancel anytime.**
- **2-week free trial** on up to two locations. Larger multi-location rollouts run the trial on 1–2 locations first, then expand.
- **Unlimited conversations (fair use)** — internal soft cap ~1,000 conversations/mo/location.
- **Payment:** 🇲🇽 SPEI · OXXO · CFDI invoice included. 🇺🇸🇨🇦 Pay by card · invoice included.

---

## 2. Core Product — features, benefits & tier placement (detail)

### Basic — $1,990 MXN / $129 USD per month

**Who it's for:** A local business (often family-owned, frequently with no website) whose entire customer-facing presence is a Facebook page. This is their storefront and their front desk.

- **AI assistant on Facebook Messenger, 24/7**
  _Feature:_ A custom AI assistant trained on your products, prices, hours, policies, and tone, answering every Messenger message in seconds — in English and Spanish, automatically.
  _Benefit:_ You stop losing leads to slow replies. Facebook keeps your "responds quickly" badge (lost after 15 min); your response time is under 5 seconds, day or night. Competitors who answer slower lose the conversation.

- **Google review management — with your approval**
  _Feature:_ Drafts and manages responses to your Google reviews; nothing is posted without your sign-off.
  _Benefit:_ A steady, professional review presence — the #1 local-trust signal — without you writing a word or letting anything go out unapproved.

- **Lead capture + owner notifications**
  _Feature:_ Captures the customer's name, contact, and intent (consent-gated) and notifies you when a lead is hot. (_Instant WhatsApp alerts are on the way — not promised as live until the Meta channel is approved._)
  _Benefit:_ You only get pulled in when someone is ready to buy — and you get them with the context already gathered, ready to close.

- **Fully managed: setup, training, ongoing support**
  _Feature:_ CushLabs builds, trains, connects, tests, and monitors everything. You never touch a dashboard.
  _Benefit:_ No new software to learn, no builder to configure. It just works, and it keeps working.

### Premium — $3,490 MXN / $229 USD per month _(most popular)_

**Everything in Basic, plus:**

- **Website chatbot**
  _Feature:_ The same AI brain deployed as a chat widget on your website.
  _Benefit:_ Captures and answers visitors on your site too — one assistant, two surfaces, consistent answers.

- **Weekly local SEO & competitor report**
  _Feature:_ An automated weekly report on your local search position and what nearby competitors are doing.
  _Benefit:_ You see where you stand and where to move, without hiring an agency or watching dashboards. Turns "I have no idea how I rank" into a decision every Monday.

### Ultra — $5,490 MXN / $349 USD per month

**Everything in Premium, plus:**

- **AI Voice Agent — 300 answered minutes per location / month**
  _Feature:_ An inbound voice agent that answers missed calls. Overage billed at $8.50 MXN / $0.59 USD per minute past the included 300 min/location.
  _Benefit:_ Missed calls become answered calls and captured leads — critical for clinics and high-call-volume businesses where a missed call is a lost patient/customer.

- **Priority support**
  _Feature:_ Front-of-line response for changes and issues.
  _Benefit:_ Faster turnaround when your business needs a change made now.

- **Industry tuning (e.g. healthcare)**
  _Feature:_ Deeper customization for the norms and language of your vertical.
  _Benefit:_ The assistant sounds like it belongs in your industry — important for regulated / high-trust fields like healthcare.

---

## 3. Premium Products / Upgrades — NOT YET SOLD (roadmap)

> ⚠️ These are **not** part of the current offering and are **not** advertised anywhere public. They live in `MESSENGER-PREMIUM-UPGRADES-HELD.md`. When any of them ships, it folds **into a tier** (Basic/Premium/Ultra) — **not** an à-la-carte menu. Never quote a price or imply availability for anything in this section.

### (a) Buildable on request — shovel-ready (code paths exist, need wiring/UI)

| Upgrade                        | What it adds                                                                                                                   | Status                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Instant operator-alert webhook | Real-time push (WhatsApp/webhook) the moment a lead is hot — the productized, always-on version of Basic's "alerts on the way" | Groundwork wired, dormant           |
| Self-serve content edit UI     | Client edits their own hard facts (hours/prices) via an admin form                                                             | Admin API exists; needs the form UI |

### (b) Roadmap — not started / platform-gated (several need Meta approval)

- **WhatsApp Business Platform** — the same assistant answering on WhatsApp (the big one; separate Meta approval)
- In-chat webview booking (book inside Messenger, no redirect)
- One-Time & Recurring Notifications (Meta-approved re-engagement messaging)
- Native Meta lead-gen form + CSAT survey blocks
- Ad / click-to-Messenger referral personalization
- Message reactions, read/delivery receipts, `mark_seen`
- Message tags / `HUMAN_AGENT` extended messaging window
- Audio / video / file message handling
- OAuth multi-page picker (connect several pages at once)
- Page insights + comment management

---

## 4. Quick reference — every number in one place

|                                      | Basic        | Premium      | Ultra                 |
| ------------------------------------ | ------------ | ------------ | --------------------- |
| **MXN/mo**                           | $1,990       | $3,490       | $5,490                |
| **USD/mo**                           | $129         | $229         | $349                  |
| Messenger AI (24/7, bilingual)       | ✅           | ✅           | ✅                    |
| Google review management             | ✅           | ✅           | ✅                    |
| Lead capture + owner alerts          | ✅           | ✅           | ✅                    |
| Fully managed                        | ✅           | ✅           | ✅                    |
| Website chatbot                      | —            | ✅           | ✅                    |
| Weekly local SEO & competitor report | —            | ✅           | ✅                    |
| AI Voice Agent (300 min/location)    | —            | —            | ✅                    |
| Priority support                     | —            | —            | ✅                    |
| Industry tuning                      | —            | —            | ✅                    |
| Included locations                   | 2            | 2            | 2                     |
| Extra location (MXN / USD)           | +$690 / +$49 | +$690 / +$49 | +$690 / +$49          |
| Voice overage (MXN / USD)            | —            | —            | $8.50 / $0.59 per min |
| Free trial                           | 2 weeks      | 2 weeks      | 2 weeks               |
| Setup fee / contract                 | None / None  | None / None  | None / None           |
