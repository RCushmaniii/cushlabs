# CushLabs Brand Kit — The Mark

**Version:** 1.1 · **Last updated:** 2026-08-10 · **Status:** Active — supersedes the 3D gradient hexagon (retired)

> **1.1 changes one thing from 1.0:** the brand orange is **`#ff6a3d`**, not `#FD4C00`. See §4.

---

## 1. The One-Liner

> "It's a C for CushLabs, with a prompt inside — because that's where everything we build starts."

That's the whole story. Use it if someone asks. Otherwise, let the mark speak.

---

## 2. The Story

### What it is

A hexagon rendered as an open ring, forming a C. Inside the opening sits a chevron — `>` — breaking
cleanly through the right edge of the ring. Two shapes, two colors, no gradients, no glow.

### What it means

Four layers. Most people register the first in half a second and never consciously process the
rest — which is the intent.

1. **The C** — identity. CushLabs. The primary read, doing the recognition work.
2. **The chevron** — the prompt. `>` is the command line, the terminal cursor, the universal signal
   for _code runs here_. For a practice where the person selling the work is the person writing it,
   this is the most honest symbol available. It says builder, not broker.
3. **Forward motion** — delivery. The chevron points right and breaks through the ring rather than
   sitting politely inside it. Things move. Things ship. The mark isn't contained, it's exiting.
4. **The send echo** — automation. For anyone who lives in WhatsApp and Messenger, the chevron
   carries a faint familiarity with the send glyph. Deliberately faint. It rewards recognition
   without being spelled out.

**The container** — a hexagon is a built shape, not a drawn one. It signals structure and precision,
and does its job by not calling attention to itself.

### Why the shapes are what they are

- **Straight edges, no curves.** An earlier version used a swooping arrow with concave inner curves.
  It looked good large and disintegrated at favicon size — the thin tapered tails vanished below
  32px. The chevron's straight edges survive every size that matters, plus print, vinyl and
  embroidery. Durability was a design constraint, not an afterthought.
- **The ring is open, not closed.** A closed hexagon is a badge. An open one is a letter. The gap is
  what makes it a C.
- **The chevron overhangs the ring.** Intentional tension. Fully contained reads static; breaking the
  boundary creates forward energy.

### Why orange

The AI industry is a sea of blue and violet gradients. Nearly every model provider, tooling startup
and consultancy defaults to the same cool palette — which means none of them own a color.

Orange is an ownable asset: warm where the category is cold, high-contrast where the category is
soft, confident without being loud. Paired with near-black and white it's a three-value system that
works on a business card, a browser tab and a projected slide with equal force.

**The rule: one color, used relentlessly.** Consistency will build more recognition over two years
than any redesign.

### What we deliberately avoided

Every category cliché: neural network nodes, circuit traces, brain silhouettes, sparkles, isometric
cubes, gradient meshes. A logo that tries to illustrate AI dates itself to the month it was made.
"AI" comes from positioning, copy, typography and the work — never from the glyph.

---

## 3. How to Talk About It

**Public-facing — say nothing.** Website, LinkedIn, proposals, decks, invoices: the mark just
appears. No caption, no "our logo represents…" section. Explained logos are weaker logos. The FedEx
arrow works because nobody at FedEx narrates it. Discovery is the delight.

**If asked directly — one sentence.** Use §1. Stop there.

**Internal — the full four layers**, so future work stays coherent.

### ⚠️ Never position the mark as Meta-related

The send-glyph association is an asset at arm's length and a liability the moment it's stated.

1. CushLabs doesn't own Meta's iconography; implying a partnership that doesn't exist creates legal
   and perception exposure.
2. The brand has to outlive any single platform. As the revenue mix shifts toward RAG, document
   intelligence and full-stack work, a story hard-anchored to WhatsApp becomes a costume that no
   longer fits.
3. A conclusion someone reaches on their own is far stickier than one they're handed.

**The discipline: we say "prompt." We let the market say whatever it sees.**

