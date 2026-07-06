# Messenger Assistant — Premium Upgrades (HELD, do NOT publish)

**Status:** Internal only. Not published on `/messenger-assistant/` or anywhere public.
**Created:** 2026-07-06
**Source of truth:** `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\docs\FEATURE-INVENTORY.md`

---

## Why this is held

The public `/messenger-assistant/` page was restructured (2026-07-06) so that **everything it
claims is live in production today** — every point maps to **List 1** (ENABLED) in
FEATURE-INVENTORY.md, running on the two demo bots (`m.me/cushlabs`, `m.me/nyenglishteacher`).

This document is the parking lot for the "premium upgrades you can turn on" marketing copy.
It stays **off the public site** until each item is (a) actually built and (b) mapped into the
locked 3-tier pricing model. **Do not** publish these as à-la-carte add-ons — that conflicts with
the tiered no-à-la-carte pricing decision. When one ships, fold it into Basic / Premium / Ultra,
not into a separate menu.

**Promotion trigger:** an item moves from this doc onto the live page only when it is enabled in
production (promoted from List 2 → List 1 in FEATURE-INVENTORY.md) AND assigned to a pricing tier.

---

## Classification

Every premium item is currently **List 2** (NOT enabled) in FEATURE-INVENTORY.md. Split by how
much work stands between "today" and "sellable":

### (a) Deliverable today

_None._ Everything deliverable today is already on the live page (List 1). By definition nothing
in the premium bucket is shippable without new work.

### (b) Buildable on request (shovel-ready — code paths exist, need wiring/UI)

These are the honest near-term upsells. They are **not live**, but the groundwork is in the codebase.

| Upgrade                        | What it adds                                                            | What's left to build                                            |
| ------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| Instant operator alert webhook | Owner gets a real-time push (WhatsApp/webhook) the moment a lead is hot | Wire the dormant handover-alert path to a real webhook endpoint |
| Self-serve content edit UI     | Client edits their own hard facts (hours/prices) via an admin form      | Build the admin edit-form UI on top of the existing admin API   |

> Note: "optional owner alerts" already appears on the live page under theme 3 — worded as
> _optional_ precisely because the alert path is wired but dormant. That wording is accurate.
> The **premium** version is turning it into a productized, self-serve, always-on alert channel.

### (c) Roadmap (not started / platform-gated)

Genuine future work — several gated on Meta platform approvals. **Never imply these are available.**

- Ad / click-to-Messenger referral personalization (entry-point aware greetings)
- One-Time Notifications & Recurring Notifications (re-engagement messaging)
- Native Meta lead-gen form + CSAT survey blocks
- In-chat webview booking (book inside Messenger, no redirect)
- Message reactions, read/delivery receipts, `mark_seen`
- Message tags / `HUMAN_AGENT` extended messaging window
- Audio / video / file message handling
- OAuth multi-page picker (connect several pages in one flow)
- Page insights + comment management
- **WhatsApp Business Platform** (the big one — full WhatsApp channel, separate Meta approval)

---

## Copy parking lot (raw, unpolished — do not ship as-is)

The marketing doc Robert supplied framed these as "premium upgrades you turn on." Preserved here
verbatim-ish for when they're real. Rework into tier language before any of it goes public.

- "Turn on WhatsApp too — same assistant, same brain, now answering on WhatsApp."
- "Re-engage customers who went quiet with a single tap (Meta-approved notifications)."
- "Let customers book right inside the chat — no redirect, no friction."
- "Connect all your Facebook pages at once."

---

## Cross-references

- `C:\Users\Robert Cushman\Projects\cushlabs-messenger-bot\docs\FEATURE-INVENTORY.md` — List 1 (live) vs List 2 (roadmap), the authority
- `docs/strategy/MEXICO-GTM-STRATEGY.md` — pricing tiers (Basic / Premium / Ultra), the model these upgrades must map into
- `src/pages/messenger-assistant.astro` + `src/pages/es/messenger-assistant.astro` — the live page, List 1 only
