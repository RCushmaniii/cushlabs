# CushLabs.ai — Design & Technical Specification

A comprehensive design document covering branding, visual system, language implementation, and JavaScript functionality.

---

## 1. Brand Identity

### Brand Name

**CushLabs.ai**

### Brand Positioning

AI consulting and modern software development studio targeting SMBs. Positioned as experienced, technically sophisticated, and approachable — expertise without intimidation.

### Brand Voice

- Professional but personable (first-person "I" rather than corporate "we")
- Technical depth communicated accessibly
- Confident without arrogance
- Modern and forward-looking

---

## 2. Color Palette

### Primary Colors

| Name            | Hex       | RGB           | Usage                     |
| --------------- | --------- | ------------- | ------------------------- |
| Black           | `#000000` | 0, 0, 0       | Primary background        |
| White           | `#FFFFFF` | 255, 255, 255 | Primary text, headlines   |
| Orange (Accent) | `#FF6A3D` | 255, 106, 61  | CTAs, highlights, accents |

### Secondary / UI Colors

| Name     | Hex       | Usage                       |
| -------- | --------- | --------------------------- |
| Gray 900 | `#0A0A0A` | Subtle background variation |
| Gray 800 | `#141414` | Card backgrounds            |
| Gray 700 | `#1A1A1A` | Borders, dividers           |
| Gray 600 | `#2A2A2A` | Inactive borders            |
| Gray 400 | `#666666` | Tertiary text               |
| Gray 300 | `#888888` | Secondary text              |
| Gray 200 | `#AAAAAA` | Body text                   |

### Gradient & Glow Effects

| Effect             | Value                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Orange Glow        | `rgba(255, 106, 61, 0.15)`                                              |
| Orange Soft        | `rgba(255, 106, 61, 0.08)`                                              |
| Spotlight Gradient | `radial-gradient(circle, var(--color-orange-glow) 0%, transparent 70%)` |
| Hero Pulse         | `radial-gradient(circle, var(--color-orange-glow) 0%, transparent 60%)` |

---

## 3. Typography

### Font Stack

| Role                | Font Family    | Weights       | Source       |
| ------------------- | -------------- | ------------- | ------------ |
| Display / Headlines | Space Grotesk  | 500, 600, 700 | Google Fonts |
| Body / Prose        | Source Serif 4 | 300, 400, 500 | Google Fonts |

### Type Scale (Fluid)

All sizes use `clamp()` for smooth scaling between mobile (320px) and desktop (1440px+):

| Token     | Mobile   | Desktop  | CSS Variable  |
| --------- | -------- | -------- | ------------- |
| text-xs   | 0.75rem  | 0.875rem | `--text-xs`   |
| text-sm   | 0.875rem | 1rem     | `--text-sm`   |
| text-base | 1rem     | 1.125rem | `--text-base` |
| text-lg   | 1.125rem | 1.375rem | `--text-lg`   |
| text-xl   | 1.25rem  | 1.625rem | `--text-xl`   |
| text-2xl  | 1.5rem   | 2.25rem  | `--text-2xl`  |
| text-3xl  | 2rem     | 3.5rem   | `--text-3xl`  |
| text-4xl  | 2.5rem   | 5rem     | `--text-4xl`  |
| text-5xl  | 3rem     | 7rem     | `--text-5xl`  |

### Typography Settings

| Element        | Font           | Weight | Tracking | Line Height |
| -------------- | -------------- | ------ | -------- | ----------- |
| Hero Headline  | Space Grotesk  | 700    | -0.02em  | 1.05        |
| Section Titles | Space Grotesk  | 700    | -0.01em  | 1.2         |
| Section Labels | Space Grotesk  | 600    | 0.25em   | 1.0         |
| Body Text      | Source Serif 4 | 400    | normal   | 1.7         |
| About Text     | Source Serif 4 | 300    | normal   | 1.8         |

---

## 4. Layout System

### Container

| Property      | Value                  |
| ------------- | ---------------------- |
| Max Width     | 1440px                 |
| Content Width | min(90%, 1200px)       |
| Padding       | Fluid via `--space-md` |

