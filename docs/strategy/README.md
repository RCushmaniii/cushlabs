# docs/strategy — what lives here, and what does not

**This repo is PUBLIC.** Strategy, pricing internals, cost structure, and anything naming a prospect
belong in the private `operating-system` repo, not here.

## Still here, on purpose

| File                                   | Why it stays                                                                                                                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADVERTISED-COMMITMENTS.md`            | The claims boundary. Cited by five source comments in `src/` and read by `cushlabs-messenger-bot`. Scanned 2026-08-15 and clean — no floor prices, no thresholds, no margin figures. Its Meta rate-card numbers are Meta's own published pricing. |
| `BLOG-HYBRID-ARCHITECTURE-PROPOSAL.md` | Technical architecture for the blog content model. Not strategy.                                                                                                                                                                                  |
| `SERVICE-REFERENCE.md`                 | A pointer to `operating-system/cushlabs/service-reference.md`.                                                                                                                                                                                    |

## Moved out 2026-08-15 → `operating-system/strategy/from-marketing-site/`

`MEXICO-GTM-STRATEGY.md` · `PRODUCT-AND-PRICING-SUMMARY.md` · `US-ESTETICA-BILINGUAL-WEDGE.md` ·
`MESSENGER-PREMIUM-UPGRADES-HELD.md` · `CushLabs-Product-Pricing-Summary.pdf` ·
`../SERVICES-STRATEGY-2026-03-30.md` · all of `../dispatch/`

They carried cost structure, margin projections, a negotiating floor, and — in
`dispatch/prospects/` — a named prospect pipeline with real executives, titles, and priority
rankings. See that directory's README for the specifics.

## The rule going forward

Before adding a document here, ask what it would cost if a prospect or a competitor read it. If the
answer is anything, it goes in `operating-system`. Prices a client is quoted are public by
definition; the reasoning behind them is not, and neither is anyone's name.
