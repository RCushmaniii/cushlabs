# WhatsApp marketing — researched, decided, and deliberately NOT published yet

> **Status:** held, not rejected. Prepared 2026-09-19 from live verification against Meta's
> documentation, the capability registry, and production analytics.
>
> **Why this file exists:** the research below is good and the decision was to wait. Research that
> lives only in a chat transcript is research that gets redone, or worse, half-remembered. This
> file holds the material, the reasoning for holding it, and the trigger that releases it.
>
> **Authority order, unchanged:** [`ADVERTISED-COMMITMENTS.md`](./ADVERTISED-COMMITMENTS.md) §2.4,
> §2.5 (cost language) and §2.6 govern what may be said. `operating-system/cushlabs/claims-policy.json`
> governs how. Nothing in this file overrides either, and nothing here is approved copy — it is
> source material. **Route all wording through the `copywriting` skill.**

---

## The release trigger, stated once

**Publish §1 and §2 below on the day the WhatsApp customer assistant leaves the "Coming" pill.**

Not before. Both sections explain the pricing mechanics of a product nobody can buy yet. Published
early they invite "so when can I have it?" — and there is no date to give, by design. Published at
launch they are strong launch material.

Decision: Robert, 2026-09-19, on the recommendation to hold. Confidence hold is correct: 85%. The
15% is a live proposal — if WhatsApp is being quoted to a named prospect, the October change below
belongs in **that proposal** so it is not a surprise on their first invoice. A proposal is not the
website.

---

## 1. HELD — Free Entry Point: 72 free hours, and October does not touch it

If a customer reaches the business through a **Click-to-WhatsApp ad** or a **Facebook Page
call-to-action button**, from the **Android or iOS app**, and the business responds within 24
hours, a Free Entry Point window opens for **72 hours**. Messages inside it are free, and Meta
states this is **explicitly unchanged** by the October 2026 pricing update.

**Desktop and web are not supported.** The customer must be on the mobile app. Any copy that omits
this is wrong.

**Why it is worth publishing at launch:** it connects paid acquisition to messaging cost. A
business routing inbound through click-to-WhatsApp ads gets three days of free conversation per
customer — which is a concrete reason both to run the ad and to have an assistant ready to answer
inside 24 hours. That is precisely the pairing CushLabs sells. Pair it with the ads offering
rather than presenting it alone.

---

## 2. HELD — the October 1, 2026 change, and how to frame it

**What changes on 2026-10-01**

- **Service messages** — a non-template reply inside an open 24-hour window — start being charged.
  Free since November 2024.
- **Utility templates sent inside an open 24-hour window** start being charged. Free since July 2025.

**What does not change**

- Inbound messages from customers remain free. Always.
- The 72-hour Free Entry Point window (§1) is explicitly unaffected.
- Marketing, utility and authentication rates **outside** a window are unaffected.

**Who it affects:** clients sending on their own account. CushLabs' own exposure is negligible and
was measured — six messages in ninety days move from free to charged.

**The framing, in substance rather than as copy:** this is Meta's price change, on Meta's invoice,
applying to every provider equally. What changes for the client is that assistant replies now carry
a per-message cost, which is why template categorization (§3) matters more from October than it did
before. That work is included in the plan.

**Do not build any copy on batching replies inside a service window.** That saving dies on
2026-10-01 and any page built on it becomes wrong that day.

---

## 3. PUBLISHED 2026-09-19 — template category economics

Live on the pricing comparison FAQ, EN and ES. Recorded here because the enforcement detail behind
it is internal and must not be lost.

**The mechanism.** Meta assigns a template's category from its **content**, not its label. Marketing
costs roughly **3.5×** utility. Utility and authentication earn volume discounts at scale; marketing
and service never do. A template with **mixed** content is categorized as marketing — Meta's own
examples are "an order update with a promo" and "a feedback survey with promotional content". A
template whose content is unclear (a body that is only `{{1}}`, or just "Congratulations!") is also
categorized as marketing.

**The part businesses never see coming.** Meta re-categorizes **already-approved** templates on
**one day's notice**. Status stays APPROVED and the template keeps sending — it just costs 3.5×
more from the next day. A small business finds out from the invoice.

