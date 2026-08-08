# Repo Purpose & Ecosystem Map

> **You are here:** `cushlabs` — the **selling surface**. This is the public marketing and
> portfolio site at `cushlabs.ai`. Nothing a customer talks to runs here.

_Created 2026-08-07. Modeled on `cushlabs-messenger-bot/docs/REPO_PURPOSE.md`, which is the
original. The ecosystem table there is shared verbatim across three repos; **this file is
deliberately not a clone of it** — it maps the family from the selling side, the same way
`cushlabs-whatsapp` maps it from the Meta/WhatsApp side. Do not sync the tables._

## What this repo is

The public CushLabs presence: Astro 6 static site, Tailwind 4, deployed on Vercel, fully
bilingual EN / es-MX with `/es/` routing. It carries the pricing, the service pages, the
portfolio, the legal pages, and the gated demo wrappers a prospect actually clicks.

**Its job is to describe capabilities the other repos build.** Every claim on these pages is a
promise some other repo has to keep.

## What this repo is NOT

- **Not a runtime.** No bot, no voice agent, no webhook, no client conversation happens here.
  The one exception is `api/` (two Vercel edge functions: `consultation-intake.ts` and
  `demo.ts`, the demo gate) — supporting the site, not serving a product.
- **Not a source of truth for platform approval state.** See the claims contract below.
- **Not where product decisions get recorded.** Ops model, feature inventories, and
  architecture live in the owning product repo.

## Where it sits in the family

This repo **sells**; the others **build**. It is a consumer of their state, never a producer of it.

| Repo                        | What it is                                                   | How it reaches this repo                    |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| **cushlabs-messenger-bot**  | Live multi-tenant Messenger engine (`messenger.cushlabs.ai`) | `/messenger-assistant/`, demo wrappers      |
| **cushlabs-messenger**      | Client onboarding survey / intake side of that platform      | Described as a feature, not its own product |
| **cushlabs-whatsapp**       | Single-tenant WhatsApp in production (NY English reminders)  | Capability claims only                      |
| **cushlabs-connect**        | Multi-tenant WhatsApp on the Tech Provider model             | Capability claims only                      |
| **cushlabs-marketsignal**   | Rankings / reviews / reputation product                      | Tier features, portfolio card               |
| **cushlabs-ai-voice-agent** | Inbound voice agent (`voice.cushlabs.ai`)                    | `/voice-agent/`                             |
| **operating-system**        | Owns the capability registry and the accomplishment record   | Governs what may be claimed here            |

Sibling repos beyond these surface here only as portfolio entries.

## The claims contract — the thing this repo gets wrong

Two canonical files govern what these pages may say:

- **`operating-system/cushlabs/capability-registry.json`** — platform approval state. Rule R4:
  _"A repo doc that restates an approval status in prose is a bug."_ That applies to this file.
  Ask the registry: `node operating-system/scripts/validate-capability-registry.mjs`
- **`docs/strategy/ADVERTISED-COMMITMENTS.md`** — the marketing↔product bridge. Marketing owns
  price and promise; the product repo owns feature reality; drift between them is a P0.

### Failure mode 1 — overclaiming

Selling something that does not exist. Recent instance: `ADVERTISED-COMMITMENTS.md` §2.2 said
USD customers pay by **card**; card processing is not live in any currency (corrected 2026-08-06,
after the live site had been right for weeks and the doc had been wrong).

### Failure mode 2 — underclaiming, which is the one that costs money

**Do not read a single registry field as a verdict on whether a capability works.**
`status` and `reachable_by` answer different questions, and `reachable_by` is scoped to _one
approval_, not to a product line — registry rule R2: _"The unit of record is ONE approval.
Holding one approval implies nothing about any other, even from the same vendor."_

The live example, and the reason this section exists: the registry holds **exactly one WhatsApp
row**, `meta-connect-whatsapp-advanced-access`, and it is scoped to `cushlabs-connect` —
multi-tenant, clients bringing their own WABA. Its `reachable_by` value is a statement about
**self-serve onboarding by an outside business**, nothing more. It is not a statement about
whether WhatsApp messaging functions, and the single-tenant production system in
`cushlabs-whatsapp` — the one sending NY English's reminders — **has no row in the registry at
all**. Anyone who searches the registry for "WhatsApp," finds one row, and reads its
`reachable_by` as the answer will conclude the opposite of the truth.

That entry's own notes call it _"the canonical underclaiming incident and the reason this
registry exists"_ — it sat un-propagated for 11 days while this repo advertised WhatsApp as held
"until Meta approves." **Repeating the incident by misreading the corrected entry is the same
error wearing different clothes.**

**The rule:** before writing or removing a capability claim here, ask _which approval, for which
tenancy model, in which repo_. If the answer is about a running system rather than a platform
grant, the registry may be silent — go to the owning repo.

## What this repo owns in the demo-page factory

A demo store is a fictitious, honestly-labeled business used to show a prospect what a bot does.
The pieces are split deliberately:

| Piece                                   | Repo                     | Where                                      |
| --------------------------------------- | ------------------------ | ------------------------------------------ |
| FB page + AI agent + provisioning       | `cushlabs-messenger-bot` | `scripts/demo-factory/`                    |
| **The gated wrapper a prospect clicks** | **this repo**            | `demos/<company>/`, gated by `api/demo.ts` |
| Voice-profile survey for a real client  | `cushlabs-messenger`     | the onboarding questionnaire               |

Current wrappers: `azucar`, `latiendita`, `lumiere`, plus `_template`.

**Anything under `demos/` is client-confidential until gated.** An ungated copy of a paying
client's proposal was publicly reachable at `/azucar/` until 2026-08-05 (tech debt #6). Gate
first, publish never.

## What this repo owns in the portfolio pipeline

The portfolio publishes _other_ repos. Since PR #222 it is **opt-in**: a sibling repo with no
`PORTFOLIO.md` is not published, and skipped names print on every sync run. Do not "fix" this by
excluding private repos — 10 of the published projects are private on purpose.

Full pipeline, thumbnail resolution chain, and the silent-YAML-corruption failure mode:
`CLAUDE.md` → "Portfolio Pipeline."

## Keeping this doc honest

- **Structure and ownership only.** The moment this file states an approval status, a price, or a
  feature list, it has become a competing record — delete the line and point instead.
- Update it the same day a repo is renamed, re-homed, or changes role. `cushlabs-nye` kept its old
  name in the messenger-bot copy of this doc for two months after being renamed
  `cushlabs-whatsapp`; that is the failure this rule exists to prevent.
- Deeper docs stay where they are: `CLAUDE.md` for architecture and the portfolio pipeline,
  `docs/SESSION_LOG.md` for state and tech debt, `docs/AI-ASSISTANT-ONBOARDING.md` for what
  CushLabs sells before any sales work.