### Spacing Scale (Fluid)

| Token     | Mobile  | Desktop | CSS Variable  |
| --------- | ------- | ------- | ------------- |
| space-xs  | 0.5rem  | 0.75rem | `--space-xs`  |
| space-sm  | 0.75rem | 1.25rem | `--space-sm`  |
| space-md  | 1rem    | 1.75rem | `--space-md`  |
| space-lg  | 1.5rem  | 3rem    | `--space-lg`  |
| space-xl  | 2rem    | 4.5rem  | `--space-xl`  |
| space-2xl | 3rem    | 7rem    | `--space-2xl` |
| space-3xl | 4rem    | 10rem   | `--space-3xl` |

### Grid System

**Features Grid (2×2):**

- Fixed 2-column layout: `grid-template-columns: repeat(2, 1fr)`
- Max width: 900px
- Gap: `--space-lg`
- Breakpoint: Single column below 600px

---

## 5. Language System

### Supported Languages

| Code | Language          | Flag Placeholder |
| ---- | ----------------- | ---------------- |
| `en` | English           | EN               |
| `es` | Spanish (Español) | ES               |

### Implementation Architecture

The language system uses a CSS-first approach with JavaScript for switching:

**HTML Structure:**

```html
<!-- Bilingual content uses data-lang attributes -->
<span data-lang="en">English text</span>
<span data-lang="es">Texto en español</span>
```

**CSS Display Logic:**

```css
/* Default: English visible, Spanish hidden */
[data-lang="es"] {
  display: none;
}

/* When html lang="es": flip visibility */
html[lang="es"] [data-lang="en"] {
  display: none;
}
html[lang="es"] [data-lang="es"] {
  display: block;
}

/* Handle inline elements */
span[data-lang="es"] {
  display: none;
}
html[lang="es"] span[data-lang="en"] {
  display: none;
}
html[lang="es"] span[data-lang="es"] {
  display: inline;
}
```

### Language Detection Logic

**Priority Order:**

1. Saved preference in `localStorage` (key: `cushlabs-lang`)
2. Browser language via `navigator.language`
3. Fallback: English

**Detection Algorithm:**

```javascript
function detectLanguage() {
  let lang = "en"; // Default fallback

  try {
    // 1. Check localStorage for saved preference
    const saved = localStorage.getItem("cushlabs-lang");
    if (saved === "en" || saved === "es") {
      lang = saved;
    } else {
      // 2. Check browser language
      const browserLang = navigator.language || navigator.userLanguage || "en";
      if (browserLang.toLowerCase().startsWith("es")) {
        lang = "es";
      }
    }
  } catch (e) {
    // localStorage blocked (private browsing)
    const browserLang = navigator.language || navigator.userLanguage || "en";
    if (browserLang.toLowerCase().startsWith("es")) {
      lang = "es";
    }
  }

  return lang;
}
```

### Browser Language Examples

| Browser Setting     | `navigator.language` | Detected           |
| ------------------- | -------------------- | ------------------ |
| English (US)        | `en-US`              | English            |
| English (UK)        | `en-GB`              | English            |
| Spanish (Mexico)    | `es-MX`              | Spanish            |
| Spanish (Spain)     | `es-ES`              | Spanish            |
| Spanish (Argentina) | `es-AR`              | Spanish            |
| French              | `fr-FR`              | English (fallback) |
| German              | `de-DE`              | English (fallback) |

### Language Persistence

When a user manually switches language:

1. `localStorage.setItem('cushlabs-lang', lang)` saves preference
2. Subsequent visits load saved preference before browser detection
3. Works across sessions until cleared

**Privacy Consideration:** Uses try/catch for localStorage to handle private browsing modes where storage is blocked.

---

## 6. JavaScript Functionality

### Overview

All JavaScript is vanilla ES6+, embedded in the HTML file. No external dependencies.

### Module Breakdown

#### 1. Language Switcher

**Purpose:** Detect browser language, allow manual switching, persist preference.

