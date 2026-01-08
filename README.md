# CushLabs.ai — Website & Portfolio

A premium, bilingual (EN/ES) website for CushLabs.ai, an AI consulting and modern software development studio. Features an automated GitHub portfolio system.

## Overview

Static website with automated portfolio generation from GitHub repositories. The main landing page requires zero build step, while the `/work` portfolio uses a Node.js script to auto-generate project data from your GitHub repos.

## Features

### Main Site

- **Bilingual Support**: English and Spanish with automatic browser language detection
- **Responsive Design**: Mobile-first, fluid typography with `clamp()`, works across all devices
- **Performance Optimized**: ~30KB total, no external JS dependencies, lazy animations
- **Visual Effects**: Subtle parallax, cursor spotlight (desktop), smooth scroll animations
- **Live Countdown**: Dynamic timer counting down to launch date
- **Accessible**: Semantic HTML, ARIA labels, respects `prefers-reduced-motion`

### Portfolio System (`/work`)

- **Automated GitHub Integration**: Auto-generates portfolio from your GitHub repos
- **Metadata via Topics**: Use GitHub topics to categorize and tag projects
- **Weekly Auto-Updates**: GitHub Actions refreshes portfolio data automatically
- **Smart Demo Detection**: Extracts demo URLs from repo homepage, README, or GitHub Pages
- **Dynamic Filtering**: Client-side filtering by category, stack, and featured status
- **SEO Optimized**: Same domain authority, proper metadata, sitemap integration

## Quick Start

### 1. Install Dependencies (for portfolio generation)

```bash
npm install
```

### 2. Set Up GitHub Token

Create a `.env` file:

```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=cushdog
```

Get a token at: GitHub Settings → Developer settings → Personal access tokens → Generate (needs `public_repo` scope)

### 3. Generate Portfolio

```bash
npm run generate-projects
```

This creates `src/data/projects.generated.json` from your GitHub repos.

### 4. Deploy

Deploy the entire site to Vercel, Netlify, or any static host. The GitHub Actions workflow will automatically refresh your portfolio weekly.

### Local Preview

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` for the main site and `http://localhost:8000/work.html` for the portfolio.

## File Structure

```
cushlabs/
├── index.html                          # Main landing page
├── work.html                           # Portfolio page
├── work.js                             # Portfolio client-side rendering
├── robots.txt                          # Search engine crawler instructions
├── sitemap.xml                         # XML sitemap (includes /work)
├── package.json                        # Node dependencies
├── tsconfig.json                       # TypeScript config
├── README.md                           # This file
├── WORK_SETUP.md                       # Detailed portfolio setup guide
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── scripts/
│   └── generate-projects.ts            # GitHub repo scanner script
├── src/
│   └── data/
│       └── projects.generated.json     # Auto-generated portfolio data
├── .github/
│   └── workflows/
│       └── refresh-projects.yml        # Weekly auto-update workflow
└── images/                             # Optional assets
    ├── og-image.jpg                    # Social sharing image (1200x630px)
    └── logo.png                        # Logo for structured data
```

## Configuration

### Countdown Timer

The countdown is set to 35 days from page load. To set a fixed launch date, edit the JavaScript:

```javascript
// Current: 35 days from now
const LAUNCH_DAYS = 35;
const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + LAUNCH_DAYS);

// Alternative: Fixed date
const launchDate = new Date("2025-02-01T00:00:00");
```

### Flag Images

Replace the placeholder SVGs with your flag images:

```html
<!-- English (around line 180) -->
<img class="lang-flag" src="images/flag-en.png" alt="English" />

<!-- Spanish (around line 185) -->
<img class="lang-flag" src="images/flag-es.png" alt="Español" />
```

Recommended dimensions: 20×14px (3:2 or 4:3 aspect ratio)

### Contact Email

Update the mailto link in the Contact section:

```html
<a href="mailto:info@cushlabs.ai" class="contact-email">info@cushlabs.ai</a>
```

## SEO Checklist

