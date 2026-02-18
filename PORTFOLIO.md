---
# === CONTROL FLAGS ===
portfolio_enabled: true
portfolio_priority: 1
portfolio_featured: true

# === CARD DISPLAY ===
title: "CushLabs.ai"
tagline: "Self-maintaining bilingual portfolio with serverless booking"
slug: "cushlabs"
category: "Web Tools"
tech_stack:
  - "Astro"
  - "TypeScript"
  - "Tailwind CSS"
  - "Cloudflare Workers"
  - "Google Calendar API"
thumbnail: "/images/portfolio/cushlabs-01.png"
status: "Production"

# === DETAIL PAGE ===
problem: "Bilingual marketing sites go stale the moment you stop manually updating them, and third-party booking widgets break design consistency. SEO for two-language sites compounds the complexity with hreflang, canonical URLs, and sitemaps that must cover both languages correctly."
solution: "A static Astro site with a GitHub Actions pipeline that auto-syncs portfolio data weekly, a custom Cloudflare Worker booking wizard that queries Google Calendar in real time, and a 24-line TypeScript i18n system that enforces bilingual parity at build time."
key_features:
  - "Automated GitHub-to-site portfolio sync — 27 projects with zero manual data entry"
  - "Custom serverless booking wizard creating Google Calendar events with Meet links"
  - "24-line TypeScript i18n replacing 40KB+ i18next with zero runtime overhead"
  - "Pre-deploy audit enforcing translation parity, secret leak detection, and build validation"
  - "requestIdleCallback video preloading — zero bytes on initial page load"
metrics:
  - "27 portfolio projects synced automatically from GitHub"
  - "0 KB runtime i18n overhead (24 lines vs ~40KB+ i18next)"
  - "6 automated pre-deploy validation checks before every production build"
  - "Sub-second page loads with static HTML edge-cached globally"

# === LINKS ===
demo_url: "https://cushlabs.ai"
live_url: "https://cushlabs.ai"

# === OPTIONAL ===
hero_images:
  - src: "/images/portfolio/cushlabs-01.png"
    alt_en: "CushLabs AI Services — The Self-Maintaining Bilingual Portfolio"
    alt_es: "CushLabs AI Services — El Portafolio Bilingue Auto-Mantenido"
  - src: "/images/portfolio/cushlabs-02.png"
    alt_en: "Not Just a Website, But a System — bilingual, automated sync, serverless booking"
    alt_es: "No Solo un Sitio Web, Sino un Sistema — bilingue, sincronizacion automatizada, reservas serverless"
  - src: "/images/portfolio/cushlabs-03.png"
    alt_en: "Premium Design is About Behavior — zero-flash theming, time-based dark mode, micro-interactions"
    alt_es: "El Diseno Premium es Sobre Comportamiento — temas sin flash, modo oscuro basado en hora, micro-interacciones"
  - src: "/images/portfolio/cushlabs-04.png"
    alt_en: "Engineering Visibility — the enterprise SEO stack with JSON-LD, hreflang, and lazy loading"
    alt_es: "Visibilidad de Ingenieria — el stack SEO empresarial con JSON-LD, hreflang y carga lazy"
  - src: "/images/portfolio/cushlabs-05.png"
    alt_en: "True Bilingual Architecture — 24-line custom TypeScript i18n vs 40KB+ i18next"
    alt_es: "Arquitectura Bilingue Real — i18n TypeScript personalizado de 24 lineas vs i18next de 40KB+"
  - src: "/images/portfolio/cushlabs-06.png"
    alt_en: "The Serverless Booking Wizard — Cloudflare Worker to Google Calendar API, 3-step flow"
    alt_es: "El Asistente de Reservas Serverless — Cloudflare Worker a Google Calendar API, flujo de 3 pasos"
  - src: "/images/portfolio/cushlabs-07.png"
    alt_en: "Localization Beyond Language — WhatsApp integration with locale-aware pre-filled messages"
    alt_es: "Localizacion Mas Alla del Idioma — integracion WhatsApp con mensajes prellenados segun el idioma"
  - src: "/images/portfolio/cushlabs-08.png"
    alt_en: "Security and Anti-Scraping — split-attribute email obfuscation"
    alt_es: "Seguridad y Anti-Scraping — ofuscacion de email por atributos divididos"
video_url: "/images/portfolio/cushlabs-brief.mp4"
video_poster: "/images/portfolio/cushlabs-video-poster.jpg"
tags:
  - "astro"
  - "tailwind"
  - "typescript"
  - "i18n"
  - "cloudflare-workers"
  - "google-calendar"
  - "github-actions"
  - "seo"
  - "bilingual"
  - "serverless"
date_completed: "2026-02"
---

## Architecture Overview

CushLabs.ai is a self-maintaining portfolio system built as a static Astro site. The core insight is that the GitHub account itself is the source of truth for project data — a weekly GitHub Actions pipeline fetches every public repo, extracts metadata (languages, stars, topics, demo URLs from READMEs), and writes structured JSON consumed at build time. Rich marketing content is layered on top via a TypeScript override system, keeping automated data and curated copy cleanly separated.

## Key Engineering Decisions

**Custom i18n over i18next:** For a two-language static site, the entire i18n runtime is three functions totaling 24 lines. Every page knows its locale at build time from the URL structure — there's no client-side language detection or runtime switching. A pre-deploy audit dynamically imports both translation files and diffs every nested key, failing the build if any key exists in one language but not the other.

**Cloudflare Worker over Calendly:** The booking wizard is a 3-step flow (date/time, details, confirmation) backed by a Cloudflare Worker that authenticates to Google Calendar via OAuth2, checks FreeBusy availability, generates 30-minute slots filtering out conflicts and same-day bookings under 3.5 hours away, and creates calendar events with auto-generated Google Meet links. Rate limiting (5 bookings/hour/IP), input sanitization, and 5-minute slot caching are built in. The UI matches the site's design system — no iframe, no third-party branding.

**requestIdleCallback for video:** The homepage video ships with `preload="none"` and switches to `preload="auto"` only when the browser reports idle time via `requestIdleCallback` (with a 3-second timeout fallback, plus a Safari-specific `load` event + 2-second delay path). The video contributes zero bytes to initial page weight.

## Security

- Email obfuscation: address split across `data-u` and `data-d` attributes, assembled into `mailto:` only via client-side JS
- Pre-deploy secret scanning: regex patterns for GitHub tokens (`ghp_`, `github_pat_`) and OpenAI keys (`sk-`) across all tracked source files
- Booking API rate limiting: IP-based, 5 requests per hour per client
- Input sanitization: HTML/control character stripping, 200-char truncation on all booking fields
- CORS: configurable allowed origins on the Cloudflare Worker

## CI/CD Pipeline

1. **GitHub Actions** runs weekly portfolio sync — smart diffs to only commit when data changes, `[skip ci]` to prevent loops
2. **Graceful degradation** — if `GITHUB_TOKEN` is missing, build proceeds with last-known-good data
3. **Pre-deploy audit** runs 6 checks: repo hygiene, env vars, secret leaks, i18n parity, TypeScript/Astro type check, and build artifact verification (13 expected HTML paths across both languages)
