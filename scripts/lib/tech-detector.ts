/**
 * Tech Detection Engine
 *
 * Scans a local repo directory and returns detected technologies with evidence.
 * Detection layers (ordered by signal strength):
 *   1. Dependency manifests (package.json, requirements.txt, pyproject.toml)
 *   2. Config files (next.config.*, astro.config.*, etc.)
 *   3. Pattern detection (PWA files, i18n dirs, Tauri/Capacitor)
 *   4. Dependency-to-tech mapping (~100 known mappings)
 *
 * Shared by audit-portfolio.ts and generate-skills.ts.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';

// ── Types ──────────────────────────────────────────────────────────

export type TechCategory =
  | 'language'
  | 'framework'
  | 'database'
  | 'api'
  | 'platform'
  | 'pattern'
  | 'tool'
  | 'library';

export type Confidence = 'definite' | 'likely' | 'possible';

export interface DetectedTech {
  name: string;
  category: TechCategory;
  confidence: Confidence;
  evidence: string;
  isDevOnly?: boolean; // true for ESLint, Prettier, etc.
}

export interface RepoScanResult {
  repo: string;
  repoDir: string;
  detected: DetectedTech[];
  portfolioStack: string[]; // tech_stack from PORTFOLIO.md
  errors: string[];
}

// ── Dependency-to-tech mappings ─────────────────────────────────────

interface DepMapping {
  name: string;
  category: TechCategory;
  isDevOnly?: boolean;
  /** If provided, use this display name instead of the raw mapping name */
  displayName?: (version?: string) => string;
}

/**
 * Maps npm package names to human-readable tech names.
 * Keys are package.json dependency names; values describe the tech.
 */