The page includes comprehensive technical SEO. Before launch, complete these items:

### Required Actions

| Task                 | File                  | Action                                            |
| -------------------- | --------------------- | ------------------------------------------------- |
| Update canonical URL | `index.html`          | Replace `https://cushlabs.ai/` with actual domain |
| Update sitemap URLs  | `sitemap.xml`         | Replace domain placeholder                        |
| Update robots.txt    | `robots.txt`          | Replace domain in sitemap reference               |
| Create OG image      | `images/og-image.jpg` | 1200×630px branded image for social shares        |
| Create logo          | `images/logo.png`     | Logo file for structured data                     |

### Included SEO Features

- **Meta tags**: Optimized title (55 chars) and description (155 chars)
- **Open Graph**: Full Facebook/LinkedIn sharing tags
- **Twitter Cards**: Large image card format
- **Hreflang**: Bilingual support (EN/ES) for international SEO
- **Structured Data**: Organization + WebPage JSON-LD schemas
- **Robots**: Proper indexing directives
- **Canonical**: Self-referencing canonical URL
- **Heading hierarchy**: Single H1, proper H2/H3 nesting

### Post-Launch

1. Submit sitemap to Google Search Console
2. Verify structured data with Google Rich Results Test
3. Test social sharing with Facebook Debugger and Twitter Card Validator

## Browser Support

| Browser        | Version | Support |
| -------------- | ------- | ------- |
| Chrome         | 80+     | ✅ Full |
| Safari         | 13+     | ✅ Full |
| Firefox        | 75+     | ✅ Full |
| Edge           | 80+     | ✅ Full |
| iOS Safari     | 13+     | ✅ Full |
| Android Chrome | 80+     | ✅ Full |

Older browsers gracefully degrade (no animations, basic layout preserved).

## Performance

| Metric                  | Target  | Actual           |
| ----------------------- | ------- | ---------------- |
| Total Size              | < 50KB  | ~30KB            |
| External Requests       | Minimal | 2 (Google Fonts) |
| Time to Interactive     | < 1s    | ~500ms           |
| Cumulative Layout Shift | 0       | 0                |

### Optimization Notes

- Fonts preconnected for faster loading
- Intersection Observer for lazy scroll animations
- `requestAnimationFrame` for smooth parallax/spotlight
- Passive event listeners on scroll
- `will-change` hints for GPU acceleration

## Customization

### Colors

Edit CSS custom properties in `:root`:

```css
--color-black: #000000;
--color-white: #ffffff;
--color-orange: #ff6a3d; /* Primary accent */
--color-orange-glow: rgba(255, 106, 61, 0.15);
```

### Fonts

Currently uses Google Fonts (Space Grotesk + Source Serif 4). To change:

1. Update the `<link>` tag in `<head>`
2. Update `--font-display` and `--font-body` in CSS

### Content

All text content is inline in the HTML. Search for `data-lang="en"` and `data-lang="es"` to find translatable strings.

## Accessibility

- Semantic HTML5 elements (`<header>`, `<section>`, `<article>`, `<footer>`)
- ARIA labels on interactive elements
- Sufficient color contrast (WCAG AA)
- Keyboard navigable
- Respects `prefers-reduced-motion` media query
- Screen reader compatible

## License

© 2025 CushLabs.ai — All rights reserved.

## Portfolio Setup

For detailed instructions on setting up and customizing the automated portfolio, see **[WORK_SETUP.md](./WORK_SETUP.md)**.

### Quick Portfolio Tips

1. **Add topics to your repos** following the convention:

   - `featured` - Highlight on portfolio
   - `cat-ai`, `cat-web`, `cat-automation` - Categories
   - `stack-nextjs`, `stack-react`, `stack-python` - Tech stack
   - `status-shipped`, `status-wip` - Project status

2. **Set repo homepage** to your demo URL in GitHub repo settings

3. **Run generator** locally to test before deploying

4. **GitHub Actions** handles weekly updates automatically

## Support

For questions or issues: info@cushlabs.ai
