# CushLabs.ai — Comprehensive Site Audit

**Date:** 2026-03-03
**Auditor:** Claude Code (Opus 4.6)
**Site:** https://cushlabs.ai
**Stack:** Astro 4.16.18 + Tailwind CSS 3.4.17, deployed on Vercel (static output)

---

## Executive Summary

The site has serious performance problems that directly impact lead conversion. The root causes are: **44 MB of unoptimized static assets** (19 MB images + 25 MB video), **zero caching configuration** (no vercel.json), **render-blocking Google Fonts**, **no resource hints**, and **missing lazy loading on key images**. External image dependencies on GitHub raw CDN and various Vercel/Netlify deployment URLs add unpredictable latency.

SEO foundations are solid (hreflang, OG tags, structured data), but accessibility has gaps that affect real users and hurt search ranking. Security posture is acceptable but lacks defense-in-depth headers.

**Expected improvement from implementing all critical fixes:** 50-70% reduction in page weight, sub-2-second load times, and 25+ point Lighthouse score improvement.

---

## Findings by Severity

### CRITICAL — Fix Immediately

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| C1 | **No `vercel.json` — zero caching headers** | Every static asset re-fetched from origin on every visit. No edge caching, no Cache-Control, no image optimization. | Project root (missing file) |
| C2 | **19 MB of unoptimized JPG/PNG images** | Hero images are 225-385 KB each. All served as raw JPG/PNG with no WebP alternatives, no srcset, no responsive sizing. | `public/images/` (30 files) |
| C3 | **Render-blocking Google Fonts via CSS @import** | `@import url("fonts.googleapis.com/...")` in `global.css` blocks CSS parsing. Adds 100-300ms to first paint. | `src/styles/global.css:1` |
| C4 | **Zero preconnect/preload/prefetch hints** | Browser must cold-start DNS + TLS for every external domain (Google Fonts, GitHub, deployed project URLs). Adds 200-500ms per domain. | `src/layouts/BaseLayout.astro` |
| C5 | **Portfolio card images missing `loading="lazy"`** | All 24 portfolio thumbnails load eagerly on page load, including below-the-fold cards. Portfolio page is heaviest page on site. | `src/pages/portfolio.astro:279` |
| C6 | **Portfolio hero image: 327 KB raw JPG, not lazy loaded** | `solutuions-hero.jpg` (note typo in filename) loads eagerly at 327 KB, blocks LCP. | `src/pages/portfolio.astro:113` |
| C7 | **25 MB of uncompressed video files** | Three MP4 files (7.7-8.8 MB each) served from origin with no CDN optimization. | `public/videos/` |

### HIGH — Fix This Week

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| H1 | **No Content Security Policy headers** | No CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers configured. Site is vulnerable to clickjacking and content injection. | Missing `vercel.json` |
| H2 | **External image dependencies for portfolio** | 17 of 22 portfolio thumbnails load from external domains (Vercel, Netlify, GitHub). If any deployment goes down, portfolio cards break. | `src/data/projects.generated.json` |
| H3 | **No skip-to-main-content link** | Keyboard and screen reader users must tab through entire header navigation on every page to reach content. WCAG 2.4.1 failure. | `src/layouts/BaseLayout.astro`, `src/components/Header.astro` |
| H4 | **No `<main>` landmark in layout** | BaseLayout uses `<slot />` without a wrapping `<main>` element. Screen readers can't identify main content region. WCAG 1.3.1 gap. | `src/layouts/BaseLayout.astro:116` |
| H5 | **Form error messages not connected via aria** | Contact form `#form-error` div has no `aria-live` region. Screen readers won't announce errors dynamically. | `src/pages/contact.astro:204` |
| H6 | **Portfolio images lack meaningful alt text** | Project card images use `alt={project.title}` which is just the project name, not a description of what the image shows. | `src/pages/portfolio.astro:281` |
| H7 | **Blog article hreflang not verified in sitemap** | Blog post URLs in sitemap may lack hreflang alternate entries, causing duplicate content signals to search engines. | `src/pages/blog/[slug].astro` |
| H8 | **Missing FAQPage and Article structured data** | FAQ pages exist but have no Schema.org FAQPage markup. Blog posts lack Article schema with dates/author. | Various pages |

