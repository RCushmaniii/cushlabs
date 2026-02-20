# Portfolio Metadata Instructions for AI

> Every CushLabs repo that should appear on the portfolio at cushlabs.ai must include a `PORTFOLIO.md` file in the repo root.

---

## What Is `PORTFOLIO.md`?

A markdown file with YAML frontmatter that controls how a project appears on the CushLabs.ai portfolio page. The cushlabs.ai site syncs these files from GitHub to build the portfolio grid and detail pages automatically.

**Why this format:**
- Human-readable for quick edits
- Structured metadata at top (easy to parse with `gray-matter`)
- Standard in JAMstack ecosystems
- GitHub renders it nicely for reference
- Optional markdown body for extended descriptions

---

## Schema

Create `PORTFOLIO.md` in the repo root with this exact structure:

```yaml
---
# === CONTROL FLAGS ===
portfolio_enabled: true             # Set false to hide from portfolio
portfolio_priority: 1               # Lower = higher in list (1, 2, 3..., default 99)
portfolio_featured: false           # Set true for homepage spotlight

# === CARD DISPLAY ===
# What shows in the portfolio grid on /solutions
title: "Project Title"
tagline: "One-line value proposition (max 60 chars)"
slug: "project-slug"                # URL slug for detail page
category: "AI Automation"
tech_stack:
  - "Next.js"
  - "OpenAI"
  - "Supabase"
thumbnail: "/images/portfolio/{slug}-thumb.jpg"
thumbnail_es: "/images/portfolio/{slug}-thumb-es.jpg"  # Only if thumbnail has text
status: "Production"

# === DETAIL PAGE ===
# Click-through content from the card
problem: "2-sentence description of the problem this solves."
solution: "2-sentence description of your solution approach."
key_features:
  - "Feature 1 with specific outcome/metric"
  - "Feature 2 with specific outcome/metric"
  - "Feature 3 with specific outcome/metric"

# === MEDIA: PORTFOLIO SLIDES ===
# Carousel images shown on the project detail page (/projects/{slug})
# These are NOT hero images — they are portfolio presentation slides
slides:
  - src: "/images/portfolio/{slug}-01.png"
    src_es: "/images/portfolio/{slug}-01-es.png"    # Only if slide has text
    alt_en: "English description of this slide"
    alt_es: "Spanish description of this slide"
  - src: "/images/portfolio/{slug}-02.png"
    alt_en: "English description"
    alt_es: "Spanish description"
    # No src_es = same image for both languages (e.g. code screenshots, diagrams)

# === MEDIA: VIDEO ===
# Portfolio brief video shown on the project detail page
# NOT a product demo video — this is a portfolio presentation video
video_url: "/video/{slug}-brief.mp4"
video_url_es: "/video/{slug}-brief-es.mp4"          # Only if video has narration/text
video_poster: "/video/{slug}-poster.jpg"
video_poster_es: "/video/{slug}-poster-es.jpg"       # Only if poster has text

# === LINKS ===
demo_url: ""                        # Live demo link
live_url: ""                        # Production URL (if different from demo)

# === OPTIONAL ===
metrics:
  - "Metric 1 with percentage or number"
  - "Metric 2 with percentage or number"
tags:
  - "searchable-tag"
date_completed: "2026-02"           # YYYY-MM format
---

<!-- Optional: 2-3 paragraph extended description for the markdown body -->
```

---

## Field Rules

### Required Fields

| Field | Type | Rules |
|-------|------|-------|
| `portfolio_enabled` | boolean | `true` or `false` — controls visibility |
| `title` | string | Project name, title case |
| `tagline` | string | Max 60 characters, include a metric if possible |
| `slug` | string | URL-safe slug for the detail page URL |
| `category` | string | Must be one of the valid values below |
| `tech_stack` | string[] | 3-5 items max, most important first |
| `thumbnail` | string | Path to card thumbnail image (see Media section) |
| `status` | string | Must be one of the valid values below |
| `problem` | string | Exactly 2 sentences |
| `solution` | string | Exactly 2 sentences |
| `key_features` | string[] | 3-5 items, each with a specific outcome or metric |
| `date_completed` | string | `YYYY-MM` format |

### Optional Fields

