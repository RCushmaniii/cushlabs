# US Estéticas — the bilingual-wedge extension

> **Scope:** This is a **scoped extension** of the MX-first strategy, not a reversal
> of it. `MEXICO-GTM-STRATEGY.md` §0 remains in force (MX-first; the prior
> US-oriented model stays superseded). This doc defines how — and only how — we
> open a US front **without** contradicting that, by riding the one US angle the
> strategy already endorses: the bilingual wedge.
>
> _Created 2026-07-25._

## The thesis

Our #1 decided beachhead vertical is **beauty / salons / medspas** (`MEXICO-GTM-STRATEGY.md`
§6). Our documented US angle is the **bilingual wedge** (`GTM_OUTLINE.md` §3): US
businesses that serve Spanish-speaking customers and can't staff bilingual coverage.

**US Estéticas sit exactly at that intersection.** US medspas, aesthetic clinics,
and salons are heavily Latina-owned and serve bilingual clientele. So a single
**bilingual EN + es-MX** medspa asset serves three goals at once:

1. the **US-market** ask (English-first face),
2. the **bilingual wedge** (the one US angle the strategy blesses), and
3. the **Mexican beachhead** (the same vertical, same asset, es-MX toggle).

One asset, three markets. This deepens the core vertical rather than diverging
from it — which is why it is on-strategy despite being US-facing.

## Where it maps in the product

- **Tier fit = Ultra ("clinic / medspa" tier).** Medspas are higher-WTP and often
  already digitized. The pitch skews to Ultra: the AI front desk (Messenger) +
  **AI Voice Agent** for inbound call capture + the weekly reputation/reviews
  report (MarketSignal). See `PRODUCT-AND-PRICING-SUMMARY.md`. USD anchors
  $129 / $229 / $349, **independently anchored — never converted from MXN.**
- **Combined offer:** Messenger bot handles the _conversation_ (DMs, comment→DM,
  after-hours lead capture, owner alerts); MarketSignal handles the _intelligence_
  (Google rank vs. competitor medspas, review velocity, AI-drafted review replies).
  Reviews matter disproportionately in aesthetics — "84% read reviews before
  choosing" (`MEXICO-GTM-STRATEGY.md` §6).
- **Existing English seed:** the med-spa Voice demo "Sophia" (`voice-cushlabs-ai-briefing.md`)
  already proves an English medspa persona.

## The flagship demo asset

**Lumière Medspa (Demo)** — a fictitious, honestly-labeled US bilingual medspa
(Austin, TX), built with the config-driven demo factory in
`cushlabs-messenger-bot/scripts/demo-factory/` (tenant `lumiere-demo`). Its gated
client-facing wrapper lives here:

- Preview hub (live "chat with Camila"): `cushlabs/demos/lumiere/preview.html`
- Sales proposal (Ultra-tier framing): `cushlabs/demos/lumiere/proposal.html`

Served gated via `api/demo.ts` (company slug `lumiere`). This is a **showcase to
many** US medspa prospects, not a single-client proposal.

## The gate — what is NOT yet cleared (do not skip)

Building and sending these demos requires nothing new. **Invoicing a US client
does.** Two prerequisites are unmet and tracked as
`cushlabs-messenger-bot/docs/TECH_DEBT.md` #15:

1. **US business entity** — the US LLC forms "on first American/USD client"
   (`cushlabs-messenger-bot/docs/BILLING.md`). No entity exists yet; USD invoicing
   and tax handling depend on it.
2. **US medical-advertising compliance** — US medspas advertise medical procedures
   (Botox, lasers, peels) that require licensed physician oversight. Our es-MX
   guardrails do not cover US norms (FTC substantiation, state medical-board
   advertising rules, "results not typical" conventions). Any real medspa client's
   bot copy and claims must be reviewed against these before go-live.

**Rule:** demos and outreach are green now; the moment a US medspa says "yes,"
those two gates promote to blocking. Surface them at that point, not after.

## Still net-new (deferred)

- An **English salon/estética landing page** + outreach script (all current
  outreach assets — `docs/outreach/salones-outreach-es.md`, `cushlabs.ai/salones/`
  — are es-MX only).
- Re-validating the channel thesis for the US (US medspas may run through a
  receptionist or Booksy/Fresha, unlike the MX owner-answers-own-DMs assumption).