const NPM_DEP_MAP: Record<string, DepMapping> = {
  // Frameworks
  'next': { name: 'Next.js', category: 'framework', displayName: (v) => v ? `Next.js ${extractMajor(v)}` : 'Next.js' },
  'react': { name: 'React', category: 'framework', displayName: (v) => v ? `React ${extractMajor(v)}` : 'React' },
  'astro': { name: 'Astro', category: 'framework', displayName: (v) => v ? `Astro ${extractMajor(v)}` : 'Astro' },
  'vue': { name: 'Vue.js', category: 'framework', displayName: (v) => v ? `Vue.js ${extractMajor(v)}` : 'Vue.js' },
  'svelte': { name: 'Svelte', category: 'framework' },
  'express': { name: 'Express.js', category: 'framework' },
  'fastify': { name: 'Fastify', category: 'framework' },
  'hono': { name: 'Hono', category: 'framework' },
  'elysia': { name: 'Elysia', category: 'framework' },

  // CSS / UI
  'tailwindcss': { name: 'Tailwind CSS', category: 'framework', displayName: (v) => v ? `Tailwind CSS ${extractMajor(v)}` : 'Tailwind CSS' },
  '@shadcn/ui': { name: 'shadcn/ui', category: 'library' },

  // AI / LLM
  'openai': { name: 'OpenAI API', category: 'api' },
  '@anthropic-ai/sdk': { name: 'Anthropic Claude API', category: 'api' },
  'ai': { name: 'Vercel AI SDK', category: 'library' },
  '@ai-sdk/openai': { name: 'Vercel AI SDK (OpenAI)', category: 'library' },
  '@ai-sdk/anthropic': { name: 'Vercel AI SDK (Anthropic)', category: 'library' },
  'langchain': { name: 'LangChain', category: 'library' },
  '@langchain/core': { name: 'LangChain', category: 'library' },
  '@langchain/openai': { name: 'LangChain (OpenAI)', category: 'library' },
  'llamaindex': { name: 'LlamaIndex', category: 'library' },

  // Databases & ORMs
  'drizzle-orm': { name: 'Drizzle ORM', category: 'database' },
  'prisma': { name: 'Prisma', category: 'database' },
  '@prisma/client': { name: 'Prisma', category: 'database' },
  '@neondatabase/serverless': { name: 'Neon Postgres', category: 'database' },
  'pg': { name: 'PostgreSQL', category: 'database' },
  'postgres': { name: 'PostgreSQL', category: 'database' },
  '@supabase/supabase-js': { name: 'Supabase', category: 'database' },
  'mongoose': { name: 'MongoDB (Mongoose)', category: 'database' },
  'mongodb': { name: 'MongoDB', category: 'database' },
  'redis': { name: 'Redis', category: 'database' },
  'ioredis': { name: 'Redis', category: 'database' },
  'better-sqlite3': { name: 'SQLite', category: 'database' },
  'sql.js': { name: 'SQLite', category: 'database' },
  'pgvector': { name: 'pgvector', category: 'database' },

  // Auth
  '@clerk/nextjs': { name: 'Clerk', category: 'library' },
  '@clerk/clerk-react': { name: 'Clerk', category: 'library' },
  'next-auth': { name: 'NextAuth.js', category: 'library' },
  '@auth/core': { name: 'Auth.js', category: 'library' },

  // Payments
  'stripe': { name: 'Stripe', category: 'api' },
  '@stripe/stripe-js': { name: 'Stripe', category: 'api' },

  // Email
  'resend': { name: 'Resend', category: 'api' },
  '@sendgrid/mail': { name: 'SendGrid', category: 'api' },
  'nodemailer': { name: 'Nodemailer', category: 'library' },

  // Storage / CDN
  '@vercel/blob': { name: 'Vercel Blob Storage', category: 'platform' },
  '@aws-sdk/client-s3': { name: 'AWS S3 / R2', category: 'platform' },
  '@uploadthing/react': { name: 'UploadThing', category: 'library' },

  // Charts / Data Viz
  'recharts': { name: 'Recharts', category: 'library' },
  'chart.js': { name: 'Chart.js', category: 'library' },
  'd3': { name: 'D3.js', category: 'library' },
  '@nivo/core': { name: 'Nivo', category: 'library' },
  'plotly.js': { name: 'Plotly.js', category: 'library' },

  // Testing
  'vitest': { name: 'Vitest', category: 'tool', isDevOnly: true },
  'jest': { name: 'Jest', category: 'tool', isDevOnly: true },
  '@playwright/test': { name: 'Playwright', category: 'tool', isDevOnly: true },
  'cypress': { name: 'Cypress', category: 'tool', isDevOnly: true },

  // Dev tools (skip from skills, include in project listing)
  'eslint': { name: 'ESLint', category: 'tool', isDevOnly: true },
  'prettier': { name: 'Prettier', category: 'tool', isDevOnly: true },
  'typescript': { name: 'TypeScript', category: 'language', isDevOnly: true },
  'tsx': { name: 'tsx', category: 'tool', isDevOnly: true },

  // Misc libraries
  'zod': { name: 'Zod', category: 'library' },
  'react-hook-form': { name: 'React Hook Form', category: 'library' },
  'framer-motion': { name: 'Framer Motion', category: 'library' },
  'motion': { name: 'Motion', category: 'library' },
  'gsap': { name: 'GSAP', category: 'library' },
  'three': { name: 'Three.js', category: 'library' },
  '@react-three/fiber': { name: 'React Three Fiber', category: 'library' },
  'sharp': { name: 'sharp', category: 'library' },
  'gray-matter': { name: 'gray-matter', category: 'library' },
  'cheerio': { name: 'Cheerio', category: 'library' },
  'puppeteer': { name: 'Puppeteer', category: 'library' },
  'playwright': { name: 'Playwright', category: 'library' },
  'socket.io': { name: 'Socket.IO', category: 'library' },
  'ws': { name: 'WebSocket (ws)', category: 'library' },

  // Mobile / Desktop
  '@tauri-apps/api': { name: 'Tauri', category: 'framework' },
  '@capacitor/core': { name: 'Capacitor', category: 'framework' },
  'react-native': { name: 'React Native', category: 'framework' },
  'expo': { name: 'Expo', category: 'framework' },
  'electron': { name: 'Electron', category: 'framework' },

  // Scheduling / Queues
  'bullmq': { name: 'BullMQ', category: 'library' },
  'cron': { name: 'Cron Jobs', category: 'pattern' },
  'node-cron': { name: 'Cron Jobs', category: 'pattern' },

  // GraphQL
  'graphql': { name: 'GraphQL', category: 'library' },
  '@apollo/client': { name: 'Apollo GraphQL', category: 'library' },
  'urql': { name: 'URQL (GraphQL)', category: 'library' },

  // CMS
  'contentful': { name: 'Contentful', category: 'api' },
  '@sanity/client': { name: 'Sanity', category: 'api' },

  // Maps
  'mapbox-gl': { name: 'Mapbox GL', category: 'library' },
  'leaflet': { name: 'Leaflet', category: 'library' },
  '@react-google-maps/api': { name: 'Google Maps', category: 'api' },

  // i18n
  'next-intl': { name: 'next-intl', category: 'library' },
  'i18next': { name: 'i18next', category: 'library' },
  'react-i18next': { name: 'react-i18next', category: 'library' },

  // Scraping
  'axios': { name: 'Axios', category: 'library' },
  'node-fetch': { name: 'node-fetch', category: 'library' },

  // CLI
  'commander': { name: 'Commander.js', category: 'library' },
  'inquirer': { name: 'Inquirer.js', category: 'library' },
  'chalk': { name: 'Chalk', category: 'library' },
  'click': { name: 'Click', category: 'library' },

  // Form / validation
  '@hookform/resolvers': { name: 'React Hook Form', category: 'library' },

  // PDF
  'pdf-lib': { name: 'pdf-lib', category: 'library' },
  'jspdf': { name: 'jsPDF', category: 'library' },

  // Markdown
  'marked': { name: 'Marked', category: 'library' },
  'remark': { name: 'Remark', category: 'library' },
  'react-markdown': { name: 'react-markdown', category: 'library' },

  // Deployment
  'wrangler': { name: 'Cloudflare Workers', category: 'platform', isDevOnly: true },

  // Misc
  'exifr': { name: 'EXIF Extraction (exifr)', category: 'library' },
  'date-fns': { name: 'date-fns', category: 'library' },
  'dayjs': { name: 'dayjs', category: 'library' },
  'lodash': { name: 'Lodash', category: 'library' },
  'uuid': { name: 'UUID', category: 'library' },
  'nanoid': { name: 'nanoid', category: 'library' },
};