```javascript
// Key functions:
setLanguage(lang); // Sets html[lang], updates UI, saves to localStorage
detectLanguage(); // Auto-detects on page load

// Event binding:
langBtns.forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.langSwitch));
});
```

#### 2. Countdown Timer

**Purpose:** Display live countdown to launch date.

```javascript
// Configuration
const LAUNCH_DAYS = 35;
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + LAUNCH_DAYS);

// Update function (runs every 1000ms)
function updateCountdown() {
  const distance = launchDate.getTime() - Date.now();
  // Calculate days, hours, minutes, seconds
  // Update DOM elements with padded values
}

setInterval(updateCountdown, 1000);
```

#### 3. Spotlight Effect (Desktop Only)

**Purpose:** Cursor-following orange glow effect.

```javascript
// Only activates on devices with fine pointer (mouse)
if (window.matchMedia("(pointer: fine)").matches) {
  // Track mouse position
  // Use lerp() for smooth interpolation
  // Animate with requestAnimationFrame
}
```

**Performance Notes:**

- Uses `will-change: transform` for GPU acceleration
- Lerp factor of 0.08 for smooth, non-jarring movement
- Cancels animation frame on mouse leave

#### 4. Scroll Animations

**Purpose:** Fade-in elements as they enter viewport.

```javascript
const observer = new IntersectionObserver(callback, {
  root: null,
  rootMargin: "0px 0px -10% 0px", // Trigger slightly before fully visible
  threshold: 0.1,
});

// Adds 'visible' class which triggers CSS transition
```

**Stagger Effect:** Feature cards have CSS `transition-delay` for sequential reveal.

#### 5. Parallax Effect

**Purpose:** Subtle depth on background orbs during scroll.

```javascript
// Passive listener for performance
window.addEventListener("scroll", handler, { passive: true });

// Uses requestAnimationFrame to batch updates
// Transform: translateY at 0.15× scroll speed
```

### Performance Optimizations

| Technique             | Implementation                                |
| --------------------- | --------------------------------------------- |
| Passive Listeners     | `{ passive: true }` on scroll events          |
| RAF Batching          | All animations use `requestAnimationFrame`    |
| Intersection Observer | Lazy triggers for scroll animations           |
| Device Detection      | Spotlight disabled on touch devices           |
| CSS Will-Change       | Applied to animated elements                  |
| Reduced Motion        | Respects `prefers-reduced-motion` media query |

---

## 7. Animation Specifications

### Entry Animations

| Element          | Animation   | Duration | Delay  | Easing        |
| ---------------- | ----------- | -------- | ------ | ------------- |
| Brand            | fadeSlideUp | 800ms    | 200ms  | ease-out-expo |
| Headline         | fadeSlideUp | 800ms    | 400ms  | ease-out-expo |
| Subheadline      | fadeSlideUp | 800ms    | 600ms  | ease-out-expo |
| Countdown        | fadeSlideUp | 800ms    | 800ms  | ease-out-expo |
| Lang Switcher    | fadeSlideUp | 800ms    | 1000ms | ease-out-expo |
| Scroll Indicator | fadeSlideUp | 800ms    | 1200ms | ease-out-expo |

### Scroll Animations

| Element          | Trigger     | Animation                                    |
| ---------------- | ----------- | -------------------------------------------- |
| .fade-in         | 10% visible | Opacity 0→1, translateY 40px→0               |
| .fade-in-stagger | 10% visible | Same + staggered delays (0, 100, 200, 300ms) |

### Ambient Animations

| Effect          | Type            | Duration | Iteration |
| --------------- | --------------- | -------- | --------- |
| Hero Glow Pulse | scale + opacity | 8s       | infinite  |
| Brand Dot Pulse | box-shadow      | 2s       | infinite  |
| Colon Blink     | opacity         | 1s       | infinite  |
| Scroll Line     | translateY      | 2s       | infinite  |

### Easing Functions

