# Portfolio Metadata Instructions for AI

> Every CushLabs repo that should appear on the portfolio at cushlabs.ai must include a `portfolio.md` file in the repo root.

---

## What Is `portfolio.md`?

A markdown file with YAML frontmatter that controls how a project appears on the CushLabs.ai portfolio page. The cushlabs.ai site syncs these files from GitHub to build the portfolio grid and detail pages automatically.

**Why this format:**
- Human-readable for quick edits
- Structured metadata at top (easy to parse with `gray-matter`)
- Standard in JAMstack ecosystems
- GitHub renders it nicely for reference
- Optional markdown body for extended descriptions

---

## Schema

Create `portfolio.md` in the repo root with this exact structure:

```yaml
---
# Control flags
include_in_portfolio: true       # Set false to hide from portfolio
featured: false                  # Set true for homepage spotlight
priority: 1                      # Lower = higher in list (1, 2, 3...)

# Card display (what shows in the portfolio grid)
title: "Project Title"
tagline: "One-line value proposition (max 60 chars)"
category: "AI Automation"
tech_stack: ["Next.js", "OpenAI", "Supabase"]
thumbnail: "/portfolio/project-thumbnail.png"
status: "Production"

# Detail page (click-through from card)
problem: "2-sentence description of the problem this solves."
solution: "2-sentence description of your solution approach."

key_features:
  - "Feature 1 with specific outcome/metric"
  - "Feature 2 with specific outcome/metric"
  - "Feature 3 with specific outcome/metric"

# Links
demo_url: ""                     # Live demo link
repo_url: ""                     # Auto-filled by sync script
live_url: ""                     # Production instance (if applicable)

# Optional metrics
metrics:
  - "Metric 1 with percentage or number"
  - "Metric 2 with percentage or number"

date_completed: "2024-11"        # YYYY-MM format
---

<!-- Optional: 2-3 paragraph extended description -->
<!-- Most users won't read this — they'll click demo_url or live_url -->
```

---

## Field Rules

### Required Fields

| Field | Type | Rules |
|-------|------|-------|
| `include_in_portfolio` | boolean | `true` or `false` — controls visibility |
| `title` | string | Project name, title case |
| `tagline` | string | Max 60 characters, include a metric if possible |
| `category` | string | Must be one of the valid values below |
| `tech_stack` | string[] | 3-5 items max, most important first |
| `status` | string | Must be one of the valid values below |
| `problem` | string | Exactly 2 sentences |
| `solution` | string | Exactly 2 sentences |
| `key_features` | string[] | 3-5 items, each with a specific outcome or metric |
| `date_completed` | string | `YYYY-MM` format |

### Optional Fields

| Field | Type | Rules |
|-------|------|-------|
| `featured` | boolean | Default `false` — only 1-2 projects should be `true` |
| `priority` | number | Default `99` — lower number = higher position |
| `thumbnail` | string | Path relative to repo or external URL |
| `demo_url` | string | Must be a working URL or empty string |
| `repo_url` | string | Leave empty — auto-filled by sync script |
| `live_url` | string | Production URL or empty string |
| `metrics` | string[] | Only include if real data exists |

### Valid `category` Values

| Value | Use For |
|-------|---------|
| `AI Automation` | Chatbots, agents, workflow automation, AI integrations |
| `Document Processing` | PDF extraction, OCR, document Q&A, data pipelines |
| `Web Tools` | Web apps, dashboards, SaaS tools, utilities |

### Valid `status` Values

| Value | Meaning |
|-------|---------|
| `Production` | Deployed and serving real users/clients |
| `Demo` | Working demo, not yet in production use |
| `Archived` | Completed but no longer actively maintained |

---

## Content Quality Rules

### Tagline
- **Max 60 characters**
- Lead with the outcome, not the technology
- Include a metric when possible

```yaml
# ✅ Good
tagline: "Cut tier-1 tickets by 45% with context-aware GPT-4 chatbot"
tagline: "Auto-optimize resumes for ATS with 80% pass rate"

# ❌ Bad
tagline: "An AI chatbot built with Next.js and OpenAI"
tagline: "Revolutionary document processing solution"
```

### Problem & Solution
- **Exactly 2 sentences each**
- Problem: Who is affected + what's the pain (quantify if possible)
- Solution: What you built + the key outcome

```yaml
# ✅ Good
problem: "SMBs waste 15+ hours/week on repetitive support questions that could be automated. Response times slip while agents handle the same FAQs over and over."
solution: "AI chatbot trained on your knowledge base deflects tier-1 questions automatically. Complex issues escalate to humans with full conversation context."

# ❌ Bad
problem: "Customer support is hard."
solution: "We built an AI chatbot."
```

### Key Features
- **3-5 items only**
- Each must include a measurable outcome or specific capability
- No vague marketing language

