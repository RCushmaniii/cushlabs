/**
 * Skills JSON Generator
 *
 * Scans all local project repos, merges detected tech with PORTFOLIO.md data,
 * and outputs a comprehensive skills.generated.json suitable for giving to any
 * AI system as context about Robert's technical capabilities.
 *
 * Usage:
 *   npx tsx scripts/generate-skills.ts           # generate skills.generated.json
 *   npx tsx scripts/generate-skills.ts --verbose  # include per-project evidence
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scanRepo, normalizeTechName, techNamesMatch } from './lib/tech-detector.js';
import type { DetectedTech, TechCategory } from './lib/tech-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ─────────────────────────────────────────────────────────
const PROJECTS_ROOT = join(__dirname, '..', '..');
const SELF_REPO = 'cushlabs';

const REPO_ALIASES: Record<string, string> = {
  'stock-alert': 'ai-stock-alert',
};

function getLocalDir(repo: string): string {
  const alias = REPO_ALIASES[repo] || repo;
  return join(PROJECTS_ROOT, alias);
}

// ── Types ──────────────────────────────────────────────────────────

interface SkillEntry {
  name: string;
  projectCount: number;
  projects: string[];
  firstUsed: string | null;
  lastUsed: string | null;
}

interface ProjectEntry {
  name: string;
  title: string;
  category: string;
  status: string | null;
  techStack: string[];
  patterns: string[];
  languages: string[];
  createdAt: string | null;
  lastPushed: string | null;
}

interface SkillsOutput {
  generatedAt: string;
  owner: string;
  projectsScanned: number;
  summary: {
    totalSkills: number;
    topLanguages: string[];
    topFrameworks: string[];
    topDatabases: string[];
    topAPIs: string[];
  };
  skills: Record<string, SkillEntry[]>;
  projects: ProjectEntry[];
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');

  // Load project metadata from generated JSON
  const jsonPath = join(__dirname, '..', 'src', 'data', 'projects.generated.json');
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const projectMeta: Array<{
    name: string;
    title: string;
    categories: string[];
    status: string | null;
    stack: string[];
    tags: string[];
    createdAt: string;
    lastPushed: string;
    languages: Record<string, number>;
  }> = data.projects;

  console.log(`\nSkills JSON Generator`);
  console.log(`Scanning ${projectMeta.length} project(s)...\n`);

  // Aggregate: tech name -> { category, projects, dates }
  const skillsMap = new Map<string, {
    name: string;
    category: TechCategory;
    projects: Set<string>;
    firstUsed: string | null;
    lastUsed: string | null;
  }>();

  const projectEntries: ProjectEntry[] = [];

  for (const meta of projectMeta) {
    if (meta.name === SELF_REPO) continue;

    const repoDir = getLocalDir(meta.name);
    if (!existsSync(repoDir)) {
      if (verbose) console.log(`[${meta.name}] No local clone — using PORTFOLIO.md stack only`);

      // Still record project with portfolio stack data
      if (meta.stack.length > 0) {
        const entry: ProjectEntry = {
          name: meta.name,
          title: meta.title,
          category: meta.categories[0] || 'Uncategorized',
          status: meta.status,
          techStack: meta.stack,
          patterns: [],
          languages: Object.keys(meta.languages),
          createdAt: meta.createdAt || null,
          lastPushed: meta.lastPushed || null,
        };
        projectEntries.push(entry);

        // Add portfolio stack items to skills
        for (const tech of meta.stack) {
          addToSkillsMap(skillsMap, tech, guessCategory(tech), meta.name, meta.createdAt, meta.lastPushed);
        }

        // Add GitHub-detected languages
        for (const lang of Object.keys(meta.languages)) {
          if (['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Lua', 'HTML', 'CSS', 'SQL', 'PLpgSQL', 'Shell', 'PowerShell'].includes(lang)) {
            addToSkillsMap(skillsMap, lang === 'PLpgSQL' ? 'SQL' : lang, 'language', meta.name, meta.createdAt, meta.lastPushed);
          }
        }
      }
      continue;
    }

    const scan = scanRepo(repoDir, meta.name);
    const detected = scan.detected;

    // Merge detected tech with portfolio stack (union, dedup)
    const allTech = new Map<string, { name: string; category: TechCategory; isDevOnly?: boolean }>();

    for (const tech of detected) {
      const key = normalizeTechName(tech.name);
      if (!allTech.has(key)) {
        allTech.set(key, { name: tech.name, category: tech.category, isDevOnly: tech.isDevOnly });
      }
    }

    // Add portfolio stack items that weren't detected
    for (const portfolioItem of scan.portfolioStack) {
      const key = normalizeTechName(portfolioItem);
      let found = false;
      for (const [existingKey] of allTech) {
        if (existingKey === key || techNamesMatch(portfolioItem, allTech.get(existingKey)!.name)) {
          found = true;
          break;
        }
      }
      if (!found) {
        allTech.set(key, { name: portfolioItem, category: guessCategory(portfolioItem) });
      }
    }

    // Build project entry
    const patterns: string[] = [];
    const languages: string[] = [];
    const techStack: string[] = [];

    for (const [, tech] of allTech) {
      if (tech.isDevOnly) continue; // Skip dev-only tools from the main tech stack list

      if (tech.category === 'pattern') {
        patterns.push(tech.name);
      } else if (tech.category === 'language') {
        languages.push(tech.name);
      } else {
        techStack.push(tech.name);
      }

      // Add to global skills map (skip dev-only from skills)
      if (!tech.isDevOnly) {
        addToSkillsMap(skillsMap, tech.name, tech.category, meta.name, meta.createdAt, meta.lastPushed);
      }
    }

    // Also add GitHub-detected languages
    for (const lang of Object.keys(meta.languages)) {
      if (['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Lua', 'HTML', 'CSS', 'SQL', 'PLpgSQL', 'Shell', 'PowerShell'].includes(lang)) {
        const normalized = lang === 'PLpgSQL' ? 'SQL' : lang;
        if (!languages.includes(normalized)) {
          languages.push(normalized);
        }
        addToSkillsMap(skillsMap, normalized, 'language', meta.name, meta.createdAt, meta.lastPushed);
      }
    }

    const entry: ProjectEntry = {
      name: meta.name,
      title: meta.title,
      category: meta.categories[0] || 'Uncategorized',
      status: meta.status,
      techStack,
      patterns,
      languages,
      createdAt: meta.createdAt || null,
      lastPushed: meta.lastPushed || null,
    };
    projectEntries.push(entry);

    if (verbose) {
      console.log(`[${meta.name}] ${detected.length} detected, ${scan.portfolioStack.length} in portfolio, ${allTech.size} total`);
    } else {
      console.log(`[${meta.name}] ${allTech.size} technologies`);
    }
  }

  // Build skills output organized by category
  const categoryOrder: TechCategory[] = ['language', 'framework', 'database', 'api', 'platform', 'pattern', 'tool', 'library'];
  const skills: Record<string, SkillEntry[]> = {};

  for (const cat of categoryOrder) {
    const entries: SkillEntry[] = [];
    for (const [, skill] of skillsMap) {
      if (skill.category === cat) {
        entries.push({
          name: skill.name,
          projectCount: skill.projects.size,
          projects: Array.from(skill.projects).sort(),
          firstUsed: skill.firstUsed,
          lastUsed: skill.lastUsed,
        });
      }
    }
    // Sort by project count descending
    entries.sort((a, b) => b.projectCount - a.projectCount);
    if (entries.length > 0) {
      const label = categoryLabel(cat);
      skills[label] = entries;
    }
  }

  // Build summary
  const totalSkills = Array.from(skillsMap.values()).length;
  const topN = (cat: TechCategory, n: number) =>
    Array.from(skillsMap.values())
      .filter(s => s.category === cat)
      .sort((a, b) => b.projects.size - a.projects.size)
      .slice(0, n)
      .map(s => s.name);

  const output: SkillsOutput = {
    generatedAt: new Date().toISOString(),
    owner: 'Robert Cushman',
    projectsScanned: projectEntries.length,
    summary: {
      totalSkills,
      topLanguages: topN('language', 6),
      topFrameworks: topN('framework', 6),
      topDatabases: topN('database', 5),
      topAPIs: topN('api', 5),
    },
    skills,
    projects: projectEntries.sort((a, b) => {
      // Sort by lastPushed descending
      const dateA = a.lastPushed ? new Date(a.lastPushed).getTime() : 0;
      const dateB = b.lastPushed ? new Date(b.lastPushed).getTime() : 0;
      return dateB - dateA;
    }),
  };

  const outputPath = join(__dirname, '..', 'src', 'data', 'skills.generated.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log('SKILLS GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Output:              ${outputPath}`);
  console.log(`  Projects scanned:    ${projectEntries.length}`);
  console.log(`  Total skills:        ${totalSkills}`);
  console.log(`  Languages:           ${topN('language', 10).join(', ')}`);
  console.log(`  Top frameworks:      ${topN('framework', 8).join(', ')}`);
  console.log(`  Databases:           ${topN('database', 5).join(', ')}`);
  console.log(`  APIs/Services:       ${topN('api', 5).join(', ')}`);
}

// ── Helpers ─────────────────────────────────────────────────────────

function addToSkillsMap(
  map: Map<string, { name: string; category: TechCategory; projects: Set<string>; firstUsed: string | null; lastUsed: string | null }>,
  name: string,
  category: TechCategory,
  project: string,
  createdAt: string | null | undefined,
  lastPushed: string | null | undefined,
): void {
  const key = normalizeTechName(name);

  // Check for existing entry that matches
  let existing: string | null = null;
  for (const [k, v] of map) {
    if (k === key || techNamesMatch(v.name, name)) {
      existing = k;
      break;
    }
  }

  if (existing) {
    const entry = map.get(existing)!;
    entry.projects.add(project);
    if (createdAt && (!entry.firstUsed || createdAt < entry.firstUsed)) {
      entry.firstUsed = createdAt;
    }
    if (lastPushed && (!entry.lastUsed || lastPushed > entry.lastUsed)) {
      entry.lastUsed = lastPushed;
    }
  } else {
    map.set(key, {
      name,
      category,
      projects: new Set([project]),
      firstUsed: createdAt || null,
      lastUsed: lastPushed || null,
    });
  }
}

function guessCategory(name: string): TechCategory {
  const lower = name.toLowerCase();

  // Languages
  if (/^(typescript|javascript|python|go|rust|lua|sql|html|css|php|ruby|java|c\+\+|c#|swift|kotlin|dart|shell|powershell|plpgsql)$/i.test(lower.replace(/[\s/]+/g, ''))) {
    return 'language';
  }

  // Frameworks
  if (/next\.?js|react|vue|svelte|astro|angular|express|fastapi|flask|django|tailwind|bootstrap|nuxt|remix|solid/i.test(lower)) {
    return 'framework';
  }

  // Databases
  if (/postgres|mysql|sqlite|mongo|redis|supabase|neon|drizzle|prisma|pgvector|dynamodb|firebase|fauna/i.test(lower)) {
    return 'database';
  }

  // APIs
  if (/openai|anthropic|stripe|twilio|sendgrid|resend|mapbox|google|cloudflare|aws|inaturalist|gbif|conabio/i.test(lower)) {
    return 'api';
  }

  // Platforms
  if (/vercel|netlify|render|railway|docker|kubernetes|github actions|cloudflare workers/i.test(lower)) {
    return 'platform';
  }

  // Patterns
  if (/pwa|i18n|rag|bilingual|monorepo|websocket|cron|rest api|graphql|ssr|ssg|isr/i.test(lower)) {
    return 'pattern';
  }

  return 'library';
}

function categoryLabel(cat: TechCategory): string {
  const labels: Record<TechCategory, string> = {
    language: 'languages',
    framework: 'frameworks',
    database: 'databases',
    api: 'apis',
    platform: 'platforms',
    pattern: 'patterns',
    tool: 'tools',
    library: 'libraries',
  };
  return labels[cat];
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
