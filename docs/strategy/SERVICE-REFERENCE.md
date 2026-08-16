# Service Reference — moved

**This document is not maintained here.** It lives in the operating-system repo:

`operating-system/cushlabs/service-reference.md`

## Why it moved

It was authored in both repos on 2026-08-15 — two copies of the same client-facing pricing document,
in two repos, drifting from the moment the second one was saved. `CLAUDE.md` already settles which
one wins: the operating-system owns the content and consuming repos point at it rather than restate
it. That rule exists because a duplicated price is the most expensive kind of drift this project can
produce, and it is invisible until a client reads the stale one.

**This repo is public.** The operating-system is private. That is a second, independent reason the
pricing narrative is not maintained here.

## Where each thing lives now

| What                                                   | Where                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| The bilingual client-facing service reference          | `operating-system/cushlabs/service-reference.md`                                         |
| Internal economics, margins, allotments, selling gates | `operating-system/cushlabs/tier-feature-spec.md`                                         |
| The catalog narrative and pipeline honesty             | `operating-system/strategy/services-packages.md`                                         |
| **The numbers themselves, canonical**                  | `src/components/pricing/PricingSection.astro` and `PricingComparison.astro` in this repo |

The page owns the numbers; the operating-system owns everything said about them. When a price
changes: this repo's pricing components first, then the spec, then the service reference — same day,
in that order.

## What must not happen here

Do not restore the full document to this path, and do not paste tier prices, allotments, or
per-message rates into any other doc in this repo as a convenience copy. If a document here needs to
state a price, it states the number and the spec's version date — never "see X for pricing," and
never a second narrative describing the same product.