/**
 * Maps Python package names to human-readable tech names.
 */
const PYTHON_DEP_MAP: Record<string, DepMapping> = {
  // Frameworks
  'fastapi': { name: 'FastAPI', category: 'framework' },
  'flask': { name: 'Flask', category: 'framework' },
  'django': { name: 'Django', category: 'framework' },
  'streamlit': { name: 'Streamlit', category: 'framework' },
  'gradio': { name: 'Gradio', category: 'framework' },
  'uvicorn': { name: 'Uvicorn', category: 'tool' },

  // AI / LLM
  'openai': { name: 'OpenAI API', category: 'api' },
  'anthropic': { name: 'Anthropic Claude API', category: 'api' },
  'langchain': { name: 'LangChain', category: 'library' },
  'langchain-openai': { name: 'LangChain (OpenAI)', category: 'library' },
  'langchain-core': { name: 'LangChain', category: 'library' },
  'llama-index': { name: 'LlamaIndex', category: 'library' },
  'transformers': { name: 'Hugging Face Transformers', category: 'library' },

  // ML / Data Science
  'torch': { name: 'PyTorch', category: 'library' },
  'pytorch': { name: 'PyTorch', category: 'library' },
  'tensorflow': { name: 'TensorFlow', category: 'library' },
  'scikit-learn': { name: 'scikit-learn', category: 'library' },
  'sklearn': { name: 'scikit-learn', category: 'library' },
  'pandas': { name: 'pandas', category: 'library' },
  'numpy': { name: 'NumPy', category: 'library' },
  'scipy': { name: 'SciPy', category: 'library' },

  // Data Viz
  'matplotlib': { name: 'Matplotlib', category: 'library' },
  'seaborn': { name: 'Seaborn', category: 'library' },
  'plotly': { name: 'Plotly', category: 'library' },

  // Databases
  'sqlalchemy': { name: 'SQLAlchemy', category: 'database' },
  'psycopg2': { name: 'PostgreSQL', category: 'database' },
  'psycopg2-binary': { name: 'PostgreSQL', category: 'database' },
  'psycopg': { name: 'PostgreSQL', category: 'database' },
  'pymongo': { name: 'MongoDB', category: 'database' },
  'redis': { name: 'Redis', category: 'database' },
  'aiosqlite': { name: 'SQLite', category: 'database' },
  'sqlite3': { name: 'SQLite', category: 'database' },

  // Image / PDF processing
  'pillow': { name: 'Pillow', category: 'library' },
  'pil': { name: 'Pillow', category: 'library' },
  'pymupdf': { name: 'PyMuPDF', category: 'library' },
  'python-pptx': { name: 'python-pptx', category: 'library' },
  'reportlab': { name: 'ReportLab', category: 'library' },
  'cairosvg': { name: 'CairoSVG', category: 'library' },

  // Web scraping
  'beautifulsoup4': { name: 'Beautiful Soup', category: 'library' },
  'bs4': { name: 'Beautiful Soup', category: 'library' },
  'scrapy': { name: 'Scrapy', category: 'library' },
  'selenium': { name: 'Selenium', category: 'library' },
  'requests': { name: 'Requests', category: 'library' },
  'httpx': { name: 'HTTPX', category: 'library' },
  'aiohttp': { name: 'aiohttp', category: 'library' },

  // CLI
  'click': { name: 'Click', category: 'library' },
  'typer': { name: 'Typer', category: 'library' },
  'rich': { name: 'Rich', category: 'library' },

  // Auth
  'pyjwt': { name: 'JWT', category: 'library' },
  'python-jose': { name: 'JWT (JOSE)', category: 'library' },
  'passlib': { name: 'Passlib', category: 'library' },

  // Testing
  'pytest': { name: 'pytest', category: 'tool', isDevOnly: true },

  // Misc
  'pydantic': { name: 'Pydantic', category: 'library' },
  'celery': { name: 'Celery', category: 'library' },
  'boto3': { name: 'AWS SDK (boto3)', category: 'library' },
  'stripe': { name: 'Stripe', category: 'api' },
  'twilio': { name: 'Twilio', category: 'api' },
  'sendgrid': { name: 'SendGrid', category: 'api' },
  'jinja2': { name: 'Jinja2', category: 'library' },
  'python-dotenv': { name: 'dotenv', category: 'tool', isDevOnly: true },
  'python-multipart': { name: 'Multipart Form Handling', category: 'library' },
};