---

## 4. Technical Specifications

### Color

| Role            | Hex       | RGB           | Usage                          |
| --------------- | --------- | ------------- | ------------------------------ |
| **Cush Orange** | `#ff6a3d` | 255, 106, 61  | Hexagon ring — the brand color |
| Near Black      | `#212120` | 33, 33, 32    | Chevron, on-light variant      |
| Off White       | `#f9f9f9` | 249, 249, 249 | Chevron, on-dark variant       |

> **Why `#ff6a3d` and not `#FD4C00`.** The v1.0 masters were exported at blaze `#FD4C00`, but the
> site has shipped `--color-cush-orange: #ff6a3d` (`src/styles/global.css:11`) across every button,
> link and accent in both languages since launch. Two oranges in one header is the exact failure
> this kit's own "one color, used relentlessly" rule exists to prevent. Robert's call (2026-08-10):
> **the site's orange is canonical, the mark moves to it.** The masters were recoloured by projecting
> each pixel onto the chevron→orange axis, which preserves anti-aliased edges instead of leaving a
> halo of the old color.

The on-dark chevron is `#f9f9f9`, not pure white — invisible as a difference on near-black, slightly
softer contrast on mid-tone backgrounds and photo overlays.

### Files in this repo

| File                                         | Size     | Use                                             |
| -------------------------------------------- | -------- | ----------------------------------------------- |
| `public/images/logo/cushlabs-logo.webp`      | 256²     | Header, footer, landing bar — **light theme**   |
| `public/images/logo/cushlabs-logo-dark.webp` | 256²     | Same surfaces — **dark theme**                  |
| `public/images/logo/cushlabs-logo.png`       | 512²     | Light master for external use                   |
| `public/images/logo/cushlabs-logo-dark.png`  | 512²     | Dark master for external use                    |
| `public/favicon.ico`                         | 16/32/48 | Browser tabs, bookmarks                         |
| `public/favicon-32x32.png`                   | 32²      | Modern browsers                                 |
| `public/favicon-16x16.png`                   | 16²      | Small-tab fallback                              |
| `public/apple-touch-icon.png`                | 180²     | iOS home screen                                 |
| `public/icon-512.png`                        | 512²     | PWA / Android                                   |
| `public/images/og/cushlabs-og.png`           | 1200×630 | Social share card (mark + wordmark, near-black) |

All logo files carry true alpha — the counter-space inside the C is transparent so the background
shows through. **Favicons and touch icons are trimmed to the mark and re-padded ~6%**, so the glyph
fills the tab rather than floating in the master's margin.

**Naming convention:** files are named for the background they go on, not the chevron color.

### Theme switching

The site's dark mode is class-based (`.dark` on `<html>`, see `src/components/ThemeScript.astro`).
Header, Footer and LandingLayout each render **both** variants with `dark:hidden` / `hidden
dark:block`. Both masters share a near-identical bounding box, so the swap causes no position shift.

**Never render the on-light variant on a dark surface** — the near-black chevron disappears.

### Verified minimum sizes

| Size   | Verdict                                     |
| ------ | ------------------------------------------- |
| 220px+ | Full clarity                                |
| 128px  | Clean                                       |
| 64px   | Clean                                       |
| 32px   | Minimum recommended — chevron still legible |
| 16px   | Degrades; chevron crunchy but discernible   |

Don't reproduce below 32px unless the platform forces it. Browser tabs do force it, which is why a
16px frame ships in `favicon.ico`.

### Clear space

Clear space on all sides equal to **half the height of the hexagon**. Nothing inside that zone.

---

## 5. Usage

**On-light:** site header, LinkedIn profile and banner, proposals, invoices, light email signatures,
favicon, print on white stock.

**On-dark:** dark site sections, dark decks, WhatsApp Business profile, social avatars on dark
platforms, dark-mode UI.

**Lockups:** horizontal (mark + "CushLabs" in Space Grotesk, default for headers and signatures) ·
stacked (square formats and print) · icon only (favicon, app icons, avatars, watermarks).