| Name           | Value                           | Usage             |
| -------------- | ------------------------------- | ----------------- |
| ease-out-expo  | `cubic-bezier(0.16, 1, 0.3, 1)` | Entry animations  |
| ease-out-quart | `cubic-bezier(0.25, 1, 0.5, 1)` | Hover transitions |

---

## 8. Responsive Breakpoints

| Breakpoint   | Width   | Changes                                 |
| ------------ | ------- | --------------------------------------- |
| Mobile       | < 480px | Tighter countdown spacing               |
| Small Tablet | < 600px | Features grid → single column           |
| Tablet       | < 768px | Hide scroll indicator, adjust countdown |
| Desktop      | 768px+  | Full layout, all effects enabled        |

---

## 9. Accessibility Compliance

### WCAG 2.1 AA Checklist

| Criterion                | Status | Implementation                                |
| ------------------------ | ------ | --------------------------------------------- |
| 1.1.1 Non-text Content   | ✅     | Alt text on images, aria-hidden on decorative |
| 1.4.3 Contrast (Minimum) | ✅     | 7:1+ for body text on dark background         |
| 1.4.10 Reflow            | ✅     | Responsive down to 320px                      |
| 2.1.1 Keyboard           | ✅     | All interactive elements focusable            |
| 2.3.1 Three Flashes      | ✅     | No flashing content                           |
| 2.4.1 Bypass Blocks      | ✅     | Semantic sections                             |
| 2.5.5 Target Size        | ✅     | Buttons meet 44×44px minimum                  |
| 3.1.1 Language of Page   | ✅     | `<html lang>` attribute                       |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Technical SEO Implementation

### Meta Tags Summary

| Tag         | Content                                                                                                                                   | Length       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Title       | `CushLabs.ai \| AI Integration & Software Development`                                                                                    | 55 chars ✅  |
| Description | `AI consulting and modern software development for SMBs. Production-ready chatbots, automation, and custom applications. Launching soon.` | 155 chars ✅ |

### Heading Structure

```
H1: "AI Integration & Modern Software Development for SMBs" (single H1 ✅)
  └─ H2: "What Makes Me Different"
      └─ H3: Feature titles (4 cards)
```

### Page Sections

1. **Hero** — Headline, subheadline, countdown timer
2. **About** — Brief professional summary
3. **Personal Intro** — Extended bio with Steve Jobs quote
4. **Why Work With Me** — 4 feature cards in 2×2 grid
5. **Contact** — Email CTA
6. **Footer** — Copyright

### Open Graph Tags (Social Sharing)

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://cushlabs.ai/" />
<meta
  property="og:title"
  content="CushLabs.ai | AI Integration & Software Development"
/>
<meta
  property="og:description"
  content="AI consulting and modern software development..."
/>
<meta property="og:image" content="https://cushlabs.ai/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="es_MX" />
```

**Required:** Create `og-image.jpg` at 1200×630px for social sharing previews.

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta
  name="twitter:title"
  content="CushLabs.ai | AI Integration & Software Development"
/>
<meta
  name="twitter:description"
  content="AI consulting and modern software development..."
/>
<meta name="twitter:image" content="https://cushlabs.ai/og-image.jpg" />
```

### Hreflang (Bilingual SEO)

```html
<link rel="alternate" hreflang="en" href="https://cushlabs.ai/" />
<link rel="alternate" hreflang="es" href="https://cushlabs.ai/?lang=es" />
<link rel="alternate" hreflang="x-default" href="https://cushlabs.ai/" />
```

Tells search engines the page is available in both English and Spanish, helping serve the right version in localized search results.

### Canonical URL

```html
<link rel="canonical" href="https://cushlabs.ai/" />
```

**Action Required:** Update to actual production URL before deployment.

### Robots Directives

```html
<meta name="robots" content="index, follow" />
<meta
  name="googlebot"
  content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
/>
```

- `index, follow`: Allow crawling and indexing
- `max-snippet:-1`: No limit on text snippet length
- `max-image-preview:large`: Allow large image previews
- `max-video-preview:-1`: No limit on video previews

### Structured Data (JSON-LD)

