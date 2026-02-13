# CushLabs Brand & Design System

> Reference guide for maintaining consistent CushLabs branding across all repositories.
> Copy this file into any new repo's `docs/` folder or reference it from CLAUDE.md.

---

## Brand Identity

| Attribute | Value |
|-----------|-------|
| **Company** | CushLabs.ai |
| **Tagline** | AI Integration & Software Development Consulting |
| **Languages** | English (default), Spanish (ES) — fully bilingual |
| **Markets** | US and Mexico |
| **Tone** | Professional B2B, trustworthy, modern — clean and conversion-focused without being pushy |

---

## Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `cush-orange` | `#FF6A3D` | Primary accent — CTAs, links, hover states, badges, theme-color meta |
| `cush-black` | `#000000` | Primary text, dark backgrounds |

### Gray Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `cush-gray-900` | `#0A0A0A` | Darkest background surfaces |
| `cush-gray-800` | `#141414` | Dark card/section backgrounds |
| `cush-gray-700` | `#1A1A1A` | Dark mode borders |
| `cush-gray-600` | `#2A2A2A` | Dark mode secondary surfaces |
| `cush-gray-400` | `#666666` | Muted text (dark mode) |
| `cush-gray-300` | `#888888` | Placeholder text |
| `cush-gray-200` | `#AAAAAA` | Disabled/subtle text |

### Theme Variables (CSS Custom Properties)

```css
:root {
  /* Light theme */
  --bg: 255 255 255;
  --fg: 17 17 17;
  --muted: 75 85 99;
  --surface: 245 245 245;
  --border: 229 231 235;
  --color-orange-glow: rgba(255, 106, 61, 0.15);
  --color-orange-soft: rgba(255, 106, 61, 0.08);
}

.dark {
  /* Dark theme */
  --bg: 0 0 0;
  --fg: 255 255 255;
  --muted: 170 170 170;
  --surface: 20 20 20;
  --border: 26 26 26;
}
```

### Orange Opacity Scale

Use these consistently for orange accents at different intensities:

| Class | Usage |
|-------|-------|
| `bg-cush-orange` | Solid fills (CTAs, active states) |
| `bg-cush-orange/90` | Hover state on solid buttons |
| `bg-cush-orange/25` | Shadow glow on CTAs |
| `bg-cush-orange/20` | Highlighted badges |
| `bg-cush-orange/10` | Icon backgrounds, subtle accent areas |
| `text-cush-orange` | Links, accent text, hover states |

### Text Selection

Always use orange selection highlighting:

```css
::selection {
  background-color: #FF6A3D;
  color: #000000;
}
```

---

## Typography

### Font Stack

| Role | Font | Weights | Fallback |
|------|------|---------|----------|
| **Display** (headings, nav, buttons) | Space Grotesk | 500, 600, 700 | `sans-serif` |
| **Body** (paragraphs, content) | Source Serif 4 | 300, 400, 500 | `Georgia, serif` |

### Google Fonts Import

```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&display=swap
```

### Type Scale

| Element | Classes |
|---------|---------|
| **H1** | `font-display text-4xl md:text-5xl lg:text-6xl font-bold` |
| **H2** | `font-display text-3xl md:text-4xl font-bold` |
| **H3** | `font-display text-xl font-semibold` |
| **Section label** | `text-sm font-display font-semibold uppercase tracking-wider` |
| **Body** | `text-lg text-gray-600 dark:text-gray-400 leading-relaxed` |
| **Small/meta** | `text-sm text-gray-500 dark:text-gray-400` |

### Design Principle

The **Serif + Sans contrast** is core to the CushLabs look: modern geometric headings (Space Grotesk) paired with warm, readable body text (Source Serif 4). Never use the body font for headings or vice versa.

---

## Spacing

### Section Spacing

| Size | Classes | Use |
|------|---------|-----|
| `sm` | `py-12` | Compact supplementary sections |
| `md` | `py-16 md:py-20` | Standard content sections |
| `lg` | `py-20 md:py-28` | Primary sections (default) |
| `xl` | `py-24 md:py-32` | Hero-level sections |

### Container Widths