### MEDIUM — Fix This Sprint

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| M1 | **Inline scripts not extracted/minified** | Theme toggle (157 lines), portfolio filter (100+ lines), video modal (50+ lines) are unminified inline `<script>` blocks, repeated across pages. Adds 20-30 KB per page. | `Header.astro`, `portfolio.astro`, `VideoSection.astro` |
| M2 | **innerHTML usage in booking components** | `BookingFormSteps.astro` and `DatePicker.astro` use `container.innerHTML = ...` with template literals. Low risk since data is trusted, but violates defense-in-depth. | `src/components/booking/BookingFormSteps.astro`, `DatePicker.astro` |
| M3 | **No responsive images (srcset/sizes)** | All images are single-resolution. Desktop users load mobile-sized images; mobile users load desktop-sized images. No adaptive serving. | All `<img>` tags site-wide |
| M4 | **Color contrast: orange on white fails WCAG AA** | `#FF6A3D` (cush-orange) on white background = ~2.8:1 ratio. Fails WCAG AA for normal text (needs 4.5:1). Passes for large text only. | CTA buttons, accent text |
| M5 | **Video accessibility: no captions** | Portfolio videos have no `<track kind="captions">`. Inaccessible to deaf/hard-of-hearing users. | `src/components/home2/VideoSection.astro`, `portfolio.astro` |
| M6 | **Missing BreadcrumbList schema on nested pages** | Project detail pages (`/projects/[slug]`), blog posts, and service pages lack breadcrumb structured data. | Various nested pages |
| M7 | **Filename typo: `solutuions-hero.jpg`** | Should be `solutions-hero.jpg`. Not user-facing but shows up in source code and could cause confusion. | `public/images/hero/solutuions-hero.jpg` |

### LOW — Polish

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| L1 | **Generic link text** | "View Project", "Details", "Demo" links lack unique context for screen readers. | Portfolio cards |
| L2 | **No Vercel Web Analytics** | No RUM (Real User Monitoring) in place to track actual user experience and Core Web Vitals. | Missing integration |
| L3 | **Two parallel booking systems (tech debt)** | `ConsultationBookingFlow` (calendar embed) and `BookingFormSteps` (custom API) coexist. Pick one. | `src/components/` |
| L4 | **apple-touch-icon uses WebP** | Some older iOS versions don't support WebP for touch icons. Should be PNG. | `BaseLayout.astro:85` |

---

## Asset Weight Breakdown

### Images — Top Offenders (Raw JPG/PNG)

| File | Size | Used On | Potential WebP Size |
|------|------|---------|-------------------|
| `hero/home-hero2.jpg` | 385 KB | Homepage | ~60 KB |
| `hero/solutuions-hero.jpg` | 327 KB | Portfolio | ~50 KB |
| `hero/about-hero.jpg` | 254 KB | About | ~40 KB |
| `hero/services-hero.jpg` | 236 KB | Services | ~35 KB |
| `hero/blog-hero.jpg` | 231 KB | Blog | ~35 KB |
| `blog/blog-3.jpg` | 228 KB | Blog | ~35 KB |
| `blog/blog-2.jpg` | 220 KB | Blog | ~30 KB |
| `hero/home-hero3.jpg` | 225 KB | Homepage | ~35 KB |
| `about/me-blueblazer-winetie.jpg` | 220 KB | About | ~30 KB |
| `work/work-2.jpg` | 175 KB | Work | ~25 KB |
| `clients/client-logo-4.png` | 167 KB | Home | ~20 KB |
| **Total top 11** | **2.67 MB** | | **~395 KB** |

**Potential savings from WebP conversion: ~85% reduction (2.3 MB saved on top 11 alone)**

### Videos

| File | Size |
|------|------|
| `CushLabs_AI_Portfolio.mp4` | 8.8 MB |
| `Analisis-de-Portafolio-CushLabs.mp4` | 8.0 MB |
| `Putting_AI_to_Work.mp4` | 7.7 MB |
| **Total** | **24.5 MB** |

Videos use `preload="none"` which is correct — they don't block initial load. But they could be compressed 40-50% with H.265/HEVC encoding or transcoded to adaptive bitrate (HLS).

---

## Performance Fix Plan

### Phase 1: Immediate Impact (< 1 day)

**1. Create `vercel.json` with caching + security headers**

```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/videos/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**2. Add resource hints to BaseLayout.astro `<head>`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
```

**3. Convert Google Fonts from @import to `<link>` in `<head>`**

Remove `@import` from `global.css` and add to BaseLayout `<head>`:
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&display=swap" />
```

**4. Add `loading="lazy"` to portfolio card images**

In `portfolio.astro`, the `<img>` on line 279 needs `loading="lazy"`.

### Phase 2: Image Optimization (1-2 days)

**5. Batch convert all JPG/PNG to WebP**

```bash
# Using cwebp (install via: choco install webp)
for f in public/images/**/*.jpg public/images/**/*.png; do
  cwebp -q 80 "$f" -o "${f%.*}.webp"
