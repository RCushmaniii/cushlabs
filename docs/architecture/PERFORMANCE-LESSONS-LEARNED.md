# Performance, Security & Accessibility — Lessons Learned

**Date:** 2026-03-03
**Context:** Comprehensive site audit and optimization of cushlabs.ai
**Applies to:** All CushLabs repos (current and future projects)

---

## Why This Exists

A potential client visiting `/projects/cushlabs-ai-voice-agent` experienced multi-second load times. Portfolio cards had missing images. For a business selling technical services, this is a conversion killer. The audit uncovered systemic issues across performance, security, SEO, and accessibility — not just one bad page.

These lessons are written so that any AI developer assistant working on a CushLabs repo can apply them from day one.

---

## Lesson 1: No `vercel.json` = No Caching

**What happened:** The site had zero caching configuration. Every static asset (images, CSS, JS) was re-fetched from Vercel's origin on every page visit. Repeat visitors got zero benefit from browser caching.

**The fix:** Create `vercel.json` at project root with immutable caching for static assets:

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
      "source": "/_astro/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Rule:** Every Vercel-deployed project must have a `vercel.json` with caching headers before launch. Period.

---

## Lesson 2: Security Headers Are Not Optional

**What happened:** No HSTS, no X-Frame-Options, no Content-Type-Options, no Referrer-Policy. The site was technically vulnerable to clickjacking and content sniffing.

**The fix:** Add security headers to the catch-all route in `vercel.json`:

```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ]
}
```

**Rule:** These six headers go on every CushLabs site. Non-negotiable.

---

## Lesson 3: Google Fonts via CSS `@import` Blocks Rendering

**What happened:** `global.css` had `@import url("fonts.googleapis.com/...")` as its first line. This blocks CSS parsing — the browser can't render anything until the font CSS downloads from Google.

**The fix:** Remove the `@import` from CSS. Load fonts via `<link>` tags in `<head>` with `preconnect`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=..." />
```

**Rule:** Never use `@import` for external resources in CSS. Always use `<link>` in `<head>` with `preconnect` hints.

---

## Lesson 4: Serve WebP, Not JPG/PNG

**What happened:** 19 MB of JPG/PNG images in `public/images/`. Hero images were 225–385 KB each. Converting to WebP saved 41% on average, with some images (hero backgrounds) shrinking 60-66%.

**The fix:** Batch convert with a script (`scripts/convert-images.cjs`) using sharp:

```javascript
const sharp = require('sharp');
await sharp(file).webp({ quality: 80 }).toFile(outPath);
```

**Actual results:**
- `about-hero.jpg`: 248 KB → 84 KB (-66%)
- `solutuions-hero.jpg`: 319 KB → 120 KB (-63%)
- `home-hero2.jpg`: 376 KB → 148 KB (-61%)

**Rule:** All images in `public/` must be WebP. Keep a `convert-images.cjs` script in the repo. Run it before any deployment that adds new images.

---

## Lesson 5: External Image Dependencies Are a Liability

**What happened:** 17 of 22 portfolio thumbnails loaded from external domains (Vercel preview deployments, Netlify, GitHub raw CDN). If any of those deployments go down or change URLs, portfolio cards break silently.

**Mitigation applied:** Added `dns-prefetch` for external domains to reduce latency.

**Better long-term fix:** Mirror critical thumbnails locally in `public/images/portfolio/`. External URLs are acceptable for non-critical content but top 10 projects should have local fallbacks.

**Rule:** Any image that appears above the fold or on a primary landing page should be hosted locally, never depend on an external domain.

---

## Lesson 6: `preload="metadata"` on Video Still Downloads Megabytes

**What happened:** The project detail page had `<video preload="metadata">` for a 10.3 MB MP4 file. The browser downloaded the video's metadata plus initial frames — hundreds of KB — on page load. Combined with the hosting domain (`voice.cushlabs.ai`) having `Cache-Control: max-age=0`, every visitor re-downloaded this from scratch.

**The fix:** Click-to-play poster pattern. Zero video bytes until the user clicks:

```html
<!-- Poster image + play button overlay -->
<div id="video-container" data-video-src={videoUrl} role="button" tabindex="0">
  <img src={posterUrl} alt="..." loading="eager" fetchpriority="high" />
  <div class="play-button-overlay">▶</div>
</div>

<script>
  // On click: replace poster with actual <video autoplay>
  videoContainer.addEventListener('click', () => {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.src = videoContainer.dataset.videoSrc;
    videoContainer.replaceWith(video);
  });