| Size | Class | Use |
|------|-------|-----|
| `sm` | `max-w-3xl` | Narrow content (blog posts, forms) |
| `md` | `max-w-5xl` | Standard content |
| `lg` | `max-w-7xl` | Full-width sections (default) |
| `xl` | `max-w-[1400px]` | Extra-wide layouts |

All containers use `px-4 sm:px-6 lg:px-8 mx-auto` for horizontal padding.

### Common Gaps

| Context | Class |
|---------|-------|
| Card grids | `gap-6` or `gap-8` |
| List items | `space-y-3` or `space-y-4` |
| Inline elements | `gap-2` or `gap-3` |
| Section heading to content | `mb-12` or `mb-16` |

---

## Border Radius

| Class | Usage |
|-------|-------|
| `rounded-md` | Small elements (logos, tiny icons) |
| `rounded-lg` | Buttons, form inputs, theme toggle |
| `rounded-xl` | Cards, feature boxes, FAQ items, testimonials |
| `rounded-full` | Badges, status dots, avatars, pill shapes |

**Default for cards and content blocks: `rounded-xl`**

---

## Shadows

Shadows are used sparingly — mostly on interaction, never aggressive.

| Context | Classes |
|---------|---------|
| **Primary CTA (default)** | `shadow-lg shadow-cush-orange/25` |
| **Primary CTA (hover)** | `hover:shadow-xl hover:shadow-cush-orange/30` |
| **Card (hover)** | `hover:shadow-lg hover:shadow-cush-orange/5` |
| **Decorative blurs** | `blur-3xl`, `blur-[80px]`, `blur-[100px]`, `blur-[120px]` |

### Glow Utility

```css
.glow-orange {
  box-shadow: 0 0 20px rgba(255, 106, 61, 0.15);
}
```

---

## Buttons & CTAs

### Primary CTA (Orange)

```html
<a class="inline-flex items-center gap-2 px-6 py-3 bg-cush-orange text-white
  font-display font-semibold rounded-lg hover:bg-cush-orange/90
  transition-all duration-300 shadow-lg shadow-cush-orange/25
  hover:shadow-xl hover:shadow-cush-orange/30 group">
  Label
  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform">...</svg>
</a>
```

### Secondary CTA (Bordered)

```html
<a class="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300
  dark:border-gray-600 text-gray-900 dark:text-white font-display font-semibold
  rounded-lg hover:border-cush-orange hover:text-cush-orange
  dark:hover:border-cush-orange dark:hover:text-cush-orange
  transition-all duration-300">
  Label
</a>
```

### Ghost/Link CTA

```html
<a class="inline-flex items-center gap-2 text-cush-orange font-medium hover:underline">
  Label
</a>
```

### Button Sizing

| Size | Padding |
|------|---------|
| Medium (default) | `px-6 py-3` |
| Large (hero CTAs) | `px-8 py-4` |

---

## Cards

### Standard Card Pattern

```html
<div class="group p-6 rounded-xl border border-gray-200 dark:border-gray-800
  bg-white dark:bg-gray-900/50 hover:border-cush-orange/50
  hover:shadow-lg hover:shadow-cush-orange/5 transition-all duration-300">

  <!-- Icon container -->
  <div class="w-12 h-12 rounded-lg bg-cush-orange/10 flex items-center
    justify-center mb-4 group-hover:bg-cush-orange group-hover:text-white
    transition-colors duration-300">
    <svg class="w-6 h-6">...</svg>
  </div>

  <h3 class="font-display font-semibold text-gray-900 dark:text-white mb-2">Title</h3>
  <p class="text-sm text-gray-600 dark:text-gray-400">Description</p>
</div>
```

Key patterns:
- Use `group` on the card wrapper for coordinated hover effects
- Icon backgrounds transition from `bg-cush-orange/10` to `bg-cush-orange` on hover
- Border shifts to `border-cush-orange/50` on hover
- Always include dark mode variants

---

## Animations & Transitions

### Standard Transitions

| Context | Classes |
|---------|---------|
| Color changes | `transition-colors duration-300` |
| Multi-property (border + shadow + color) | `transition-all duration-300` |
| Transform effects | `transition-transform duration-300` |
| Opacity | `transition-opacity` |