```yaml
# ✅ Good
key_features:
  - "Vector search across 500+ support docs with 90% accuracy"
  - "Seamless human handoff with full conversation history"
  - "Admin dashboard tracking deflection rates and training gaps"

# ❌ Bad
key_features:
  - "Fast and powerful"
  - "Easy to use"
  - "Cutting-edge AI technology"
```

### Metrics
- **Only include if you have real data**
- Include the number/percentage AND the timeframe or context
- Omit the `metrics` field entirely if no real data exists

```yaml
# ✅ Good
metrics:
  - "52% ticket deflection rate in 60 days"
  - "4.2/5 user satisfaction score (n=340)"

# ❌ Bad
metrics:
  - "Very fast"
  - "Improved efficiency"
```

---

## What NOT to Include

- Long descriptions of "how it works" — that's what the demo/README is for
- Technology explanations — `tech_stack` array is enough
- Installation instructions — README handles that
- Multiple images — one thumbnail, keep cards fast
- Marketing hype — no "revolutionary", "game-changing", "cutting-edge"

---

## Visual Hierarchy

### Card View (Portfolio Grid)

```
┌─────────────────────────┐
│   [Thumbnail Image]     │
│                         │
│  Title                  │
│  Tagline (1 line)       │
│  [Next.js] [OpenAI]     │  ← Tech badges
│  Production • Featured  │  ← Status indicators
└─────────────────────────┘
```

### Detail Page (Click-through)

```
[Hero Image/Video]

Title
Tagline

Problem (2 sentences)
Solution (2 sentences)

Key Features (3-5 bullets)

Metrics (if applicable)

[Demo] [GitHub] [Live Site]  ← Call-to-action buttons
```

---

## Sync Architecture

The cushlabs.ai site uses a build-time sync script that:

1. Fetches all repos via GitHub API for `RCushmaniii`
2. Looks for `portfolio.md` in each repo root
3. Parses YAML frontmatter with `gray-matter`
4. Filters by `include_in_portfolio: true`
5. Sorts by `priority` (ascending)
6. Outputs to `src/data/projects.generated.json`

### Parsing Reference (TypeScript)

```typescript
import matter from 'gray-matter';

interface PortfolioMeta {
  include_in_portfolio: boolean;
  featured: boolean;
  priority: number;
  title: string;
  tagline: string;
  category: 'AI Automation' | 'Document Processing' | 'Web Tools';
  tech_stack: string[];
  thumbnail: string;
  status: 'Production' | 'Demo' | 'Archived';
  problem: string;
  solution: string;
  key_features: string[];
  demo_url?: string;
  repo_url?: string;
  live_url?: string;
  metrics?: string[];
  date_completed: string;
}

const { data } = matter(fileContent);
```

### Test Fetch (PowerShell)

```powershell
# Verify portfolio.md is accessible via GitHub API
$repo = "RCushmaniii/your-repo-name"
$url = "https://api.github.com/repos/$repo/contents/portfolio.md"
$headers = @{
  "Accept" = "application/vnd.github.v3.raw"
  "User-Agent" = "CushLabs-Portfolio"
}

Invoke-RestMethod -Uri $url -Headers $headers
```

---

## AI Generation Prompt

When creating a `portfolio.md` for a new repo, use this prompt:

```markdown
Analyze this repository and generate a portfolio.md file following the CushLabs portfolio metadata schema.

Rules:
- Tagline must be max 60 characters with a metric if possible
- Problem and Solution must each be exactly 2 sentences
- Key features (3-5) must each include a measurable outcome
- Only include metrics if real data exists — omit the field otherwise
- No hype language ("revolutionary", "cutting-edge", etc.)
- Category must be: "AI Automation", "Document Processing", or "Web Tools"
- Status must be: "Production", "Demo", or "Archived"
- tech_stack should list 3-5 items max, most important first

Output the complete portfolio.md file ready to commit to the repo root.
```

---

## Validation Checklist

Before committing a `portfolio.md`, verify:

| Criteria | Check |
|----------|-------|
| File is in repo root (not `/docs/` or `/src/`) | ⬜ |
| `include_in_portfolio` is explicitly set | ⬜ |
| Tagline is under 60 characters | ⬜ |
| Category is one of the 3 valid values | ⬜ |
| Status is one of the 3 valid values | ⬜ |
| Problem is exactly 2 sentences | ⬜ |
| Solution is exactly 2 sentences | ⬜ |
| Key features have 3-5 items with outcomes | ⬜ |
| Metrics are real data (or field omitted) | ⬜ |
| No hype language anywhere | ⬜ |
| `date_completed` is YYYY-MM format | ⬜ |
| All URLs work (or are empty strings) | ⬜ |