</script>
```

**Rule:** Never use `preload="metadata"` or `preload="auto"` on large videos. Always use click-to-play with a poster image. Make it keyboard accessible (Enter/Space).

---

## Lesson 7: Flexbox Sliders Defeat `loading="lazy"`

**What happened:** 10 images in a horizontal slider all had `loading="lazy"`, but the browser loaded all 10 immediately. Why? The slider uses `display: flex` with `overflow: hidden` — the browser considers all items in the flex container as "near viewport" and loads them all.

**The fix:** Only set `src` on the first image. Use `data-src` for the rest and load them on-demand via JavaScript when the user navigates:

```html
<!-- Only image 1 gets a real src -->
<img src={i === 0 ? img.src : undefined} data-src={img.src} />
```

```javascript
function ensureLoaded(index) {
  const img = sliderImages[index];
  if (img && !img.src && img.dataset.src) {
    img.src = img.dataset.src;
  }
}
// Preload one image ahead for smooth UX
function goTo(index) {
  ensureLoaded(index);
  ensureLoaded((index + 1) % total);
}
```

**Rule:** `loading="lazy"` does NOT work inside flex/grid containers with overflow hidden. Use manual `data-src` lazy loading for carousels and sliders.

---

## Lesson 8: Resource Hints Save 200-500ms Per External Domain

**What happened:** The site loaded resources from multiple external domains (Google Fonts, GitHub, voice.cushlabs.ai) with zero DNS/connection hints. Each new domain requires DNS lookup + TCP connection + TLS handshake — 200-500ms each.

**The fix:**

```html
<!-- Critical third parties: preconnect (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Nice-to-have: dns-prefetch (DNS only, lighter) -->
<link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
<link rel="dns-prefetch" href="https://voice.cushlabs.ai" />
```

**Rule:** `preconnect` for domains you'll definitely use on every page (fonts). `dns-prefetch` for domains you might use (portfolio images, video hosting).

---

## Lesson 9: Skip Navigation Is Not Optional

**What happened:** No skip-to-main-content link. Keyboard and screen reader users had to tab through the entire header navigation on every page. This is a WCAG 2.4.1 failure.

**The fix:**

```html
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] ...">
  Skip to main content
</a>
<!-- ... header ... -->
<main id="main-content">
  <slot />
</main>
```

**Rule:** Every site layout must have a skip link and a `<main>` landmark. Make it bilingual. This takes 5 minutes and affects every page.

---

## Lesson 10: Form Errors Need `aria-live`

**What happened:** Contact form error messages appeared visually but screen readers couldn't detect them because the error `<div>` had no `aria-live` region.

**The fix:**

```html
<div id="form-error" role="alert" aria-live="polite" aria-atomic="true" class="hidden ...">
```

**Rule:** Any element that appears dynamically (error messages, success confirmations, loading states) needs `aria-live="polite"` or `role="alert"`.

---

## Lesson 11: Structured Data Enables Rich Search Results

**What happened:** FAQ pages existed but had no FAQPage schema. Project detail pages had no breadcrumb context. Google had no way to generate rich snippets.

**The fix:**

```html
<!-- FAQPage schema -->
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
  }))
})} />

<!-- BreadcrumbList for nested pages -->
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cushlabs.ai/" },
    { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://cushlabs.ai/portfolio" },
    { "@type": "ListItem", "position": 3, "name": project.title }
  ]
})} />
```

**Rule:** Every page type gets appropriate schema: Organization (homepage), FAQPage (FAQ), BreadcrumbList (nested pages), Article (blog posts).

---

## Lesson 12: Check Third-Party Cache Headers

**What happened:** `voice.cushlabs.ai` (hosted on Render) was serving assets with `Cache-Control: max-age=0`. Every visitor re-downloaded the 10 MB video from scratch. We only discovered this by checking the response headers with `curl -sI`.

**Rule:** Before depending on any external domain for assets, check its cache headers:

```bash
curl -sI https://example.com/asset.mp4 | grep -i cache-control
```

If `max-age=0` or no Cache-Control header, either fix the origin server's config or host the asset locally.

---

## Checklist for New CushLabs Projects

Before any project goes to production:

- [ ] `vercel.json` exists with caching headers (1yr immutable for static assets)
- [ ] Security headers configured (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)
- [ ] All images are WebP (run `convert-images.cjs`)
- [ ] No `@import` for external resources in CSS
- [ ] `preconnect` for Google Fonts, `dns-prefetch` for other external domains
- [ ] Videos use click-to-play poster pattern (zero bytes on load)
- [ ] Slider/carousel images use manual `data-src` lazy loading
- [ ] Skip-to-main-content link in layout
- [ ] `<main id="main-content">` wraps page content
- [ ] `aria-live` on all dynamic UI elements (errors, success, loading)
- [ ] Structured data appropriate to page type
- [ ] Third-party asset domains have acceptable cache headers
- [ ] Lighthouse Performance score 90+
- [ ] Lighthouse Accessibility score 95+

---

## Files Modified in This Optimization

| File | Change |
|------|--------|
| `vercel.json` | Created — caching + security headers |
| `src/layouts/BaseLayout.astro` | Preconnect, dns-prefetch, font link, skip nav, `<main>` wrapper, apple-touch-icon fix |
| `src/styles/global.css` | Removed render-blocking `@import` |
| `src/pages/projects/[slug].astro` | Click-to-play video, lazy slider, BreadcrumbList schema |
| `src/pages/es/projects/[slug].astro` | Same (bilingual parity) |
| `src/pages/portfolio.astro` | Hero image → WebP with fetchpriority |
| `src/pages/contact.astro` | Hero → WebP, form error aria-live |
| `src/pages/about.astro` | Hero → WebP |
| `src/pages/blog/index.astro` | Hero → WebP |
| `src/pages/faq.astro` | FAQPage schema |
| `src/pages/es/faq.astro` | FAQPage schema |
| `src/components/home/Hero.astro` | Image → WebP |
| `src/components/home2/Hero.astro` | Image → WebP |
| `src/components/services2/Hero.astro` | Image → WebP |
| `src/components/FeaturedWorkSection.astro` | Images → WebP |
| `src/i18n/translations/en.ts` | All image refs → WebP |
| `src/i18n/translations/es.ts` | All image refs → WebP |
| `public/images/**/*.webp` | 24 new WebP files (batch converted) |
| `scripts/convert-images.cjs` | Reusable image conversion utility |