### Entrance Animations

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Stagger with `animation-delay: 0.1s`, `0.2s`, `0.3s`.

### Aurora Background Effect

Large, slow-moving gradient orbs for hero sections:

```css
@keyframes aurora-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes aurora-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 20px) scale(0.9); }
  66% { transform: translate(30px, -30px) scale(1.1); }
}
```

Duration: 20-25s, `ease-in-out infinite`.

### Interactive Hover States

| Element | Effect |
|---------|--------|
| CTA arrow icon | `group-hover:translate-x-1` |
| FAQ chevron | `group-open:rotate-180` |
| Card icon bg | `group-hover:bg-cush-orange group-hover:text-white` |

### Accessibility: Reduced Motion

Always include:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-aurora-1, .animate-aurora-2 { animation: none; }
  .animate-fade-in, .animate-fade-in-delay { animation: none; opacity: 1; }
}
```

---

## Dark Mode

### Implementation

- Tailwind `darkMode: ['class']` — toggled via `.dark` class on `<html>`
- Stored in `localStorage` key `"theme"` (`"dark"` or `"light"`)
- Toggled via `[data-theme-toggle]` button

### Pattern

Every visual element needs both light and dark variants:

```html
<!-- Background -->
bg-white dark:bg-gray-900/50
bg-gray-50 dark:bg-gray-900

<!-- Text -->
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400

<!-- Borders -->
border-gray-200 dark:border-gray-800

<!-- Hover -->
hover:text-cush-orange dark:hover:text-cush-orange
```

Dark mode is a first-class citizen, not an afterthought. Always test both themes.

---

## Gradients & Backgrounds

### Page Background Layers

1. **Subtle gradient overlay**: `bg-gradient-to-b from-black/5 via-transparent to-transparent` (light) / `from-cush-gray-800/50` (dark)
2. **Noise texture**: SVG fractal noise at `opacity-[0.015]` for subtle grain

### Section Gradients

```
bg-gradient-to-b from-black/50 via-black/60 to-background  (hero overlays)
bg-gradient-to-b from-white/50 via-transparent to-white     (light fade-outs)
bg-gradient-to-r from-foreground to-muted                   (text gradients)
```

### Text Gradient Utility

```css
.text-gradient {
  @apply bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent;
}
```

---

## Tailwind Config (Portable)

Drop this into any new repo's `tailwind.config.mjs`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg) / <alpha-value>)',
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'cush-orange': '#FF6A3D',
        'cush-black': '#000000',
        'cush-gray': {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1A1A1A',
          600: '#2A2A2A',
          400: '#666666',
          300: '#888888',
          200: '#AAAAAA',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
```

---

## Global CSS (Portable)

Drop this into any new repo's global stylesheet:

```css
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,400&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg: 255 255 255;
    --fg: 17 17 17;
    --muted: 75 85 99;
    --surface: 245 245 245;
    --border: 229 231 235;
    --color-orange-glow: rgba(255, 106, 61, 0.15);
    --color-orange-soft: rgba(255, 106, 61, 0.08);
  }

  .dark {
    --bg: 0 0 0;
    --fg: 255 255 255;
    --muted: 170 170 170;
    --surface: 20 20 20;
    --border: 26 26 26;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: rgb(var(--bg));
    color: rgb(var(--fg));
    @apply font-body overflow-x-hidden min-h-screen;
  }

  ::selection {
    @apply bg-cush-orange text-black;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent;
  }

  .glow-orange {
    box-shadow: 0 0 20px var(--color-orange-glow);
  }
}
```

---

## Design Principles Summary

1. **Minimal & modern** — No-frills functionality with subtle animations
2. **Orange as punctuation** — `#FF6A3D` is the visual accent, not the dominant color
3. **Dark mode native** — Equal treatment, not an afterthought
4. **Serif + Sans contrast** — Geometric headings, warm body text
5. **Generous whitespace** — Let content breathe with large section spacing
6. **Shadows on interaction only** — Never aggressive, only on hover/focus
7. **Grouped hover states** — Coordinated transitions using Tailwind `group`
8. **Accessibility first** — Reduced motion support, semantic HTML, proper contrast
9. **Professional B2B tone** — Clean, trustworthy, conversion-focused without being pushy