| Field | Type | Rules |
|-------|------|-------|
| `portfolio_featured` | boolean | Default `false` — only top projects should be `true` |
| `portfolio_priority` | number | Default `99` — lower number = higher position |
| `thumbnail_es` | string | Spanish variant of thumbnail (only if thumbnail has text) |
| `slides` | array | Portfolio detail page carousel images (see Media section) |
| `video_url` | string | Portfolio brief video (see Media section) |
| `video_url_es` | string | Spanish variant of video (only if has narration/text) |
| `video_poster` | string | Static poster image for video player |
| `video_poster_es` | string | Spanish variant of poster (only if has text) |
| `demo_url` | string | Must be a working URL or empty string |
| `live_url` | string | Production URL or empty string |
| `metrics` | string[] | Only include if real data exists |
| `tags` | string[] | Searchable tags, merged with GitHub topics |

### Valid `category` Values

| Value | Use For |
|-------|---------|
| `AI Automation` | Chatbots, agents, workflow automation, AI integrations |
| `Document Processing` | PDF extraction, OCR, document Q&A, data pipelines |
| `Web Tools` | Web apps, dashboards, SaaS tools, utilities |
| `Developer Tools` | CLI tools, dev utilities, automation scripts |
| `Templates` | Starter kits, boilerplates, scaffolds |
| `Creative` | Storytelling, narrative, interactive fiction |
| `Tools` | General-purpose tools and utilities |
| `Marketing` | Marketing sites, landing pages |

### Valid `status` Values

| Value | Meaning |
|-------|---------|
| `Production` | Deployed and serving real users/clients |
| `Demo` | Working demo, not yet in production use |
| `Archived` | Completed but no longer actively maintained |

---

## Media Section (CRITICAL)

The media section defines all visual assets for the portfolio. These assets live in the **source repo's** `public/` directory and are pulled into the cushlabs repo when needed.

### Terminology

| Term | Where It Shows | Purpose |
|------|---------------|---------|
| **Thumbnail** | Solutions grid card (`/solutions`) | Small optimized image for the project card |
| **Slides** | Detail page carousel (`/projects/{slug}`) | Full-width presentation slides in a carousel |
| **Video** | Detail page video section | Portfolio brief video with poster overlay |

**These are NOT hero images.** "Hero" refers to the large banner at the top of website pages. Portfolio slides are carousel images for the project detail page.

### File Naming Convention

All media files follow the pattern `{slug}-{descriptor}.{ext}`:

```
images/portfolio/
  {slug}-thumb.jpg              # EN card thumbnail (required)
  {slug}-thumb-es.jpg           # ES card thumbnail (only if has text)
  {slug}-01.png                 # Slide 1 (EN)
  {slug}-01-es.png              # Slide 1 (ES, only if has text)
  {slug}-02.png                 # Slide 2
  ...

video/
  {slug}-brief.mp4              # EN portfolio brief video
  {slug}-brief-es.mp4           # ES portfolio brief video (only if narration/text)
  {slug}-poster.jpg             # EN video poster image
  {slug}-poster-es.jpg          # ES video poster image (only if has text)
```

### Bilingual Media Rules

Not every asset needs a Spanish variant. The rule is simple:

- **Has visible text or narration?** Create an `-es` variant
- **Pure code, diagrams, or UI without text?** Same image for both languages — omit the `_es` / `src_es` field

When `src_es` is omitted from a slide, the detail page uses `src` for both languages.
When `thumbnail_es` is omitted, the solutions grid uses `thumbnail` for both languages.
When `video_url_es` is omitted, the detail page uses `video_url` for both languages.

### Thumbnail Requirements

- **Format:** JPG preferred (smaller file size for cards)
- **Target size:** Under 200KB
- **Aspect ratio:** 16:9
- **Content:** Should be a polished, designed image — not a raw screenshot
- **Distinct from slides:** The thumbnail is optimized for small card display; slides are for full-width detail view

### Video Poster Pattern

The video section uses a **poster image with play button overlay** pattern:
1. The poster image loads instantly (lightweight JPG)
2. A styled play button is overlaid on top
3. Clicking the play button lazy-loads and plays the video
4. This saves bandwidth and improves page load performance

**Always provide a `video_poster` when you provide a `video_url`.**

### Slide Structure

```yaml
slides:
  - src: "/images/portfolio/cushlabs-01.png"          # Required: EN image path
    src_es: "/images/portfolio/cushlabs-01-es.png"     # Optional: ES variant
    alt_en: "English alt text describing this slide"    # Required
    alt_es: "Spanish alt text describing this slide"    # Required
```

Both `alt_en` and `alt_es` are always required (for accessibility), even when the image itself doesn't have a Spanish variant.

---

## Content Quality Rules

### Tagline
- **Max 60 characters**
- Lead with the outcome, not the technology
- Include a metric when possible

