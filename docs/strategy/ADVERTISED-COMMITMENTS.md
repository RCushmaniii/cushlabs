# ADVERTISED COMMITMENTS — Single Source of Truth for What CushLabs Sells, Prices, and Promises

> **Status:** Authoritative. This document is the canonical record of everything CushLabs
> **advertises, prices, and promises to clients** on the public marketing site (`cushlabs.ai`).
> If a number, feature claim, or promise appears on the live site, it is recorded here and
> traced back to the exact file that renders it.
>
> **Owner:** the marketing repo (`cushlabs`). **Audience:** humans doing GTM/pricing work **and**
> the AI assistant building the bot in the sibling repo (`cushlabs-messenger-bot`).
>
> **Last reconciled against the live components:** 2026-07-07.

---

## 0. Why this document exists (the two-repo blindness problem)

CushLabs's work lives in **two repositories that cannot see each other's intent**:

| Repo               | Path                                                      | Owns                                               | Blind to                                   |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| **Marketing site** | `C:\Users\Robert Cushman\Projects\cushlabs`               | What we **advertise, price, promise**              | What the bot actually _does_ today         |
| **Messenger bot**  | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot` | What the bot **actually does** (feature inventory) | What the site tells clients they're buying |

The failure mode this caused, in the bot assistant's own words:

> "I can't find a documented '1990 MXN/month' price anywhere in your repos... the docs that do
> touch pricing deliberately avoid quoting a number."

That conclusion was **correct about the bot repo and wrong about the business**: the `$1,990 MXN/mo`
price is live, explicit, and load-bearing on the marketing site — the bot repo simply had no
pointer to it. This document is that pointer. It closes the gap in **both** directions:

- The **bot assistant** reads this to know exactly what the business has promised, so the code it
  builds never under-delivers a claim or over-promises a held feature.
- The **marketing side** reads the bot's `FEATURE-INVENTORY.md` (below) so we never advertise a
  capability that isn't actually shipped ("List 1").

**Ground rule:** _Nothing gets advertised that isn't in bot List 1. Nothing gets promised in code
that contradicts a promise here._ When the two disagree, that is a **P0 reconciliation bug**, not a
rounding error — it's a client-facing credibility risk (see the global CLAUDE.md "AI Bots — Launch
Gate & Content Model" rule).

---

## 1. Ownership model — who is the source of truth for what

| Domain                                           | Source of truth                                             | Everything else must conform              |
| ------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------- |
| **Price numbers, tiers, terms, currency**        | This doc §2 ← `PricingSection.astro`                        | Bot proposals, quotes, `PRODUCT_TIERS.md` |
| **Guarantees & promises**                        | This doc §5 ← `Guarantee.astro` + `FAQ.astro`               | Bot conversation behavior, handoff copy   |
| **What features are LIVE (advertisable)**        | Bot `docs/FEATURE-INVENTORY.md` **List 1**                  | This doc §4, Messenger service page       |
| **What features are HELD (not advertised)**      | Bot List 2 ↔ marketing `MESSENGER-PREMIUM-UPGRADES-HELD.md` | Never rendered on the public site         |
| **Hard facts per client** (hours/prices/address) | Structured records injected verbatim (bot)                  | Never RAG prose — see §7                  |
| **Language / market standard**                   | Global CLAUDE.md (es-MX) + this doc §6                      | All bilingual output, both repos          |

---

## 2. PRICING — the exact SKUs we sell (authoritative)

**Rendered by:** `src/components/pricing/PricingSection.astro`
**Shown on:** `/pricing/` (`src/pages/pricing.astro`) and `/es/precios/` (`src/pages/es/precios.astro`),
and embedded on `/services/` and `/es/services/` (currency toggle suppressed there via `showCurrency={false}`).
**Cross-checked by:** `src/components/home2/FAQ.astro` (Q1) which states "Plans start at $1,990 MXN/mo (Basic) and go up to $5,490 (Ultra)."

Three tiers. One flat monthly price each. **Per business, includes up to 2 locations.**

| Tier                         | MXN/mo     | USD/mo   | Positioning                            | Adds over previous tier                                              |
| ---------------------------- | ---------- | -------- | -------------------------------------- | -------------------------------------------------------------------- |
| **Basic** (Básico)           | **$1,990** | **$129** | "For getting started"                  | — (see full list below)                                              |
| **Premium** _(Most popular)_ | **$3,490** | **$229** | "For growing businesses"               | Website chatbot · Weekly local SEO & competitor report               |
| **Ultra**                    | **$5,490** | **$349** | "For clinics & high-volume businesses" | AI Voice Agent (300 min/loc/mo) · Priority support · Industry tuning |

### 2.1 What each tier includes (verbatim from the live cards)

**Basic — $1,990 MXN / $129 USD** — this is the tier that answers "what do we charge 1,990 pesos for":

1. **AI assistant on Facebook Messenger (24/7)** — the flagship Messenger product (full feature set in §4).
2. **Google review management — with your approval.**
3. **Owner lead alerts** (owner notified the moment a lead is hot).
4. **Fully managed:** setup, training, ongoing support.

**Premium — $3,490 MXN / $229 USD** — _Most popular_:

- Everything in Basic, plus:
- **Website chatbot** (same assistant tech, deployed on the client's website).
- **Weekly local SEO & competitor report.**

**Ultra — $5,490 MXN / $349 USD**:

- Everything in Premium, plus:
- **AI Voice Agent** — 300 answered minutes per location/mo. Overage: **$8.50 MXN/min** ( **$0.59 USD/min** ).
- **Priority support.**
- **Industry tuning** (e.g., healthcare).

### 2.2 Universal terms (apply to every tier)

- **Locations:** every plan includes **up to 2 locations**; additional locations **+$690 MXN/mo** ( **+$49 USD/mo** ) each.
- **No setup fee. No contracts. 2-week free trial. Unlimited conversations (fair use).**
- **Payment (MXN):** SPEI or OXXO; **CFDI invoice included.**
- **Payment (USD):** card; invoice included.

### 2.3 Currency rule (do not break this)

The MXN⇄USD control is a **market toggle, not a live FX conversion.** USD prices are
**independently anchored marketing numbers** (seeded once from an FX rate, then owned as their own
figures). **Never auto-convert MXN↔USD in code, quotes, or bot replies.** MXN = Mexico + Central/South
America; USD = US + Canada. Rationale: `docs/strategy/MEXICO-GTM-STRATEGY.md` §11.

### 2.4 What is deliberately NOT priced or listed yet

- **WhatsApp and Instagram** channels are intentionally **absent** from the pricing tiers "until Meta
  approves; they layer into these tiers at no price change" (comment in `PricingSection.astro`). The
  bot must not advertise WhatsApp/IG as an available channel on any client-facing surface until that
  approval lands and this doc is updated. (Meta App Review status lives in the bot repo's roadblocks doc.)
- The Spanish long-form content the bot serves (`cushlabs-messenger-bot/content/cushlabs-ai/es/pricing-and-engagement.txt`)
  was written **quote-on-call**. That is now **superseded** by the explicit tiers above for the
  _self-serve site_, but the bot may still route complex/custom scope to a discovery call. **Action for
  the bot side:** reconcile that file so it does not _contradict_ the published $1,990 entry price
  (it can still say "custom scope is quoted on a call").

---

## 3. Productized services catalog (the atoms that make up the tiers)

Each tier is a **bundle** of these named products. This is the mapping the bot needs so it can
describe "what's included at my price" accurately.

| Product                                  | What it is                                                | Included at tier | Rendered / described in                                                                                         |
| ---------------------------------------- | --------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| **AI Messenger Assistant**               | 24/7 bilingual AI on the client's Facebook page           | **Basic+**       | `src/pages/messenger-assistant.astro` (+ `es/`), `src/components/services2/ServiceBlock.astro` (`messenger-ai`) |
| **Google Review Management**             | Monitors/queues review responses, owner-approved          | **Basic+**       | `PricingSection.astro` Basic card                                                                               |
| **Owner Lead Alerts**                    | Owner pinged when a lead is hot (WhatsApp alert workflow) | **Basic+**       | `PricingSection.astro`; Messenger page theme 3                                                                  |
| **Website Chatbot**                      | Same assistant tech on the client's website               | **Premium+**     | `PricingSection.astro`; `ServiceBlock.astro` (`support-assistants`)                                             |
| **Weekly Local SEO & Competitor Report** | Google Maps ranking + competitor watch, one action/wk     | **Premium+**     | `PricingSection.astro`; `src/components/home2/SolutionOverview.astro` (pillar 2)                                |
| **AI Voice Agent**                       | Inbound phone agent, 300 answered min/loc/mo              | **Ultra**        | `PricingSection.astro`; `SolutionOverview.astro` (pillar 3); live at `voice.cushlabs.ai`                        |
| **Industry Tuning**                      | Vertical-specific tuning (e.g. healthcare)                | **Ultra**        | `PricingSection.astro` Ultra card                                                                               |
| **Fully-managed wrapper**                | Setup, training, weekly reports, monthly tuning           | **All**          | `Guarantee.astro`, Messenger page "What's Included", `ServiceBlock.astro`                                       |

> ⚠️ **Report naming trap (reconcile carefully):** there are **two different "weekly reports."**
> (a) The Messenger product's **"weekly performance report"** = what customers asked / what converted
> (part of the managed Messenger service, Basic+). (b) The Premium **"weekly local SEO & competitor
> report"** = Google Maps rankings + competitor moves (a _different_ deliverable, Premium+). The bot
> must not conflate them when describing inclusions.

---

## 4. The Messenger Assistant feature set — advertised = List 1 only

**This is the most important reconciliation surface.** The Messenger service page advertises exactly
four themes, and every bullet is asserted to be **live in production today** ("Nothing here is roadmap
— List 1 only"). These claims are the contract the bot code must satisfy.

**Rendered by:** `src/pages/messenger-assistant.astro` (EN) and `src/pages/es/messenger-assistant.astro` (ES),
in the `themes` array.
**Must map 1:1 to:** `cushlabs-messenger-bot/docs/FEATURE-INVENTORY.md` **List 1** (enabled + live on the
two demo bots `m.me/cushlabs` and `m.me/nyenglishteacher`).

### Theme 1 — "It answers instantly — and correctly"

- Replies in **under 5 seconds, 24/7** — nights, weekends, holidays.
- Trained on the client's **real products, prices, hours, policies, tone**.
- **Grounded answers only** — never invents a price or makes up a promise.
- **Hard facts** (hours, pricing) come back **exact, every time** (→ structured records, see §7).

### Theme 2 — "It feels like a real, modern experience"

- **English & Spanish automatically**, following whatever the customer writes.
- **Sends photos/visuals in-chat** — menus, before-and-afters, mini-lessons.
- **Reads photos** customers send and answers based on their content (vision).
- **Remembers the conversation** so customers never repeat themselves.
- **Tappable suggested questions** + a **persistent menu**.

### Theme 3 — "It knows when to get out of the way"

- **Hands off with full context** when a customer asks for a person.
- Answers **"are you a bot?" honestly** — no awkward false handoffs.
- **Captures the lead** (name, contact, intent) **with consent**.
- **Optional owner alerts** the moment a lead is hot.
- **Resumes automatically** once the human is done.

### Theme 4 — "It's built like a real product"

- **Discloses it's an AI** to every new customer up front.
- **Guardrails** block prompt-injection/manipulation, **inbound and outbound**.
- **Rate-limited & abuse-protected** — no one can run up the client's bill.
- **Error monitoring + analytics 24/7**, with **no personal data stored**.
- **Fully managed by CushLabs**: setup, training, weekly reports, monthly tuning.

> **Held features (List 2) — must NOT appear on the public site or be promised by the bot.**
> Tracked in marketing at `docs/strategy/MESSENGER-PREMIUM-UPGRADES-HELD.md` and must equal bot List 2.
> If the bot ships a List-2 feature, it is promoted to List 1 **and advertised only after** this doc
> and the Messenger page are updated in the same change.

---

## 5. Promises & guarantees — contractual, the bot must never contradict these

**Rendered by:** `src/components/home2/Guarantee.astro` and `src/components/home2/FAQ.astro`.

### 5.1 The four guarantees (`Guarantee.astro`)

1. **Free discovery call** — 30 min; honest fit assessment; "no hard sell, ever."
2. **Free 2-week trial** — no setup fee, no deposit; client pays nothing until it works as agreed.
3. **Month-to-month, cancel anytime** — no lock-in; 30 days' notice; no penalty.
4. **Client owns their data & system** — full documentation, access credentials, code where applicable; fully portable.

### 5.2 FAQ commitments (`FAQ.astro`) — behavioral guarantees the bot embodies

- **Pricing:** "$1,990 MXN/mo (Basic) … up to $5,490 (Ultra)"; monthly; no setup/contract; free trial; free discovery call.
- **Speed to launch:** productized setups (Messenger, website chatbot, reviews) **live within days** of a completed intake; complex custom builds take weeks.
- **Accuracy:** answers **grounded in approved content, not the open internet**; when not confident, **hands off** instead of guessing; monitoring surfaces gaps.
- **Data security:** controlled environments, access controls, encryption, logging; **"I don't use your data to train models"**; practices documented and handed over.
- **Market:** Guadalajara-based; serves **Mexico, US, LATAM**; all systems output **bilingual EN/ES**; project comms English-first, Spanish for stakeholder conversations.
- **Honesty:** "If AI isn't the right move — or the timing isn't right — I'll tell you directly."

> These are **promises the bot's runtime behavior must uphold**, not just marketing copy. Example: the
> "grounded answers only" and "hands off when not confident" claims in §5.2 and §4 mean the bot's
> decision layer **must** have golden-set tests proving it (per the global CLAUDE.md launch gate).

---

## 6. Language & market standard (both repos)

- **Default for all Spanish:** **Mexican Professional Spanish (es-MX)** — never Iberian, never "neutral LatAm."
  Full forbidden-marker list and preferred phrasings: global `CLAUDE.md` → "Spanish Content Standard."
- Any EN→ES translation prompt **must** say "Mexican Professional Spanish" explicitly.
- Audience: Mexico-based corporate/SMB professionals; beauty-spa vertical is the first wedge.
- The bot serves the **es-MX** ice-breakers to Spanish-Facebook users automatically (see
  `cushlabs-messenger-bot/scripts/set-messenger-profile.ts`, kept in sync with the demo cards).

---

## 7. Two-class content model (hard facts vs. fuzzy prose) — governs "correctness" claims

The §4 Theme 1 promise ("hard facts come back exact, every time") is only true if the bot obeys the
two-class model from the global CLAUDE.md:

- **Hard facts** (hours, prices, address, phone, holiday closures, booking URL) → **structured records
  injected verbatim** into the prompt. **Never** stored as prose in the vector DB.
- **Fuzzy prose** (about, philosophy, service descriptions, FAQ narrative) → vector DB via ingest.
- Client update path: a fact change = one field edit, live instantly, no re-embed.

**Reconciliation duty:** the site advertises "prices/hours exact, always." If the bot stores any hard
fact as RAG prose, that advertised claim is **false** → flag as P0 (same standing as the in-memory
rate-limiter check).

---

## 8. Marketing ↔ Bot reconciliation map (the bridge table)

For each advertised claim: where the site renders it, and the bot-side artifact that must back it.

| #   | Advertised claim                           | Marketing render (this repo)                       | Bot source-of-truth (sibling repo)                                           | Reconcile check                                    |
| --- | ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | Basic = $1,990 MXN / $129 USD              | `src/components/pricing/PricingSection.astro`      | `docs/PRODUCT_TIERS.md`, `content/cushlabs-ai/es/pricing-and-engagement.txt` | Bot docs must not say "no price"/contradict $1,990 |
| 2   | Tiers, terms, locations, overage           | `PricingSection.astro`; `home2/FAQ.astro`          | `docs/PRODUCT_TIERS.md`                                                      | Numbers identical both sides                       |
| 3   | Messenger 4-theme feature set              | `src/pages/messenger-assistant.astro` (`themes`)   | `docs/FEATURE-INVENTORY.md` **List 1**                                       | Every bullet ∈ List 1 (live), not roadmap          |
| 4   | Held/premium (WhatsApp, IG, List 2)        | `docs/strategy/MESSENGER-PREMIUM-UPGRADES-HELD.md` | `docs/FEATURE-INVENTORY.md` **List 2**                                       | Neither surface advertises List 2                  |
| 5   | Guarantees (trial, cancel, data ownership) | `src/components/home2/Guarantee.astro`             | Bot conversation + handoff logic                                             | Bot never contradicts (e.g., never claims lock-in) |
| 6   | "Grounded answers / hands off when unsure" | `home2/FAQ.astro`; Messenger themes 1 & 3          | Bot decision layer + golden-set tests                                        | Tests exist proving the decision                   |
| 7   | "Hard facts exact, always"                 | Messenger theme 1                                  | Bot structured-records injection (§7)                                        | No hard fact in RAG prose                          |
| 8   | "No data used to train models"             | `home2/FAQ.astro`                                  | Bot data-handling config                                                     | Config matches the promise                         |
| 9   | es-MX everywhere                           | Global `CLAUDE.md`                                 | `scripts/set-messenger-profile.ts`                                           | No Iberian markers either side                     |

---

## 9. Fully-qualified file reference index

### Marketing repo — `C:\Users\Robert Cushman\Projects\cushlabs`

| Purpose                                      | Absolute path                                                                                     | Repo-relative                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **This document**                            | `C:\Users\Robert Cushman\Projects\cushlabs\docs\strategy\ADVERTISED-COMMITMENTS.md`               | `docs/strategy/ADVERTISED-COMMITMENTS.md`               |
| Pricing (all tiers, terms, currency)         | `...\cushlabs\src\components\pricing\PricingSection.astro`                                        | `src/components/pricing/PricingSection.astro`           |
| Pricing pages                                | `...\cushlabs\src\pages\pricing.astro` · `...\src\pages\es\precios.astro`                         | `src/pages/pricing.astro`, `src/pages/es/precios.astro` |
| Messenger service page (feature themes)      | `...\cushlabs\src\pages\messenger-assistant.astro` · `...\src\pages\es\messenger-assistant.astro` | `src/pages/messenger-assistant.astro` (+ `es/`)         |
| Services blocks (all products)               | `...\cushlabs\src\components\services2\ServiceBlock.astro`                                        | `src/components/services2/ServiceBlock.astro`           |
| Three-systems overview                       | `...\cushlabs\src\components\home2\SolutionOverview.astro`                                        | `src/components/home2/SolutionOverview.astro`           |
| Guarantees                                   | `...\cushlabs\src\components\home2\Guarantee.astro`                                               | `src/components/home2/Guarantee.astro`                  |
| FAQ (promises, security, pricing)            | `...\cushlabs\src\components\home2\FAQ.astro`                                                     | `src/components/home2/FAQ.astro`                        |
| MX go-to-market strategy (USD anchoring §11) | `...\cushlabs\docs\strategy\MEXICO-GTM-STRATEGY.md`                                               | `docs/strategy/MEXICO-GTM-STRATEGY.md`                  |
| Held premium features                        | `...\cushlabs\docs\strategy\MESSENGER-PREMIUM-UPGRADES-HELD.md`                                   | `docs/strategy/MESSENGER-PREMIUM-UPGRADES-HELD.md`      |

### Bot repo — `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot`

| Purpose                                                       | Absolute path                                                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Capabilities & roadmap (List 1 / List 2 source)               | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\docs\CAPABILITIES-AND-ROADMAP.md`                  |
| Feature inventory (the List 1/2 the site cites)               | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\docs\FEATURE-INVENTORY.md`                         |
| Product tiers (DRAFT — reconcile to §2)                       | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\docs\PRODUCT_TIERS.md`                             |
| es-MX pricing/engagement content served to customers          | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\content\cushlabs-ai\es\pricing-and-engagement.txt` |
| Messenger profile / ice-breakers (keep in sync w/ demo cards) | `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\scripts\set-messenger-profile.ts`                  |

---

## 10. Instructions for the bot-repo AI assistant (read this, then act)

You are working in `cushlabs-messenger-bot`. This file lives in the **sibling** marketing repo at
`C:\Users\Robert Cushman\Projects\cushlabs\docs\strategy\ADVERTISED-COMMITMENTS.md`. You can read it
directly. Do the following to establish durable connectivity:

1. **Create a pointer doc on your side:** `cushlabs-messenger-bot\docs\MARKETING-CONTRACT.md`. It should
   (a) state that the marketing repo is the source of truth for price/promise, (b) link to this file by
   its absolute path, and (c) embed the §8 reconciliation table so your future self checks it before
   changing pricing/feature behavior.
2. **Reconcile `PRODUCT_TIERS.md`** to §2 above: record Basic $1,990 / Premium $3,490 / Ultra $5,490 MXN
   (and $129/$229/$349 USD), the 2-location inclusion, +$690 MXN/+$49 USD per extra location, voice
   overage $8.50 MXN / $0.59 USD/min, and the universal terms. Mark it "reconciled to
   ADVERTISED-COMMITMENTS.md §2 on <date>". **Do not invent a usage cap** the site doesn't state — the
   site says "unlimited conversations (fair use)"; if you need an internal token ceiling, record it as an
   _internal_ cost control, clearly separated from the public promise.
3. **DECISION (2026-07-07 — Robert): the bot STATES the entry price.** Update
   `content/cushlabs-ai/es/pricing-and-engagement.txt` (and the `en/` equivalent) and the CushLabs tenant
   config (currently "pricing quoted personally") so the assistant answers price questions with
   **"desde $1,990 MXN/mes"** and the Basic/Premium/Ultra shape from §2, routing to a discovery call **only**
   for multi-location / custom / voice scope. Retire the blanket quote-on-call behavior for the entry price.

4. **DECISION (2026-07-07 — Robert): wire owner lead alerts BEFORE selling Basic.** `src/lib/alert.ts`
   (List 1 #10) is built but dormant. Configure `HANDOVER_ALERT_WEBHOOK` (interim Slack/Discord destination
   until the WhatsApp path ships post-Meta-approval) so the Basic-tier "Owner lead alerts" promise is
   actually delivered. This is List 2 #10, "shovel-ready — code exists, needs turning on." Until it is set,
   do not onboard a Basic client who expects alerts. Mind the bot repo's documented `wrangler deploy` OAuth
   gotcha when redeploying the Worker.
5. **Prove the §4 List-1 claims with golden-set tests.** Each advertised bullet in §4 that is a _decision_
   (handoff on "talk to a person," honest "are you a bot?", grounded-only answers, consent-based lead
   capture) needs a behavioral test against real EN + es-MX phrasings. Every production bug becomes a
   permanent fixture the same day (global CLAUDE.md launch gate).
6. **Enforce the two-class content model (§7).** Audit that every hard fact (hours/prices/address/phone/
   closures/booking URL) is a structured record injected verbatim — never RAG prose. Any hard fact found
   in the vector DB = P0.
7. **Keep List 1 / List 2 honest.** Only List 1 may be advertised. If you ship a List-2 feature, flag it
   here so marketing promotes it on the site and in this doc in the _same_ change — never let the bot
   silently exceed (or fall short of) the advertised set.
8. **Answer "what do we charge 1,990 pesos for?" from §2.1 Basic**, not from memory: AI Messenger
   Assistant (24/7, the full §4 feature set) + Google review management (owner-approved) + owner lead
   alerts + fully-managed (setup/training/support), per business incl. up to 2 locations, no setup fee,
   no contract, 2-week free trial, unlimited conversations (fair use), CFDI invoice.

**Sync protocol going forward:** any change to price, a guarantee, or an advertised feature is made in
the marketing repo **and** reflected here in the _same_ PR; then this file's `Last reconciled` date is
bumped and you update your `MARKETING-CONTRACT.md`. Drift between the two repos is a P0 credibility bug.

---

## 11. VERIFIED reconciliation — advertised vs. bot List 1 (investigated 2026-07-07)

Cross-checked the four advertised Messenger themes (§4) against the bot's code-verified
`cushlabs-messenger-bot/docs/FEATURE-INVENTORY.md` **List 1** (items #1–#22) and the es content the
bot serves. Verdict: **the advertising is overwhelmingly backed by shipped code — with ONE material
gap and a few precision nuances.**

### 11.1 🔴 Material gap — "Owner lead alerts" is advertised as live but is DORMANT in code

- **Advertised as:** a **Basic-tier** included feature — `PricingSection.astro` Basic card: _"Owner lead
  alerts"_ — and Messenger theme 3: _"Optional owner alerts the moment a lead is hot."_
- **Reality (FEATURE-INVENTORY List 1 #10):** the operator alert on handover is _"**Wired but dormant**
  (needs `HANDOVER_ALERT_WEBHOOK`)"_. The WhatsApp-delivered version (the whole "we ping you on WhatsApp
  when a lead is ready" positioning in the project CLAUDE.md) is **List 2, Tier 3 #10 — roadmap**, "planned
  to become a WhatsApp notification post-approval."
- **Why it matters:** the pricing page lists it flatly (no "optional") as something a $1,990 Basic client
  is buying. Until the webhook is configured per tenant, that client does not get alerts. This is the
  exact under-deliver-a-promise failure the launch-gate rule exists to catch. **Decision needed (Robert):**
  either (a) wire `HANDOVER_ALERT_WEBHOOK` (List-2 #10 is "shovel-ready — code exists, needs turning on")
  before selling Basic, or (b) soften the pricing-page wording to "owner alerts (setup on request)" until
  the WhatsApp path ships. I recommend (a) — it's a config task, not a build.

### 11.2 🟡 Pricing docs are stale/quote-on-call vs. the site's explicit tiers

- `cushlabs-messenger-bot/docs/PRODUCT_TIERS.md` is an explicit **DRAFT** ("Nothing here is enforced in
  code") with placeholder names **Trial / Starter / Growth** and **no peso figures** — fully divergent
  from the live **Basic $1,990 / Premium $3,490 / Ultra $5,490**. Reconcile to §2 (task §10.2).
- `content/cushlabs-ai/es/pricing-and-engagement.txt` is deliberately **quote-on-call** (says "precios
  fijos" but routes to Robert for the number). It does not _contradict_ $1,990, but it is now inconsistent
  with a self-serve site that publishes tiers. The CushLabs demo tenant is configured "pricing quoted
  personally" (FEATURE-INVENTORY tenant table), yet a demo ice-breaker is literally _"¿Cuánto cuesta?"_.
  **Decision needed (Robert):** should the bot now _state_ the $1,990 entry price and route only
  multi-location/custom to a call, or keep quoting personally? (I'd state the entry price — the site
  already does, so withholding it from the bot just feels evasive.)

### 11.3 🟡 Internal conversation caps vs. public "unlimited (fair use)"

- `PRODUCT_TIERS.md` proposes hard caps (500 / 3,000 / 15,000 conversations/mo). The site promises
  **"unlimited conversations (fair use)."** **Confirmed no cap language leaks into customer-facing
  content** (grep of `content/` is clean) — so today this is an _internal-draft_ tension, not a live
  customer contradiction. Guardrail: if a cap is ever enforced in code it must stay an internal cost
  control; "fair use" is the only public statement. See §10.2.

### 11.4 🟢 Precision nuances — accurate, but word carefully

- **"Remembers the conversation"** = List 1 #7, rolling **last-10 exchanges, 1h TTL** — true within a
  session, not permanent memory. Current copy is fine; don't escalate it to "remembers everything forever."
- **"With the customer's consent"** (lead capture) = List 1 #13 is **prompt-level** consent via one-tap
  share chips, **not a stored consent record** (FEATURE-INVENTORY caveat). Fine for the current claim;
  do **not** upgrade to a compliance/GDPR-style "logged consent" claim without building the record.
- **"Never invents a price"** — strongly backed: hard facts are injected verbatim and marked authoritative
  over RAG (List 1 #4); RAG fails soft at min score 0.6. Solid claim.

### 11.5 🟢 Everything else advertised → confirmed live in List 1

Instant/grounded answers (#3,#4), EN/es-MX auto (#5), vision/reads photos (#6), sends visuals & carousels
(#12), honest handoff incl. "are you a bot?" (#8, unit-tested), auto-resume (#9), AI self-disclosure (#15),
in+out guardrails (#17, tested), rate-limiting/abuse protection (#16), analytics with no PII (#19),
error monitoring (#21). **No over-claim** among these.

### 11.6 💰 Under-sold — List 1 capabilities the site does NOT mention (upsell/marketing opportunities)

- **Operator console / admin API** (List 1 #18) — Clerk-authed per-page inbox, handoff badges, one-click
  return-to-bot. A real owner-facing deliverable; the site never mentions the client gets a console.
- **Smooth OAuth page-connect onboarding** (#20) — "connect your Page, no app re-review per client" is a
  friction-killer worth saying out loud.
- **QA simulation gate** (#22) — "every change is tested against the real production decision pipeline
  before it touches a customer" is a strong trust signal for a savvy buyer; currently invisible.
- **Multi-tenant isolation** (#1) — per-Page data isolation is a security/trust point for bigger clients.

### 11.7 🟢 Correctly consistent across both repos (no action)

- **WhatsApp/Instagram**: site omits them; bot es content says _"Instagram y WhatsApp están en camino y se
  agregarán sin costo extra"_ — matches the "layer in at no price change" stance. Keep until Meta approves.
- **Two "weekly reports"**: bot content keeps them distinct (`services-messenger-bot` performance report
  vs. `services-marketsignal` SEO/competitor report). Just don't conflate per §3.

**Bottom line:** advertising integrity is high (confidence 90%). The one thing that would embarrass you in
front of a Basic client is §11.1 — owner lead alerts sold as included but dormant in code. Fix that webhook
or soften the copy before the next Basic signup.