// ── Helpers ─────────────────────────────────────────────────────────

function extractMajor(version: string): string {
  const match = version.replace(/^[\^~>=<!\s]+/, '').match(/^(\d+)/);
  return match ? match[1] : '';
}

function fileExists(dir: string, ...paths: string[]): boolean {
  return existsSync(join(dir, ...paths));
}

function tryReadJson(filepath: string): any | null {
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

function tryReadText(filepath: string): string | null {
  try {
    return readFileSync(filepath, 'utf-8');
  } catch {
    return null;
  }
}

function globFiles(dir: string, pattern: RegExp, maxDepth: number = 2): string[] {
  const results: string[] = [];
  function walk(current: string, depth: number) {
    if (depth > maxDepth) return;
    try {
      const entries = readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(current, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules, .git, .next, dist, etc.
          if (['node_modules', '.git', '.next', '__pycache__', '.venv', 'venv', 'dist', '.vercel', '.turbo'].includes(entry.name)) continue;
          walk(fullPath, depth + 1);
        } else if (pattern.test(entry.name)) {
          results.push(fullPath);
        }
      }
    } catch {
      // Permission denied or other FS error
    }
  }
  walk(dir, 0);
  return results;
}

// ── Detection Layers ────────────────────────────────────────────────

function detectFromPackageJson(dir: string): DetectedTech[] {
  const results: DetectedTech[] = [];
  const pkgPath = join(dir, 'package.json');
  const pkg = tryReadJson(pkgPath);
  if (!pkg) return results;

  const allDeps: Record<string, { version: string; isDev: boolean }> = {};

  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    allDeps[name] = { version: version as string, isDev: false };
  }
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    if (!allDeps[name]) {
      allDeps[name] = { version: version as string, isDev: true };
    }
  }

  // Detect TypeScript as a language if it's in deps
  if (allDeps['typescript']) {
    results.push({
      name: 'TypeScript',
      category: 'language',
      confidence: 'definite',
      evidence: `package.json: typescript@${allDeps['typescript'].version}`,
    });
  }

  // Detect JavaScript as a base language
  results.push({
    name: 'JavaScript',
    category: 'language',
    confidence: 'definite',
    evidence: 'package.json exists',
  });

  for (const [depName, { version, isDev }] of Object.entries(allDeps)) {
    const mapping = NPM_DEP_MAP[depName];
    if (!mapping) continue;
    if (mapping.name === 'TypeScript') continue; // Already handled above

    const displayName = mapping.displayName ? mapping.displayName(version) : mapping.name;
    results.push({
      name: displayName,
      category: mapping.category,
      confidence: 'definite',
      evidence: `package.json: ${depName}@${version}`,
      isDevOnly: isDev && mapping.isDevOnly,
    });
  }

  // Detect shadcn/ui by looking for components.json or ui/ directory pattern
  if (!allDeps['@shadcn/ui'] && fileExists(dir, 'components.json')) {
    const componentsJson = tryReadJson(join(dir, 'components.json'));
    if (componentsJson?.['$schema']?.includes('shadcn') || componentsJson?.style) {
      results.push({
        name: 'shadcn/ui',
        category: 'library',
        confidence: 'definite',
        evidence: 'components.json (shadcn config)',
      });
    }
  }

  return results;
}

