# CushLabs — Mexico Go-To-Market Strategy

> **Status:** Living strategy document. Started 2026-06-28.
> **Owner:** Robert Cushman (Guadalajara, Mexico)
> **Purpose:** Durable home for the MX-first repositioning — pricing, services, unit economics, market research, niche selection, decision trees, and go-to-market tactics. Supersedes the prior US-oriented model.

---

## 0. The Pivot (TL;DR)

CushLabs is repositioning **MX-first**, anchored in Guadalajara, selling an **affordable productized AI service suite to Mexican SMBs** — not the prior US model ($997/mo bundle, $3,500 projects).

- **Realistic price ceiling for a Mexican SMB: ~$100 USD / ~2,000 MXN per month** (validated — §1).
- **Core bundle: flat `1,990 MXN/mes`** (salon beachhead). Higher tier for dental (~3,990–5,990 MXN) on expansion.
- **THE HEADLINE IS THE CONVERSATIONAL AI FRONT-DESK** (Messenger/IG/WhatsApp two-way), NOT reminders. Reminders + reviews are _included bonuses_ — they're commoditized everywhere (§6).
- **Target the MANUAL TAIL** — owners still on personal WhatsApp + a Facebook page + a paper appointment book. NOT businesses already on Booksy/Kosmo/Dentalink.
- **Build on Meta Cloud API direct** (custom app already in Meta approval) — highest margin.
- **Niche: beauty salons/spas as beachhead → dental clinics as up-market expansion** (§6).
- Product name (working): **`Recepción Digital`**.

The old US pricing still lives on the production site and **must be reconciled** (§9).

---

## 1. Why the Price Is ~2,000 MXN (and why it still profits)

### Willingness to pay (research 2026-06-28)

The Mexican SMB market has a **hard gap**: cheap self-serve _tools_ at **300–980 MXN/mo**, done-for-you _agencies_ at **8,000–15,000 MXN/mo**, and almost nothing between. `1,990 MXN` sits in that empty middle.

- Social-media-management agencies (closest comparable): **8,000–15,000 MXN/mo**, ~10,000 avg.
- Nearest done-for-you AI analog (Kosmo): **4,497 MXN/mo** — we undercut by half.
- Self-serve WhatsApp/chatbot SaaS: Leadsales ~1,940 MXN, Whaticket ~980 MXN, B2Chat ~1,800 MXN.
- Cost is the #1–2 barrier to digitalization (37% cite platform cost; 23% cite no budget).

**Implication: sell the OUTCOME (done-for-you, replaces a receptionist), not "software."** As a _tool_, 1,990 is at the ceiling; as a _service_, it's a steal vs. the agency norm.

### Unit economics — the core services are ~zero marginal cost

WhatsApp billing changed in Mexico (per-message since July 2025):

| Message type                         | Mexico cost                           | Notes                                  |
| ------------------------------------ | ------------------------------------- | -------------------------------------- |
| **Service** (reply within 24h)       | **FREE, unlimited**                   |                                        |
| **Utility** (appt/billing reminders) | **FREE in 24h window**, else ~$0.0085 | our reminders live here                |
| **Marketing**                        | ~$0.03/msg                            | **the cost landmine → metered add-on** |
| Facebook Messenger                   | **no per-message fee**                | pure LLM token cost                    |
| Google review replies                | API free                              | pure LLM token cost                    |

On **Meta Cloud API direct** (zero reseller markup), the core services cost ~single-digit dollars/client/month in LLM tokens. **Gross margin at 1,990 MXN is very high — confidence 85%** (verify live MX marketing rate in WhatsApp Manager before finalizing the marketing add-on).

- **Marketing blasts cannot be unlimited in a flat bundle** (~3,275 marketing msgs = $100). Metered or pass-through.
- **Voice agent (~$0.07/min) has real variable cost** → premium tier only, never in the flat bundle.

### Payment & billing (non-negotiable for MX)

- **SPEI + OXXO required** — card-on-file alone reaches only ~half of MX SMBs.
- **CFDI invoicing** included — a friction point US tools ignore.

