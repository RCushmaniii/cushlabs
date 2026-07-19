# Local Business Site Template — Field Guide

A bilingual (ES / es-MX default + EN), self-contained one-page site for a neighborhood business — WhatsApp ordering, hours, offerings, delivery/signature strength, real reviews, map. Built to be filled in **~10 minutes** per prospect and published as a Claude Artifact.

- **Template:** [`site.starter.html`](site.starter.html)
- **Worked example (live):** La Tiendita de Guadalajara — https://claude.ai/code/artifact/aba3e3a2-d29e-4d67-a06a-78417738b61c
- **Matching proposal template:** the La Tiendita proposal — https://claude.ai/code/artifact/00471e63-5d83-4471-9896-ade432681c80

---

## Quick start (new site in ~10 min)

1. Copy `site.starter.html` to a new file.
2. **Replace every `{{TOKEN}}`** (table below) — mechanical find-and-replace.
3. **Rewrite the copy** inside each `<!-- ✏️ CUSTOMIZE -->` block for the business (hero, 3 order steps, 6 categories, delivery highlight, 3 reviews).
4. **Swap the palette** in `:root` (presets below) if it's not a warm _abarrotes_-style shop.
5. **Paste the photo** as a WebP data URI for `{{PHOTO_DATA_URI}}` (recipe below).
6. Publish as an Artifact. Done.

---

## Mechanical tokens (find & replace)

| Token                | What it is                                                                        | La Tiendita example                                                     |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `{{BUSINESS_NAME}}`  | Full name (header, footer, alt text, `<title>`)                                   | `La Tiendita de Guadalajara`                                            |
| `{{SHORT_NAME}}`     | Short name (logo, casual mentions)                                                | `La Tiendita`                                                           |
| `{{PHONE_DISPLAY}}`  | Phone as **shown on the page**, local format, **no country code**                 | `33 3502 5245`                                                          |
| `{{WHATSAPP_FULL}}`  | WhatsApp number for the `wa.me/` link — **full, incl. country code, digits only** | `523335025245`                                                          |
| `{{WA_MSG_ENCODED}}` | Pre-filled WhatsApp message, **URL-encoded**                                      | `Hola%2C%20quiero%20hacer%20un%20pedido%20a%20domicilio%20%F0%9F%9B%B5` |
| `{{ADDRESS_1}}`      | Street + number                                                                   | `San Bonifacio 447`                                                     |
| `{{ADDRESS_2}}`      | Neighborhood, ZIP, city, state                                                    | `Vallarta Sur, 44500 Guadalajara, Jal.`                                 |
| `{{MAPS_QUERY}}`     | Google Maps search string, `+` between words                                      | `La+Tiendita+de+Guadalajara+San+Bonifacio+447+Vallarta+Sur`             |
| `{{RATING}}`         | Google star rating                                                                | `4.6`                                                                   |
| `{{REVIEW_COUNT}}`   | Number of reviews                                                                 | `44`                                                                    |
| `{{HOURS_TIME}}`     | Daily hours string (both hours-table rows)                                        | `7:00 – 23:30`                                                          |
| `{{PHOTO_DATA_URI}}` | Storefront/hero photo as a WebP data URI (recipe below)                           | `data:image/webp;base64,…`                                              |

> **The WhatsApp rule:** the `wa.me/` link always needs the **full** number with country code (`52` for Mexico), but the number **displayed** to customers should be the **local** format (no `+52`) — Robert's call, and it reads more natural to a local. That's why there are two separate tokens.

---

## Copy to rewrite (the `<!-- ✏️ CUSTOMIZE -->` blocks)

These aren't mechanical — write them fresh for each business, in **Mexican Professional Spanish** + EN:

- **Hero** — headline (put the emphasis phrase after a `<em>`; keep it short) + one-sentence subhead + the "Abierto hoy" line.
- **3 order steps** — how a customer orders from _this_ business (a salon books, a taquería takes a food order, etc.).
- **6 category cards** — what they sell/offer, one line each. Pick an icon per card from the built-in set (see below).
- **Delivery block** — this is the "signature strength" slot. For a store it's delivery ("10/10"); for a salon it might be "walk-ins welcome"; for a clinic, "same-day appointments." Swap the big number/stat to match.
- **3 reviews** — paste **real** Google/Facebook reviews (text + author). Real quotes convert; don't invent them.
- **Visit** — address rows, hours table, parking/payment line.

### Built-in category icons

The template ships inline SVG icons (bag/groceries, produce, bread+coffee, bottle, pharmacy cross, storefront). To reuse one, copy its `<svg>…</svg>` from another `.cat`. Add more from [Lucide](https://lucide.dev) — paste the raw SVG path, keep `stroke="currentColor"`. **Never** use emoji or HTML-entity glyphs as icons (CushLabs standard).

---

## Palette presets

Swap these in the `:root { … }` block (and mirror the accent hues in the dark-theme block). The three accents to change are `--rojo` (primary), `--maiz` (secondary), `--nopal` (success/green), plus `--paper` ground.

```
/* Tienda / abarrotes (default) */
--paper:#faf3e2; --rojo:#d33a2c; --maiz:#dd9612; --nopal:#4a8b3a;

/* Taquería / restaurant — warm, appetite */
--paper:#fbf1e6; --rojo:#b5271f; --maiz:#e0912a; --nopal:#5a7d34;

/* Salón / belleza — soft, premium */
--paper:#fbf2f3; --rojo:#c85486; --maiz:#c69a45; --nopal:#7a9a72;

/* Farmacia / clínica — clean, trusted */
--paper:#f2f7f5; --rojo:#1f8a6e; --maiz:#2f6fb0; --nopal:#2f9e7a;

/* Café / panadería — cozy, earthy */
--paper:#f7efe3; --rojo:#7a4a26; --maiz:#c8892f; --nopal:#6a7d3a;
```

Keep `--wa` (WhatsApp green `#25a95a`) as-is — it should always read as WhatsApp.

---

## Photo recipe (storefront → WebP data URI)

Any square-ish photo works as the hero/logo. To turn a screenshot or profile pic into an embeddable WebP data URI (Python + Pillow):

```python
from PIL import Image
import base64
im = Image.open("photo.png").convert("RGB")
im = im.crop((L, T, R, B))          # crop to the storefront/subject
im = im.resize((480, 360), Image.LANCZOS)  # hero ~4:3; a logo can be square
im.save("out.webp", "WEBP", quality=82, method=6)
print("data:image/webp;base64," + base64.b64encode(open("out.webp","rb").read()).decode())
```

Paste the printed string in for `{{PHOTO_DATA_URI}}`. Keep it under ~60 KB so the whole file stays light. For a **transparent** logo/wordmark (blue-on-white sign → transparent PNG), see the flood-fill / alpha-from-whiteness recipe used for the Azúcar wordmark.

---

## Notes

- **Self-contained:** all CSS/JS/images are inline — the Artifact CSP blocks external hosts, so no CDN links, no remote images.
- **Bilingual:** every visible string has a `.lang-es` / `.lang-en` pair; the toggle in the header flips them. ES is default.
- **Footer** says "Sitio de demostración" so a demo can't be mistaken for the client's official live site — remove that line once it's a real paid deployment.
- **Verify the WhatsApp number is actually on WhatsApp** before sending the link to a prospect (a dead number kills the one CTA that matters).