function detectFromRequirementsTxt(dir: string): DetectedTech[] {
  const results: DetectedTech[] = [];
  const reqPath = join(dir, 'requirements.txt');
  const content = tryReadText(reqPath);
  if (!content) return results;

  results.push({
    name: 'Python',
    category: 'language',
    confidence: 'definite',
    evidence: 'requirements.txt exists',
  });

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Extract package name (before version specifier)
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)/);
    if (!match) continue;

    const pkgName = match[1].toLowerCase();
    const mapping = PYTHON_DEP_MAP[pkgName];
    if (mapping) {
      results.push({
        name: mapping.name,
        category: mapping.category,
        confidence: 'definite',
        evidence: `requirements.txt: ${trimmed}`,
        isDevOnly: mapping.isDevOnly,
      });
    }
  }

  return results;
}

function detectFromPyprojectToml(dir: string): DetectedTech[] {
  const results: DetectedTech[] = [];
  const tomlPath = join(dir, 'pyproject.toml');
  const content = tryReadText(tomlPath);
  if (!content) return results;

  // If no requirements.txt, pyproject.toml confirms Python
  results.push({
    name: 'Python',
    category: 'language',
    confidence: 'definite',
    evidence: 'pyproject.toml exists',
  });

  // TOML dependency parsing — match any bracket array assignment
  // Handles dependencies, optional-dependencies sub-tables (web = [...], ocr = [...]), etc.
  // We scan all bracket arrays in the file and look for Python package patterns
  const depLines = content.match(/\w+\s*=\s*\[[\s\S]*?\]/g) || [];
  for (const block of depLines) {
    const deps = block.match(/"([^"]+)"/g) || [];
    for (const dep of deps) {
      const cleaned = dep.replace(/"/g, '').trim();
      const match = cleaned.match(/^([a-zA-Z0-9_-]+)/);
      if (!match) continue;

      const pkgName = match[1].toLowerCase();
      const mapping = PYTHON_DEP_MAP[pkgName];
      if (mapping) {
        results.push({
          name: mapping.name,
          category: mapping.category,
          confidence: 'definite',
          evidence: `pyproject.toml: ${cleaned}`,
          isDevOnly: mapping.isDevOnly,
        });
      }
    }
  }

  return results;
}

function detectFromConfigFiles(dir: string): DetectedTech[] {
  const results: DetectedTech[] = [];

  // Next.js config
  for (const cfg of ['next.config.js', 'next.config.mjs', 'next.config.ts']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Next.js', category: 'framework', confidence: 'definite', evidence: cfg });
      break;
    }
  }

  // Astro config
  for (const cfg of ['astro.config.mjs', 'astro.config.ts', 'astro.config.js']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Astro', category: 'framework', confidence: 'definite', evidence: cfg });
      break;
    }
  }

  // Drizzle config
  for (const cfg of ['drizzle.config.ts', 'drizzle.config.js']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Drizzle ORM', category: 'database', confidence: 'definite', evidence: cfg });
      break;
    }
  }

  // Playwright config
  for (const cfg of ['playwright.config.ts', 'playwright.config.js']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Playwright', category: 'tool', confidence: 'definite', evidence: cfg, isDevOnly: true });
      break;
    }
  }

  // Vercel deployment
  if (fileExists(dir, 'vercel.json') || fileExists(dir, '.vercel')) {
    results.push({ name: 'Vercel', category: 'platform', confidence: 'definite', evidence: 'vercel.json or .vercel/' });
  }

  // Cloudflare Workers / Wrangler
  for (const cfg of ['wrangler.toml', 'wrangler.json']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Cloudflare Workers', category: 'platform', confidence: 'definite', evidence: cfg });
      break;
    }
  }

  // Docker
  if (fileExists(dir, 'Dockerfile') || fileExists(dir, 'docker-compose.yml') || fileExists(dir, 'docker-compose.yaml')) {
    results.push({ name: 'Docker', category: 'platform', confidence: 'definite', evidence: 'Dockerfile or docker-compose' });
  }

  // Render
  if (fileExists(dir, 'render.yaml')) {
    results.push({ name: 'Render', category: 'platform', confidence: 'definite', evidence: 'render.yaml' });
  }

  // GitHub Actions
  if (fileExists(dir, '.github', 'workflows')) {
    results.push({ name: 'GitHub Actions', category: 'platform', confidence: 'definite', evidence: '.github/workflows/' });
  }

  // Tailwind config (backup if not caught via package.json)
  for (const cfg of ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs', 'tailwind.config.cjs']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'Tailwind CSS', category: 'framework', confidence: 'definite', evidence: cfg });
      break;
    }
  }

  // ESLint config
  for (const cfg of ['eslint.config.js', 'eslint.config.mjs', '.eslintrc.js', '.eslintrc.json', '.eslintrc']) {
    if (fileExists(dir, cfg)) {
      results.push({ name: 'ESLint', category: 'tool', confidence: 'definite', evidence: cfg, isDevOnly: true });
      break;
    }
  }

  // TypeScript config (backup)
  if (fileExists(dir, 'tsconfig.json')) {
    results.push({ name: 'TypeScript', category: 'language', confidence: 'definite', evidence: 'tsconfig.json' });
  }

  return results;
}