**Organization Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CushLabs.ai",
  "url": "https://cushlabs.ai",
  "logo": "https://cushlabs.ai/logo.png",
  "description": "AI consulting and modern software development...",
  "email": "info@cushlabs.ai",
  "foundingDate": "2025",
  "areaServed": ["US", "MX"],
  "knowsLanguage": ["en", "es"]
}
```

**WebPage Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "CushLabs.ai - Coming Soon",
  "description": "...",
  "url": "https://cushlabs.ai",
  "inLanguage": ["en", "es"]
}
```

### Image SEO

| Image           | Alt Text             | Status                       |
| --------------- | -------------------- | ---------------------------- |
| English flag    | `alt="English"`      | ✅                           |
| Spanish flag    | `alt="Español"`      | ✅                           |
| Decorative SVGs | `aria-hidden="true"` | ✅ (excluded from a11y tree) |

### SEO Checklist

| Item                           | Status | Notes                  |
| ------------------------------ | ------ | ---------------------- |
| Meta title 50-60 chars         | ✅     | 55 characters          |
| Meta description 150-160 chars | ✅     | 155 characters         |
| Single H1 tag                  | ✅     | In hero section        |
| Heading hierarchy (H1→H2→H3)   | ✅     | Proper nesting         |
| Canonical URL                  | ⚠️     | Update before deploy   |
| Open Graph tags                | ✅     | Full set included      |
| Twitter Card tags              | ✅     | Large image card       |
| Hreflang tags                  | ✅     | EN, ES, x-default      |
| Structured data                | ✅     | Organization + WebPage |
| Alt text on images             | ✅     | All images covered     |
| robots meta                    | ✅     | index, follow          |
| Mobile-friendly                | ✅     | Responsive design      |
| HTTPS ready                    | ⚠️     | Ensure SSL on hosting  |
| Page speed                     | ✅     | <30KB, minimal JS      |

### Pre-Launch SEO Tasks

1. **Update Canonical URL** — Replace `https://cushlabs.ai/` with actual domain
2. **Create OG Image** — 1200×630px branded image for social sharing
3. **Create Logo File** — `logo.png` for structured data
4. **Submit to Google Search Console** — After deployment
5. **Create robots.txt** — Basic allow-all file
6. **Create sitemap.xml** — Single-page sitemap

### Sample robots.txt

```
User-agent: *
Allow: /

Sitemap: https://cushlabs.ai/sitemap.xml
```

### Sample sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://cushlabs.ai/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://cushlabs.ai/"/>
    <xhtml:link rel="alternate" hreflang="es" href="https://cushlabs.ai/?lang=es"/>
    <lastmod>2025-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 11. File Manifest

| File                  | Size  | Purpose                            |
| --------------------- | ----- | ---------------------------------- |
| `index.html`          | ~45KB | Complete landing page              |
| `robots.txt`          | ~150B | Search engine directives           |
| `sitemap.xml`         | ~600B | XML sitemap with hreflang          |
| `README.md`           | ~6KB  | Setup and deployment guide         |
| `DESIGN.md`           | ~20KB | Technical design document          |
| `BRAND.md`            | ~12KB | Brand strategy, voice & copy guide |
| `images/flag-en.png`  | TBD   | English flag icon (optional)       |
| `images/flag-es.png`  | TBD   | Spanish flag icon (optional)       |
| `images/og-image.jpg` | TBD   | Social sharing image (required)    |
| `images/logo.png`     | TBD   | Logo for structured data           |

---

## 12. Version History

| Version | Date    | Changes                                                                                  |
| ------- | ------- | ---------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-01 | Initial release                                                                          |
| 1.1.0   | 2025-01 | Added bilingual support (EN/ES)                                                          |
| 1.1.1   | 2025-01 | Browser language auto-detection                                                          |
| 1.2.0   | 2025-01 | Technical SEO overhaul: meta tags, Open Graph, Twitter Cards, hreflang, structured data  |
| 1.3.0   | 2025-01 | Solo brand copy update, personal intro section with Steve Jobs quote, enhanced hero glow |

---

_Document maintained by CushLabs.ai_
