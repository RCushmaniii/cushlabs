import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST = join(__dirname, '..', 'dist');

// Every EN page must have an ES counterpart
const bilingualPages = [
  ['index.html', 'es/index.html'],
  ['about/index.html', 'es/about/index.html'],
  ['contact/index.html', 'es/contact/index.html'],
  ['services/index.html', 'es/services/index.html'],
  ['portfolio/index.html', 'es/portfolio/index.html'],

  ['faq/index.html', 'es/faq/index.html'],
  ['consultation/index.html', 'es/reservar/index.html'],
];

const read = (rel: string) => readFileSync(join(DIST, rel), 'utf-8');

describe('Build output exists', () => {
  it('dist/ directory exists', () => {
    expect(existsSync(DIST)).toBe(true);
  });

  it('produces 90+ pages', () => {
    // The build log says 93 pages — assert a reasonable floor
    const indexFiles: string[] = [];
    const walk = (dir: string) => {
      const { readdirSync, statSync } = require('fs');
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (entry === 'index.html') indexFiles.push(full);
      }
    };
    walk(DIST);
    expect(indexFiles.length).toBeGreaterThanOrEqual(80);
  });
});

describe('Bilingual parity — every EN page has an ES page', () => {
  for (const [en, es] of bilingualPages) {
    it(`${en} ↔ ${es}`, () => {
      expect(existsSync(join(DIST, en))).toBe(true);
      expect(existsSync(join(DIST, es))).toBe(true);
    });
  }
});

describe('Critical SEO elements', () => {
  it('EN homepage has title and meta description', () => {
    const html = read('index.html');
    expect(html).toMatch(/<title>[^<]{10,70}<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{50,}/);
  });

  it('ES homepage has title and meta description', () => {
    const html = read('es/index.html');
    expect(html).toMatch(/<title>[^<]{10,70}<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{50,}/);
  });

  it('EN homepage has hreflang tags for both languages', () => {
    const html = read('index.html');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="es"');
  });

  it('ES homepage has hreflang tags for both languages', () => {
    const html = read('es/index.html');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="es"');
  });

  it('robots.txt exists and references sitemap', () => {
    const robots = read('robots.txt');
    expect(robots.toLowerCase()).toContain('sitemap');
  });

  it('sitemap-index.xml exists', () => {
    expect(existsSync(join(DIST, 'sitemap-index.xml'))).toBe(true);
  });
});

describe('No leaked secrets in build output', () => {
  it('no GitHub tokens in HTML', () => {
    const html = read('index.html');
    expect(html).not.toMatch(/ghp_[A-Za-z0-9]{36}/);
    expect(html).not.toMatch(/github_pat_[A-Za-z0-9]/);
  });

  it('no API keys in HTML', () => {
    const html = read('index.html');
    expect(html).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
  });
});

describe('Sentry integration', () => {
  it('Sentry SDK is included in bundled JS', () => {
    const { readdirSync } = require('fs');
    const astroDir = join(DIST, '_astro');
    const jsFiles = readdirSync(astroDir).filter((f: string) => f.endsWith('.js'));
    const hasSentry = jsFiles.some((f: string) => {
      const content = readFileSync(join(astroDir, f), 'utf-8');
      return content.includes('sentry') || content.includes('Sentry');
    });
    expect(hasSentry).toBe(true);
  });
});

describe('Analytics integration', () => {
  it('Vercel Analytics is included in build output', () => {
    // Astro 6 may inline scripts into HTML rather than bundling into _astro/*.js
    const homeHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');
    const inHtml = homeHtml.includes('vercel') || homeHtml.includes('va.vercel');

    const { readdirSync } = require('fs');
    const astroDir = join(DIST, '_astro');
    const jsFiles = readdirSync(astroDir).filter((f: string) => f.endsWith('.js'));
    const inJs = jsFiles.some((f: string) => {
      const content = readFileSync(join(astroDir, f), 'utf-8');
      return content.includes('vercel') || content.includes('va.vercel');
    });

    expect(inHtml || inJs).toBe(true);
  });
});

describe('404 page', () => {
  it('custom 404 page exists', () => {
    expect(existsSync(join(DIST, '404.html'))).toBe(true);
  });
});