function detectPatterns(dir: string): DetectedTech[] {
  const results: DetectedTech[] = [];

  // PWA detection: service worker + web manifest
  const hasSW = fileExists(dir, 'public', 'sw.js') || fileExists(dir, 'public', 'service-worker.js') || fileExists(dir, 'sw.js');
  const hasManifest = fileExists(dir, 'public', 'site.webmanifest') || fileExists(dir, 'public', 'manifest.json') || fileExists(dir, 'site.webmanifest') || fileExists(dir, 'manifest.json');

  if (hasSW && hasManifest) {
    results.push({
      name: 'PWA',
      category: 'pattern',
      confidence: 'definite',
      evidence: 'service worker + web manifest detected',
    });
  } else if (hasSW) {
    results.push({
      name: 'PWA',
      category: 'pattern',
      confidence: 'likely',
      evidence: 'service worker detected (no manifest found)',
    });
  } else if (hasManifest) {
    results.push({
      name: 'PWA',
      category: 'pattern',
      confidence: 'possible',
      evidence: 'web manifest detected (no service worker found)',
    });
  }

  // i18n detection
  if (fileExists(dir, 'src', 'i18n') || fileExists(dir, 'i18n') || fileExists(dir, 'locales') || fileExists(dir, 'src', 'locales') || fileExists(dir, 'messages')) {
    results.push({
      name: 'Internationalization (i18n)',
      category: 'pattern',
      confidence: 'definite',
      evidence: 'i18n/locales directory detected',
    });
  }

  // Tauri
  if (fileExists(dir, 'src-tauri') || fileExists(dir, 'tauri.conf.json')) {
    results.push({
      name: 'Tauri',
      category: 'framework',
      confidence: 'definite',
      evidence: 'src-tauri/ directory',
    });
  }

  // Capacitor
  if (fileExists(dir, 'capacitor.config.ts') || fileExists(dir, 'capacitor.config.json')) {
    results.push({
      name: 'Capacitor',
      category: 'framework',
      confidence: 'definite',
      evidence: 'capacitor config detected',
    });
  }

  // Monorepo patterns
  if (fileExists(dir, 'pnpm-workspace.yaml') || fileExists(dir, 'lerna.json') || fileExists(dir, 'turbo.json')) {
    results.push({
      name: 'Monorepo',
      category: 'pattern',
      confidence: 'definite',
      evidence: 'workspace config detected',
    });
  }

  // REST API pattern — check for api/ or routes/ directories
  if (fileExists(dir, 'api') || fileExists(dir, 'src', 'app', 'api')) {
    results.push({
      name: 'REST API',
      category: 'pattern',
      confidence: 'likely',
      evidence: 'api/ directory detected',
    });
  }

  // WebSocket pattern
  const wsFiles = globFiles(dir, /\.(ts|js|tsx)$/, 2);
  for (const f of wsFiles) {
    const content = tryReadText(f);
    if (content && /new\s+WebSocket|wss?:\/\/|socket\.io/i.test(content)) {
      results.push({
        name: 'WebSockets',
        category: 'pattern',
        confidence: 'likely',
        evidence: `WebSocket usage in ${f.replace(dir, '').replace(/\\/g, '/')}`,
      });
      break;
    }
  }

  // Cron / scheduled tasks
  if (fileExists(dir, 'vercel.json')) {
    const vercelConfig = tryReadJson(join(dir, 'vercel.json'));
    if (vercelConfig?.crons) {
      results.push({
        name: 'Cron Jobs',
        category: 'pattern',
        confidence: 'definite',
        evidence: 'vercel.json crons configuration',
      });
    }
  }

  // SQL files
  const sqlFiles = globFiles(dir, /\.sql$/, 2);
  if (sqlFiles.length > 0) {
    results.push({
      name: 'SQL',
      category: 'language',
      confidence: 'definite',
      evidence: `${sqlFiles.length} .sql file(s) found`,
    });
  }

  // Lua detection
  const luaFiles = globFiles(dir, /\.lua$/, 1);
  if (luaFiles.length > 0) {
    results.push({
      name: 'Lua',
      category: 'language',
      confidence: 'definite',
      evidence: `${luaFiles.length} .lua file(s) found`,
    });
  }

  // Go detection
  if (fileExists(dir, 'go.mod') || fileExists(dir, 'go.sum')) {
    results.push({
      name: 'Go',
      category: 'language',
      confidence: 'definite',
      evidence: 'go.mod exists',
    });
  }

  // Rust detection
  if (fileExists(dir, 'Cargo.toml')) {
    results.push({
      name: 'Rust',
      category: 'language',
      confidence: 'definite',
      evidence: 'Cargo.toml exists',
    });
  }

  // PHP detection
  if (fileExists(dir, 'composer.json')) {
    results.push({
      name: 'PHP',
      category: 'language',
      confidence: 'definite',
      evidence: 'composer.json exists',
    });
  }

  // Love2D (Lua game framework)
  if (fileExists(dir, 'conf.lua') || fileExists(dir, 'main.lua')) {
    const confContent = tryReadText(join(dir, 'conf.lua'));
    const mainContent = tryReadText(join(dir, 'main.lua'));
    if ((confContent && confContent.includes('love.conf')) || (mainContent && (mainContent.includes('love.draw') || mainContent.includes('love.update')))) {
      results.push({
        name: 'LÖVE 2D',
        category: 'framework',
        confidence: 'definite',
        evidence: 'LÖVE 2D game framework detected (conf.lua/main.lua)',
      });
    }
  }

  // HTML/CSS (check for .html files in public or root)
  const htmlFiles = globFiles(dir, /\.html$/, 1);
  if (htmlFiles.length > 0) {
    results.push({
      name: 'HTML/CSS',
      category: 'language',
      confidence: 'definite',
      evidence: `${htmlFiles.length} .html file(s) found`,
    });
  }

  // Python detection from .py files (backup if no requirements.txt/pyproject.toml)
  const pyFiles = globFiles(dir, /\.py$/, 2);
  if (pyFiles.length > 0) {
    results.push({
      name: 'Python',
      category: 'language',
      confidence: 'definite',
      evidence: `${pyFiles.length} .py file(s) found`,
    });
  }

  return results;
}

