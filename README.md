# CushLabs.ai

AI consulting and software development for SMBs. Bilingual (EN/ES) business site with automated GitHub portfolio sync.

**Live:** [cushlabs.ai](https://cushlabs.ai)

---

## Overview

Production website for CushLabs.ai — an AI integration and software development consultancy serving US and Mexico. The site is fully bilingual (English/Spanish), statically generated with Astro, and includes an automated portfolio system that syncs project data from GitHub repositories at build time.

## Features

| Feature | Outcome |
|---------|---------|
| Bilingual EN/ES | Full content parity with hreflang SEO — `/` for English, `/es/` for Spanish |
| Automated Portfolio | GitHub repos with `portfolio.md` auto-sync to the `/projects` page at build time |
| Static Generation | Zero server costs, sub-second page loads, edge-cached globally |
| Dark Mode | System-aware with manual toggle, persisted in localStorage |
| Structured Data | Organization + WebPage JSON-LD schemas for rich search results |
| Accessible | Semantic HTML, ARIA labels, `prefers-reduced-motion` support, WCAG AA contrast |

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Astro](https://astro.build) 4.16 | Static site generator |
| [Tailwind CSS](https://tailwindcss.com) 3.4 | Utility-first styling |
| [TypeScript](https://www.typescriptlang.org) 5.9 | Type safety |
| [Netlify](https://www.netlify.com) | Hosting & deployment |
| GitHub Actions | Weekly portfolio data refresh |

## Quick Start

### Prerequisites

- Node.js 18.17+
- npm (included with Node.js)
- GitHub Personal Access Token with `public_repo` scope

### 1. Clone and install

```powershell
git clone https://github.com/RCushmaniii/cushlabs.git
cd cushlabs
npm install
```

### 2. Configure environment

```powershell
Copy-Item .env.example .env
notepad .env
```

Required variables:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=RCushmaniii
```

### 3. Generate portfolio data

```powershell
npm run generate-projects
```

This fetches `portfolio.md` from each GitHub repo and outputs `src/data/projects.generated.json`.

### 4. Start dev server

```powershell
npm run dev
```

Open `http://localhost:4321` — English home page loads by default, Spanish at `/es/`.

## Project Structure

```
cushlabs/
├── src/
│   ├── components/          # Reusable Astro components
│   │   └── home/            # Homepage section components
│   ├── layouts/
│   │   └── BaseLayout.astro # Master layout (SEO, hreflang, schema)
│   ├── pages/               # File-based routing
│   │   ├── index.astro      # Home (EN)
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── services.astro
│   │   ├── solutions.astro
│   │   ├── consultation.astro
│   │   ├── blog/
│   │   ├── projects/
│   │   └── es/              # Spanish mirror pages
│   ├── i18n/
│   │   ├── index.ts         # i18n utilities
│   │   └── translations/
│   │       ├── en.ts
│   │       └── es.ts
│   ├── data/
│   │   ├── projectDetails.ts
│   │   └── projects.generated.json
│   └── styles/
│       └── global.css       # Tailwind + CSS variables
├── api/
│   └── consultation-intake.ts
├── scripts/
│   ├── generate-projects.ts # GitHub API sync
│   └── audit-predeploy.ts
├── docs/                    # Reference docs & templates
│   ├── BRAND-DESIGN-SYSTEM.md
│   └── templates/
├── public/
│   └── images/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## URL Structure

| English (default) | Spanish |
|-------------------|---------|
| `/` | `/es` |
| `/about` | `/es/about` |
| `/services` | `/es/services` |
| `/solutions` | `/es/solutions` |
| `/projects` | `/es/projects` |
| `/blog` | `/es/blog` |
| `/contact` | `/es/contact` |
| `/consultation` | `/es/reservar` |

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Sync GitHub projects + production build |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run ESLint + TypeScript checks |
| `npm run generate-projects` | Sync GitHub repos to JSON |
| `npm run audit:predeploy` | Pre-deployment validation |

## Portfolio System

Projects appear on the site automatically when a repo has a `portfolio.md` file in its root with `include_in_portfolio: true`. See [`docs/templates/portfolio-metadata-instructions.md`](docs/templates/portfolio-metadata-instructions.md) for the full schema.

The build script (`scripts/generate-projects.ts`) fetches portfolio metadata from all `RCushmaniii` repos via the GitHub API and outputs `src/data/projects.generated.json`. A GitHub Actions workflow refreshes this data weekly.

## Design System

Brand colors, typography, spacing, component patterns, and repo standards are documented in [`docs/BRAND-DESIGN-SYSTEM.md`](docs/BRAND-DESIGN-SYSTEM.md).

| Token | Value | Usage |
|-------|-------|-------|
| `cush-orange` | `#FF6A3D` | Primary accent |
| Display font | Space Grotesk | Headings, nav, buttons |
| Body font | Source Serif 4 | Paragraphs, content |

## Bilingual Parity Rule

> There is no such thing as fixing just the English side. There is only fixing BOTH sides or fixing NOTHING.

Every page, translation key, and SEO tag must exist in both languages. See [`docs/architecture/BILINGUAL-PARITY-CHECKLIST.md`](docs/architecture/BILINGUAL-PARITY-CHECKLIST.md).

## License

Copyright 2025 CushLabs.ai. All rights reserved.