### Do

Use the supplied files unmodified · match the variant to the background · give it room · use it the
same way everywhere, every time.

### Don't

Recolor the hexagon · add drop shadows, glows, bevels, gradients or outlines · rotate, skew, stretch
or squash · put the on-light variant on a dark background · place either variant on a busy photo
without a solid backing shape · reconstruct or redraw it.

---

## 6. Known Gaps and Pitfalls

### ⚠️ These files are raster, not vector

The masters are PNGs. This is the single most important limitation.

- **512px is the ceiling** for the shipped masters (1200px originals exist outside the repo). Fine
  for web, social, email and slides. Not sufficient for large-format print, banners, vehicle wraps
  or vinyl cutting.
- **Not editable.** Any change means regenerating and hoping it matches.
- **Edges are baked in.** Scaling past the master softens them.

### ⚠️ Watch out for the Canva trap

Exporting an uploaded PNG from Canva as "SVG" does **not** vectorize it — Canva wraps the raster in
an SVG container as base64. The file has an `.svg` extension and behaves exactly like a PNG. Pro
unlocks the export button, not tracing. Verify before trusting any SVG:

```powershell
Select-String -Path .\logo.svg -Pattern '<image|base64' -Quiet
```

`True` = wrapped raster. `False` = real vector.

### ⚠️ No mono variant yet

No single-color all-black or all-white version. Needed for one-color printing, embroidery,
engraving, photocopied documents, and partner pages that require a mono mark.

### ⚠️ Trademark clearance is outstanding

No search has been run. Orange hexagon-C constructions exist in the wild. Do this before the mark
goes on contracts, signage, or anything expensive to reverse: USPTO (US), IMPI (Mexico), and a
reverse-image search.

### ⚠️ Hexagon saturation

Hexagons are common in developer tooling. The distinctiveness comes from the negative-space C **plus**
the chevron, not the hexagon alone. If the mark is ever simplified for a tiny context, protect that
relationship — never reduce to a generic hexagon.

---

## 7. Roadmap

| Priority | Item                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| High     | Trademark clearance (USPTO / IMPI / reverse image)                           |
| High     | True vector rebuild — geometry as real paths, ~1–2 KB                        |
| Medium   | Mono variants (all-black, all-white)                                         |
| Medium   | Wordmark lockups in Space Grotesk — horizontal, stacked                      |
| Low      | Animated variant for video and loading states                                |
| ~~Low~~  | ~~Favicon package~~ — **done 2026-08-10**: `.ico` (16/32/48) + 16/32/180/512 |

**On the vector rebuild:** because the mark is pure geometry — a hexagon ring and a chevron — the
right approach is **reconstruction from measurements, not auto-tracing**. Tracers follow
anti-aliased pixel edges and return "straight" lines built from dozens of slightly-off anchor
points. Fine for organic illustration; wrong for a hard-edged geometric mark. Reconstruction yields
mathematically perfect symmetry and a file under 2 KB.

---

## 8. Version History

| Version | Change                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.1** | Brand orange reconciled to the site's `#ff6a3d`; masters recoloured. Favicon package shipped. Dark/light variants wired into Header, Footer and LandingLayout.                                           |
| 1.0     | Chevron mark adopted. On-light and on-dark PNG variants established at `#FD4C00`.                                                                                                                        |
| —       | **Retired:** 3D isometric hexagon in blue/teal/orange gradient. Three competing colors meant owning none; isometric gradient cubes read as dated crypto-era language; didn't survive flattening.         |
| —       | **Rejected:** solid triangle. Reads unavoidably as a play button, pulling the brand toward media/video, and one of the most common icon constructions in existence.                                      |
| —       | **Rejected:** rounded paper-plane arrow. Interior slit measured ~2% of mark width and collapsed below 32px; rounded joints conflicted with the hard-edged hexagon; over-anchored the brand to messaging. |