// ── Portfolio.md reader ─────────────────────────────────────────────

function readPortfolioStack(dir: string): string[] {
  const mdPath = join(dir, 'PORTFOLIO.md');
  if (!existsSync(mdPath)) return [];

  try {
    const raw = readFileSync(mdPath, 'utf-8');
    const { data } = matter(raw);
    return (data.tech_stack as string[]) ?? [];
  } catch {
    return [];
  }
}

// ── Deduplication ───────────────────────────────────────────────────

function deduplicateTech(techs: DetectedTech[]): DetectedTech[] {
  const seen = new Map<string, DetectedTech>();

  for (const tech of techs) {
    // Normalize key: lowercase, strip version numbers for matching
    const key = tech.name.toLowerCase().replace(/\s*\d+(\.\d+)*\s*$/, '').replace(/\s*\(.*?\)\s*$/, '');

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, tech);
    } else {
      // Keep the higher-confidence one, or the one with a version number
      const confidenceOrder: Confidence[] = ['definite', 'likely', 'possible'];
      const existingIdx = confidenceOrder.indexOf(existing.confidence);
      const newIdx = confidenceOrder.indexOf(tech.confidence);

      if (newIdx < existingIdx) {
        seen.set(key, tech);
      } else if (newIdx === existingIdx && tech.name.length > existing.name.length) {
        // Prefer more specific name (e.g., "Next.js 15" over "Next.js")
        seen.set(key, tech);
      }
    }
  }

  return Array.from(seen.values());
}

// ── Main scan function ──────────────────────────────────────────────