---

## 2. The Service Suite (repositioned)

> **KEY REPOSITIONING (2026-06-28 research):** Appointment reminders are **commoditized** in both target niches (free from Booksy/Fresha for salons; table-stakes in Dentalink + a dozen dental-AI vendors). Reminders are now a **bonus, not the headline.** The defensible white space is **two-way conversational AI** (booking apps are one-way broadcast — Fresha won't even let clients reply) **+ review management with an approval gate.**

| #   | Service                                                                 | Tier     | Role                        | Marginal cost                 |
| --- | ----------------------------------------------------------------------- | -------- | --------------------------- | ----------------------------- |
| 1   | **Asistente conversacional con IA** (Messenger/IG/WhatsApp, two-way)    | **Core** | **THE HEADLINE**            | ~$0 (tokens)                  |
| 2   | **Gestión de reseñas** (Google review replies + owner-approval gate)    | **Core** | Differentiated bonus        | ~$0 (tokens)                  |
| 3   | **Recordatorios por WhatsApp** (appt/billing)                           | **Core** | Commodity bonus             | ~$0 in-window                 |
| 4   | **Website AI chatbot**                                                  | Add-on   | Upsell (the ~23% w/ a site) | ~$0 (tokens)                  |
| 5   | **Voice agent** (inbound)                                               | Premium  | Expansion                   | **~$0.07/min**                |
| 6   | **Local SEO / competitor report via WhatsApp** (from MarketSignal repo) | Add-on   | Expansion (wide-open gap)   | low (cached LLM + search API) |

**Plus the glue (included in core):** WhatsApp lead-alert/handover to the owner (the workflow Robert already dog-foods), CFDI, SPEI/OXXO, fully es-MX.

### The moat

The wedge is **integration + es-MX quality + WhatsApp-handover-to-owner + done-for-you for non-technical owners + local (MXN/CFDI) billing** — NOT any single feature (every feature exists somewhere). Assembling à la carte = $130–490/mo, unintegrated, USD-billed, no CFDI. We offer it integrated, in MXN, one invoice, ~$100. **Confidence the bundle wedge is real: 80%.** Note: MX-specific AI chatbot vendors already exist in both niches (Kosmo 4,497, Neural IA $197, Dentiqa $89–249, VertikaHub, Tecca, CitaBot) — **we win on bundle + price + quality, not novelty.**

---

## 3. Pricing Architecture

- **Core bundle — flat `1,990 MXN/mes` (salons)** — dead-simple, the hero offer; the 3 core services. This is the right call (Robert's instinct + commodity components shouldn't be sold à la carte).
- **Dental tier — `~3,990–5,990 MXN/mes`** (on expansion) — dental clears MXN 4,000–8,000; reviews co-headline. (Corrects an earlier overestimate: typical MX clinic marketing spend is ~$440–1,950 USD/mo, NOT $2,000–5,000.)
- **NO heavy à la carte.** The individual core services are commoditized; selling "reminders only" competes with free and invites price-shopping. Keep one bundle + add-ons.
- **Add-ons / upsells / cross-sells:** marketing messaging (metered), website chatbot, SEO/competitor report, voice agent (premium).

**Open:** exact add-on prices; whether a sub-1,990 micro entry rung is needed (test via outreach); final dental tier price.

---

## 4. Build vs. Buy — BUILD (Meta Cloud API direct)

- **BSP (Business Solution Provider)** = Twilio / 360dialog / Wati / Gupshup — resell Meta access via their pre-approved app + dashboard. Faster, but per-message markup / platform fee + lock-in.
- **Build (our path)** = own Meta app + direct Cloud API. The custom app already in Meta approval IS this path. Cheapest, full control. **Stay the course — confidence 90%.**
- BSP only as a **temporary bridge** if Meta approval drags.

---

## 5. Positioning & Story

- **Headline = the conversational AI front-desk:** _"Nunca pierdas un mensaje. Agenda mientras duermes."_ Answers FB/IG/WhatsApp DMs instantly, qualifies, quotes, books — the one thing booking apps structurally **cannot** do (they're one-way).
- **`Recepción Digital`** — a digital receptionist who never misses a message. Name now fits the repositioned pitch perfectly.
- **Reminders + reviews = "incluido" bonuses**, not the sale.
- **"Facebook/IG is your storefront"** — 76.8% of MX micro-biz have social presence, only 23.3% own a website.
- **Target the manual tail:** the pitch is "you have _no_ system; here's a done-for-you one that just works," NOT "switch from Booksy."
- **Funding angle (verify):** Jalisco COECyTJAL "Transformación Digital de Jalisco" reimburses SMBs up to **60% / 60,000 MXN**. If monthly SaaS qualifies → "el estado cubre hasta 60%."
- **All ES copy = Mexican Professional Spanish (es-MX).** No Iberian markers.

---

## 6. Niche Selection — DECIDED: salons (beachhead) → dental (expansion)

**Decision (confidence 72%):** Lead with **beauty salons/spas** as the beachhead; expand up-market to **dental clinics** once we have proof + a refined product. The 28%: the unmeasured size of the manual tail (no public penetration survey exists for either niche), and salon churn risk — both cheaply tested by the outreach itself.

### Why there's no clean single winner

Both niches are contested, and the differentiation is **identical** in both (bundle + es-MX quality + handover + done-for-you). Research found every individual capability already exists in MX; the gap is execution (bundle, done-for-you, manual tail), not features.

### The data

| Vertical               | Metro establishments                       | WTP / churn                                     | Incumbent commoditization                                                                                            | Reachability                                                      |
| ---------------------- | ------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Beauty salons/spas** | ~15,000 Jalisco (310k personal-care MX)    | Low WTP, **high churn**, very price-sensitive   | Reminders **free** (Booksy/Fresha/AgendaPro); Fresha also free Google review requests. Messaging is **one-way only** | **High** — owner runs her own IG/DMs                              |
| **Dental clinics**     | ~2,600–2,800 metro (4,707 Jalisco; 74k MX) | **High WTP, low churn**; clears MXN 4,000–8,000 | Reminders **table-stakes** (Dentalink + many dental-AI vendors); Doctoralia owns reviews/booking (MXN 1,740–2,970)   | **Lower** — receptionist operates, owner decides, agencies common |

### Why salons first

- **Reachability dominates early.** The salon _owner_ answers her own DMs — you reach the decision-maker through the exact channel you sell. Dental hides the owner behind a receptionist; growth clinics already have agencies.
- **Cleanest single pitch** — conversational AI is a gap booking apps _structurally_ can't fill (one-way). Salons miss 20–30 DMs/week after hours; 80% of MX salon clients prefer to book via WhatsApp; 60–70% of DMs are repetitive Q's.
- **Volume** — ~15,000 vs ~2,700 = far more at-bats for fast proof.

### Why dental is expansion, not start

- **Better revenue niche** (higher WTP, lower churn; 84% of patients read reviews before choosing → our approval-gate's strongest use case; ~70% of clinics don't respond to reviews). But it's a **harder, slower first sale**, the dental-AI field is **crowded and cheap**, and **NOM-024 health-data compliance** adds friction. Go there with proof + a higher price tier.

### What we deliberately DON'T do

- Don't lead with reminders (commodity in both).
- Don't target already-digitized businesses (on Booksy/Kosmo/Dentalink) — chase the manual tail.
- Don't compete on novelty — compete on bundle + price + es-MX quality + handover.

---

## 7. Decision Trees

### A. Business decisions (our side) — all resolved

1. **Niche** — salons beachhead → dental expansion ✅
2. **Pricing** — flat 1,990 core bundle (salons), no heavy à la carte, add-ons + premium voice ✅; dental tier ~3,990–5,990 on expansion ✅
3. **Bundle contents** — Core 3 in (headline = conversational AI) ✅; voice premium ✅; website-chat + SEO add-ons ✅
4. **Build vs buy** — Build (Cloud API direct) ✅
5. **Marketing-message policy** — utility included, marketing metered add-on ✅

### B. Customer qualification / sign-up tree (salon version)

Cold DM → landing page → **"Diagnóstico gratis"** → qualify & route:

1. ¿Página de Facebook/Instagram activa y recibe mensajes? → conversational assistant (the headline)
2. ¿Se les acumulan mensajes sin contestar / a deshoras? → core pain hook
3. ¿Ya usan una app de citas (Booksy/Fresha)? → **No** = full pitch; **Yes** = position us as the _conversational layer_ they lack (book via DM), not a reminder tool
4. ¿Responden sus reseñas de Google? → review-approval bonus
5. ¿Sitio web? No → Messenger is the storefront. Yes → website-chat upsell
6. Pago: SPEI / OXXO

---

## 8. Go-To-Market Tactics

- **Acquisition:** cold FB/IG DM + WhatsApp → stripped es-MX landing page (**`/salones/`**, LIVE) → free diagnosis → 2-week free trial → paid (SPEI/OXXO).
- **Outreach IS the validation.** Rather than a "call 20 businesses" checklist, the cold campaign measures manual-tail responsiveness directly — every reply/non-reply is data the desk research couldn't provide. Outreach playbook (DM sequence + objection bank + go-live checklist): `docs/outreach/salones-outreach-es.md`.
- **Repositioned pitch:** lead with "nunca pierdas un mensaje / agenda mientras duermes"; reminders + review-approval as included bonuses.
- **Landing pages:** stripped, standalone, es-MX, single WhatsApp CTA, `noindex` + sitemap-excluded (protects Ahrefs score). Built via reusable `src/layouts/LandingLayout.astro` (dental LP reuses it). First page LIVE: `/salones/` (`Recepción Digital`, headline = conversational AI).
- **Proof engine:** land first salon wins fast → testimonials + before/after → reduce future friction → graduate to dental with case studies in hand.
- **Trial framing:** 2-week free trial, "si no se gana su lugar, nos despedimos como amigos."

---

## 9. Known Inconsistencies to Resolve

- **Production site still shows old US pricing** ($997/mo bundle, $1,497 voice, $3,500 projects in `home2/FAQ.astro`; dead duplicate in `home/ServicesOverview.astro`). Reconcile once the MX model is locked.
- **Bilingual-parity rule vs. MX-only landing pages:** outreach landing pages are intentionally es-MX-only (not organic SEO) — a deliberate, documented exception.

---

## 10. Open Questions

- [ ] Exact add-on prices; final dental tier price; sub-1,990 micro rung (test via outreach)
- [ ] COECyTJAL grant eligibility for monthly SaaS
- [ ] Live MX WhatsApp marketing per-message rate (verify in WhatsApp Manager)
- [ ] Size of the manual tail in each niche (no public data — outreach will reveal)
- [ ] Confirm product name `Recepción Digital`
- [x] ~~Rebuild landing copy around the conversational-AI headline~~ — DONE: `/salones/` live, headline = "nunca pierdas otra clienta por un mensaje sin contestar"
- [ ] Dental LP (`/clinicas-dentales/`) — reuse `LandingLayout`, reviews co-headline, higher price tier

---

## Source Notes

Research conducted 2026-06-28 via web search. Strongest (government/peer-reviewed): INEGI Censo Económico 2024 & DENUE/DataMéxico; IFT digital-adoption; Banxico SPEI; DataReportal/Statista WhatsApp penetration (~92%); Meta/WhatsApp developer docs. Directional (vendor-grade): clinic/salon behavior, no-show rates, ticket prices, and most competitor pricing (Kosmo, Booksy, Fresha, AgendaPro, Dentalink, Doctoralia, Neural IA, Dentiqa, Leadsales, Whaticket). **Key evidence gap:** no public survey quantifies software-penetration vs. manual operation in either niche — the manual tail is plausibly large but unmeasured; outreach is the validation.