**Detectable in advance.** Comparing a template's `category` against its `correct_category` exposes
a pending flip _before_ it lands; the change takes effect on the first day of the following month.
That is the basis of a real advisory service — CushLabs can warn a client a month ahead.

**Legitimate utility objectives, per Meta:** opt-in management, order management, account alerts and
updates, feedback surveys, and continuing a conversation on WhatsApp.

### The guardrail — internal detail behind the published promise

**Never offer, imply, or hint at getting marketing content classified as utility.** The published
FAQ says so; this is the enforcement ladder it is based on:

| Stage           | Consequence                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Warning         | Category changes become instant, with no notice                                                      |
| Rate limiting   | Utility volume capped in a rolling 24h window, messages rejected, 7 days minimum                     |
| Restriction     | ALL approved utility templates forced to marketing, no new utility templates, 7 days (30 for repeat) |
| Portfolio level | The same, across every WhatsApp account in the client's business portfolio, 30 days                  |

**The account that gets restricted is the CLIENT'S. The blame is CushLabs'.** The honest service is
writing genuinely transactional messages well and catching Meta's reclassifications early. Gaming
the classifier is not a service, it is a liability.

---

## 4. HELD — the competitive economics fact, from October onward

Meta charges two different prices for answering the same customer question:

- A reply from **Meta's own Business Agent** is charged **per token**, which Meta puts at roughly
  4–5 US cents per message.
- A reply from a **third-party AI** (CushLabs) is charged as a **service message** — the same
  per-message rate as utility.

Meta publishes its own cost comparison for 10,000 AI-powered replies: a lower-complexity
third-party AI solution comes out around **$268** against roughly **$400–500** for Meta Business
Agent. **That is Meta's published figure, not a CushLabs estimate**, which is what makes it usable.

Meta's one-charge rule guarantees a message is charged as one category or the other, never both.

**Use it as an ECONOMICS fact only.** Do not extend it into any claim about answer quality — that is
not what the table measures, and `claims-policy.json` will reject it.

---

## 5. Things that must never be said about WhatsApp

Carried here in full because it is the fastest thing to check a draft against.

- "Includes N WhatsApp messages" / "incluye N mensajes"
- Any overage rate, or any per-message price charged by CushLabs
- **"At no extra cost" / "sin costo extra"**, in any tense, for any WhatsApp product. Approved
  forms only: _"with no increase in your monthly plan price"_ / _"sin aumento en tu mensualidad."_
  (This ban is scoped to channels. "CFDI at no extra cost" is a different, true claim and is fine.)
- Any date for the customer assistant, utility notifications, or campaigns
- Any statement of Meta approval status — the capability registry owns that
- "Unlimited" anything on an AI assistant
- Any offer to classify marketing content as utility
- Facebook comment-to-DM as a written commitment — flagged `do_not_advertise`; demo it, never write it
- A named client's story as proof, in any form

---

## 6. What was checked and found already correct

Recorded so the next session does not redo it.

- **The removal list needed no work.** The site carries no CushLabs per-message price and no message
  overage, in either language. "Billed by Meta at their rate" and "we never add anything on top of
  it" were already live. §2.6's 2026-08-22 correction had fully propagated to the site.
- **The only published overage is Voice**, at $8.50 MXN/min. That is CushLabs' own cost and is
  legitimately chargeable. It is not implicated by any of this.
- **The four-product disambiguation FAQ already exists** on the pricing comparison, both languages.

---

## 7. Sources — all read live 2026-09-19

Tech Provider vs Solution Partner billing:
https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview

Pricing, rate cards, volume tiers, pricing calendar, Free Entry Point:
https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing

The October 1 change and the Meta Business Agent cost comparison:
https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages

Template categorization, mixed content, re-categorization notice, enforcement ladder:
https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization

> **Trap recorded for whoever checks pricing next:** the general `/whatsapp/pricing` page still
> reads as though service messages are free and never mentions the October change. Reading the
> parent page alone produces a confidently wrong answer — it already did once. **Use the
> non-template-messages child page.**

Internal, for the state this file must never restate:
`operating-system/cushlabs/capability-registry.json` ·
`operating-system/cushlabs/tier-feature-spec.md` §3, §4, §4.0, §4.1 ·
`operating-system/cushlabs/commercial-terms.json` · `operating-system/cushlabs/claims-policy.json`