export function scanRepo(repoDir: string, repoName: string): RepoScanResult {
  const errors: string[] = [];

  if (!existsSync(repoDir)) {
    return {
      repo: repoName,
      repoDir,
      detected: [],
      portfolioStack: [],
      errors: [`Directory not found: ${repoDir}`],
    };
  }

  let detected: DetectedTech[] = [];

  try {
    // Layer 1: Dependency manifests
    detected.push(...detectFromPackageJson(repoDir));
    detected.push(...detectFromRequirementsTxt(repoDir));
    detected.push(...detectFromPyprojectToml(repoDir));

    // Also check subdirectories for monorepo patterns (client/, server/, api/)
    for (const subdir of ['client', 'server', 'api', 'backend', 'frontend', 'web', 'app']) {
      const subdirPath = join(repoDir, subdir);
      if (existsSync(subdirPath)) {
        detected.push(...detectFromPackageJson(subdirPath));
        detected.push(...detectFromRequirementsTxt(subdirPath));
        detected.push(...detectFromPyprojectToml(subdirPath));
      }
    }

    // Layer 2: Config files
    detected.push(...detectFromConfigFiles(repoDir));

    // Layer 3: Pattern detection
    detected.push(...detectPatterns(repoDir));
  } catch (err: any) {
    errors.push(`Scan error: ${err.message}`);
  }

  // Deduplicate
  detected = deduplicateTech(detected);

  // Read PORTFOLIO.md tech_stack
  const portfolioStack = readPortfolioStack(repoDir);

  return {
    repo: repoName,
    repoDir,
    detected,
    portfolioStack,
    errors,
  };
}

// ── Fuzzy matching helpers (for audit comparisons) ──────────────────

/**
 * Normalize a tech name for fuzzy comparison.
 * Strips versions, parentheticals, and normalizes casing/spacing.
 */
export function normalizeTechName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+\d+(\.\d+)*\+?\s*/g, ' ')    // Strip trailing version numbers (e.g., " 15", " 3.4.17")
    .replace(/\s*\(.*?\)\s*/g, '')              // Strip parentheticals
    .replace(/[^\w\s/.-]/g, '')                 // Strip special chars except / . -
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two tech names refer to the same technology.
 */
export function techNamesMatch(a: string, b: string): boolean {
  const na = normalizeTechName(a);
  const nb = normalizeTechName(b);

  if (na === nb) return true;

  // Common aliases
  const aliases: Record<string, string[]> = {
    'next.js': ['nextjs', 'next'],
    'react': ['react.js', 'reactjs'],
    'vue.js': ['vuejs', 'vue'],
    'tailwind css': ['tailwindcss', 'tailwind'],
    'typescript': ['ts'],
    'javascript': ['js'],
    'postgresql': ['postgres', 'neon postgres', 'neon', 'pg'],
    'openai api': ['openai', 'gpt-4o', 'gpt-4o vision', 'openai gpt-4o', 'gpt-4o-mini', 'openai gpt-4'],
    'exif extraction': ['exifr', 'exif extraction exifr'],
    'drizzle orm': ['drizzle'],
    'shadcn/ui': ['shadcn', 'shadcnui'],
    'vercel ai sdk': ['ai sdk'],
    'clerk': ['clerk authentication'],
    'pwa': ['progressive web app'],
    'docker': ['docker compose', 'docker-compose'],
    'github actions': ['ci/cd', 'gh actions'],
    'sqlite': ['sql.js', 'better-sqlite'],
    'mongodb': ['mongo', 'mongoose'],
    'redis': ['ioredis'],
    'fastapi': ['fast api'],
    'pillow': ['pil'],
    'scikit-learn': ['sklearn'],
    'love d': ['love2d', 'love'],
  };

  for (const [canonical, alts] of Object.entries(aliases)) {
    const all = [canonical, ...alts];
    if (all.includes(na) && all.includes(nb)) return true;
  }

  // Substring containment (e.g., "Next.js 15 (App Router)" matches "Next.js")
  if (na.includes(nb) || nb.includes(na)) return true;

  // Check raw lowercased names (before stripping parentheticals) for shared keywords
  const rawA = a.toLowerCase();
  const rawB = b.toLowerCase();
  // If one name's parenthetical exactly matches the other's normalized name, it's a match
  // e.g., "exifr (EXIF GPS/metadata extraction)" vs "EXIF Extraction (exifr)"
  // But NOT "Vercel AI SDK (OpenAI)" vs "OpenAI API" — those are different technologies
  const parenA = rawA.match(/\(([^)]+)\)/)?.[1]?.trim();
  const parenB = rawB.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (parenA && parenA === nb) return true;
  if (parenB && parenB === na) return true;

  return false;
}