```yaml
# Good
tagline: "Cut tier-1 tickets by 45% with context-aware GPT-4 chatbot"
tagline: "Auto-optimize resumes for ATS with 80% pass rate"

# Bad
tagline: "An AI chatbot built with Next.js and OpenAI"
tagline: "Revolutionary document processing solution"
```

### Problem & Solution
- **Exactly 2 sentences each**
- Problem: Who is affected + what's the pain (quantify if possible)
- Solution: What you built + the key outcome

### Key Features
- **3-5 items only**
- Each must include a measurable outcome or specific capability
- No vague marketing language

### Metrics
- **Only include if you have real data**
- Include the number/percentage AND the timeframe or context
- Omit the `metrics` field entirely if no real data exists

---

## What NOT to Include

- Long descriptions of "how it works" — that's what the demo/README is for
- Technology explanations — `tech_stack` array is enough
- Installation instructions — README handles that
- Marketing hype — no "revolutionary", "game-changing", "cutting-edge"
- Fields named `hero_images` — use `slides` instead
- Fields named `demo_video_url` — use `video_url` instead

---

## Visual Hierarchy

### Card View (Portfolio Grid — `/solutions`)

```
+---------------------------+
|   [Thumbnail Image]       |  <-- thumbnail field
|                           |
|  Title                    |
|  Tagline (1 line)         |
|  [Next.js] [OpenAI]       |  <-- tech_stack badges
|  Production - Featured     |  <-- status indicators
+---------------------------+
```

### Detail Page (`/projects/{slug}`)

```
Title
Tagline

[Video with Poster + Play Button]   <-- video_url + video_poster

[Slide Carousel]                    <-- slides array
  < [1] [2] [3] [4] [5] >

The Challenge                       <-- problem field
The Solution                        <-- solution field
Key Features                        <-- key_features list
Results                             <-- metrics list

[Demo] [GitHub] [Live Site]         <-- CTA buttons
```

---

## Sync Architecture

The cushlabs.ai site uses a build-time sync script (`scripts/generate-projects.ts`) that:

1. Fetches all repos via GitHub API for `RCushmaniii`
2. Fetches `PORTFOLIO.md` from each repo root (tries `PORTFOLIO.md` then `portfolio.md`)
3. Parses YAML frontmatter with `gray-matter`
4. If `portfolio_enabled: false` — skips the repo entirely
5. Portfolio fields override GitHub API data (title, category, tech_stack, status, etc.)
6. Sorts by `portfolio_priority` ascending, then featured, then last pushed
7. Outputs to `src/data/projects.generated.json`

### Parsing Reference (TypeScript)

```typescript
import matter from 'gray-matter';

interface PortfolioMeta {
  portfolio_enabled: boolean;
  portfolio_priority: number;
  portfolio_featured: boolean;
  title: string;
  tagline: string;
  slug: string;
  category: string;
  tech_stack: string[];
  thumbnail: string;
  thumbnail_es?: string;
  status: 'Production' | 'Demo' | 'Archived';
  problem: string;
  solution: string;
  key_features: string[];
  slides?: {
    src: string;
    src_es?: string;
    alt_en: string;
    alt_es: string;
  }[];
  video_url?: string;
  video_url_es?: string;
  video_poster?: string;
  video_poster_es?: string;
  demo_url?: string;
  live_url?: string;
  metrics?: string[];
  tags?: string[];
  date_completed: string;
}

const { data } = matter(fileContent);
```

---

## Validation Checklist

Before committing a `PORTFOLIO.md`, verify:

| Criteria | Check |
|----------|-------|
| File is named `PORTFOLIO.md` in repo root | |
| `portfolio_enabled` is explicitly set | |
| `title` is present and title-cased | |
| `slug` matches the repo name | |
| Tagline is under 60 characters | |
| Category is a valid value | |
| Status is one of the 3 valid values | |
| Problem is exactly 2 sentences | |
| Solution is exactly 2 sentences | |
| Key features have 3-5 items with outcomes | |
| Metrics are real data (or field omitted) | |
| No hype language anywhere | |
| `date_completed` is YYYY-MM format | |
| All URLs work (or are empty strings) | |
| `thumbnail` path follows naming convention | |
| `video_poster` provided if `video_url` exists | |
| `slides` use `src`/`src_es`/`alt_en`/`alt_es` format | |
| No field named `hero_images` (use `slides`) | |
| No field named `demo_video_url` (use `video_url`) | |
| Spanish `_es` variants only where assets have visible text | |