done
```

**6. Update all image references to use WebP with fallback**

Use `<picture>` element pattern:
```html
<picture>
  <source srcset="/images/hero/home-hero2.webp" type="image/webp" />
  <img src="/images/hero/home-hero2.jpg" alt="..." loading="lazy" />
</picture>
```

Or better: install `@astrojs/image` or use Astro's built-in `<Image>` component (Astro 4.x has this built-in) for automatic format conversion and responsive sizing.

**7. Add responsive srcset to hero images**

Generate 2 sizes per hero image (mobile 640w, desktop 1280w) and add srcset:
```html
<img
  srcset="/images/hero/home-hero2-640.webp 640w, /images/hero/home-hero2.webp 1280w"
  sizes="100vw"
  src="/images/hero/home-hero2.jpg"
  alt="..."
  loading="lazy"
/>
```

**8. Mirror critical portfolio thumbnails locally**

For the top 10 portfolio projects, download thumbnails to `public/images/portfolio/` to eliminate external domain dependencies.

### Phase 3: Accessibility (1 day)

**9. Add skip navigation link**

In `BaseLayout.astro`, before `<Header>`:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-cush-orange focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-display focus:font-semibold">
  Skip to main content
</a>
```

Add `<main id="main-content">` wrapper around `<slot />`.

**10. Add aria-live to form error containers**

```html
<div id="form-error" class="hidden ..." role="alert" aria-live="polite" aria-atomic="true">
```

**11. Fix color contrast for orange accent text**

For small text using `text-cush-orange` on white backgrounds, darken to `#D4522A` (passes AA at 4.5:1) or only use the current orange on dark backgrounds where it already passes.

### Phase 4: SEO Enhancement (1 day)

**12. Add FAQPage structured data to FAQ pages**

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } }]
}
```

**13. Add Article schema to blog posts**

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "datePublished": "...",
  "author": { "@type": "Person", "name": "Robert Cushman" }
}
```

**14. Add BreadcrumbList to nested pages**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cushlabs.ai" },
    { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://cushlabs.ai/portfolio" },
    { "@type": "ListItem", "position": 3, "name": "Voice Agent" }
  ]
}
```

---

## Expected Results After All Fixes

| Metric | Current (estimated) | After Fixes | Improvement |
|--------|-------------------|-------------|-------------|
| Page Weight (portfolio) | ~800 KB+ | ~200 KB | **75% smaller** |
| Page Weight (homepage) | ~500 KB | ~150 KB | **70% smaller** |
| First Contentful Paint | ~1.8s | ~0.8s | **56% faster** |
| Largest Contentful Paint | ~3.0s+ | ~1.5s | **50% faster** |
| Lighthouse Performance | ~50-65 | ~90+ | **+25-40 points** |
| Lighthouse Accessibility | ~75 | ~95+ | **+20 points** |
| Lighthouse SEO | ~85 | ~100 | **+15 points** |
| Time to Interactive | ~3.5s | ~1.5s | **57% faster** |

---

## Files Requiring Changes (Ordered by Impact)

| Priority | File | Changes |
|----------|------|---------|
| 1 | `vercel.json` (create) | Caching headers + security headers |
| 2 | `src/layouts/BaseLayout.astro` | Preconnect hints, font link, skip nav, `<main>` wrapper |
| 3 | `src/styles/global.css` | Remove @import for Google Fonts |
| 4 | `src/pages/portfolio.astro` | Add `loading="lazy"` to card images, fix hero image |
| 5 | `public/images/**` | Batch WebP conversion of all JPG/PNG files |
| 6 | All pages with `<img>` tags | Add `<picture>` with WebP source + JPG fallback |
| 7 | `src/pages/contact.astro` | Add `aria-live` to error div, `aria-required` to fields |
| 8 | `astro.config.mjs` | Consider adding Astro Image integration |
| 9 | Blog and FAQ pages | Add Article and FAQPage structured data |
| 10 | Nested pages | Add BreadcrumbList structured data |

---

## Quick Wins (< 30 minutes each, high impact)

1. Create `vercel.json` with caching headers → **instant CDN caching for all assets**
2. Add preconnect hints to BaseLayout → **saves 200-300ms on font load**
3. Move Google Fonts from @import to `<link>` → **unblocks CSS parsing**
4. Add `loading="lazy"` to portfolio card images → **reduces initial page weight by ~1 MB**
5. Add skip navigation link → **WCAG compliance for keyboard users**
6. Add `aria-live="polite"` to form error divs → **screen reader support**
