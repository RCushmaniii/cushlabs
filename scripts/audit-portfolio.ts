/**
 * Portfolio Audit Script
 *
 * Scans each repo's actual tech vs documented PORTFOLIO.md tech_stack.
 * Reports gaps: "detected but not documented" and "documented but not detected".
 * Smart --fix only adds portfolio-worthy tech (not every utility library).
 *
 * Usage:
 *   npx tsx scripts/audit-portfolio.ts                          # audit all repos (tiered report)
 *   npx tsx scripts/audit-portfolio.ts biojalisco-species-id    # audit one repo
 *   npx tsx scripts/audit-portfolio.ts --all                    # include repos without PORTFOLIO.md
 *   npx tsx scripts/audit-portfolio.ts --json                   # machine-readable output
 *   npx tsx scripts/audit-portfolio.ts --fix                    # update PORTFOLIO.md with must-add tech
 *   npx tsx scripts/audit-portfolio.ts --fix --nice             # also add nice-to-have tier
 *   npx tsx scripts/audit-portfolio.ts --dry-fix                # preview what --fix would change
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { scanRepo, normalizeTechName, techNamesMatch } from './lib/tech-detector.js';
import type { DetectedTech } from './lib/tech-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config (mirrors upload-to-r2.ts) ──────────────────────────────
const PROJECTS_ROOT = join(__dirname, '..', '..'); // Parent of cushlabs repo
const SELF_REPO = 'cushlabs';

const REPO_ALIASES: Record<string, string> = {
  'stock-alert': 'ai-stock-alert',
};

function getLocalDir(repo: string): string {
  const alias = REPO_ALIASES[repo] || repo;
  return join(PROJECTS_ROOT, alias);
}

// ── Portfolio-worthy tiers ─────────────────────────────────────────
// These determine what --fix will actually add to PORTFOLIO.md.
// A client or hiring manager scanning your portfolio cares about these.

type Tier = 'must-add' | 'nice-to-have' | 'skip';

/**
 * Normalized lowercase tech names/patterns mapped to tiers.
 * "must-add" = high-signal, hireable, differentiating skills
 * "nice-to-have" = worth listing if tech_stack isn't already long
 * "skip" = implementation details, redundant, or obvious
 */
const TIER_RULES: Array<{ pattern: RegExp; tier: Tier; reason: string }> = [
  // ── MUST-ADD: High-signal, hireable tech ──────────────────────
  // Patterns & architecture
  { pattern: /^pwa$/i, tier: 'must-add', reason: 'Differentiating mobile/offline capability' },
  { pattern: /^monorepo$/i, tier: 'must-add', reason: 'Architecture pattern employers value' },
  { pattern: /^internationalization|^i18n/i, tier: 'must-add', reason: 'Bilingual capability is a CushLabs differentiator' },
  { pattern: /^websocket/i, tier: 'must-add', reason: 'Real-time capability' },
  { pattern: /^cron job/i, tier: 'must-add', reason: 'Background processing/automation' },
  { pattern: /^rest api$/i, tier: 'must-add', reason: 'API design capability' },
  { pattern: /^graphql/i, tier: 'must-add', reason: 'API design capability' },

  // Databases & data
  { pattern: /^redis$/i, tier: 'must-add', reason: 'Caching/scaling awareness' },
  { pattern: /^pgvector$/i, tier: 'must-add', reason: 'Vector DB for RAG — hot skill' },
  { pattern: /^postgresql|^neon postgres|^supabase|^mongodb|^sqlite/i, tier: 'must-add', reason: 'Database experience' },
  { pattern: /^drizzle|^prisma|^sqlalchemy/i, tier: 'must-add', reason: 'ORM experience' },

  // AI / LLM APIs
  { pattern: /^openai|^anthropic|^vercel ai sdk/i, tier: 'must-add', reason: 'AI/LLM integration — core CushLabs offering' },
  { pattern: /^langchain/i, tier: 'must-add', reason: 'AI orchestration framework' },
  { pattern: /^hugging face/i, tier: 'must-add', reason: 'ML ecosystem' },

  // Payments / Comms
  { pattern: /^stripe$/i, tier: 'must-add', reason: 'Payment integration' },
  { pattern: /^twilio$/i, tier: 'must-add', reason: 'Communications API' },
  { pattern: /^resend$|^sendgrid$/i, tier: 'must-add', reason: 'Transactional email' },

  // Frameworks (when not redundant with existing stack)
  { pattern: /^flask$|^fastapi$|^django$|^express/i, tier: 'must-add', reason: 'Backend framework' },
  { pattern: /^svelte$|^vue/i, tier: 'must-add', reason: 'Frontend framework diversity' },

  // Auth
  { pattern: /^clerk$|^nextauth|^auth\.js$/i, tier: 'must-add', reason: 'Auth implementation' },

  // Infrastructure
  { pattern: /^docker$/i, tier: 'must-add', reason: 'Containerization' },
  { pattern: /^github actions$/i, tier: 'must-add', reason: 'CI/CD pipeline' },
  { pattern: /^cloudflare workers$/i, tier: 'must-add', reason: 'Edge computing' },
  { pattern: /^render$/i, tier: 'must-add', reason: 'Deployment platform' },

  // Data viz
  { pattern: /^recharts$|^chart\.js$|^d3|^plotly|^nivo$/i, tier: 'must-add', reason: 'Data visualization' },
  { pattern: /^matplotlib$|^seaborn$/i, tier: 'must-add', reason: 'Python data visualization' },

  // ML
  { pattern: /^pytorch$|^tensorflow$|^scikit/i, tier: 'must-add', reason: 'Machine learning' },

  // UI component systems
  { pattern: /^shadcn/i, tier: 'must-add', reason: 'Modern UI system, widely recognized' },

  // Testing
  { pattern: /^playwright$|^cypress$/i, tier: 'must-add', reason: 'E2E testing capability' },

  // Web scraping
  { pattern: /^puppeteer$|^beautiful soup$|^scrapy$|^cheerio$/i, tier: 'must-add', reason: 'Web scraping/automation' },

  // Mobile / Desktop
  { pattern: /^tauri$|^capacitor$|^react native$|^expo$|^electron$/i, tier: 'must-add', reason: 'Cross-platform development' },
  { pattern: /^l..ve 2d$/i, tier: 'must-add', reason: 'Game development framework' },

  // Specific libraries with resume value
  { pattern: /^scipy$/i, tier: 'must-add', reason: 'Scientific computing' },
  { pattern: /^numpy$/i, tier: 'must-add', reason: 'Numerical computing' },
  { pattern: /^pandas$/i, tier: 'must-add', reason: 'Data analysis' },
  { pattern: /^pydantic$/i, tier: 'must-add', reason: 'Data validation (FastAPI ecosystem)' },
  { pattern: /^pillow$/i, tier: 'must-add', reason: 'Image processing' },
  { pattern: /^pymupdf$/i, tier: 'must-add', reason: 'PDF processing' },
  { pattern: /^python-pptx$/i, tier: 'must-add', reason: 'Office doc automation' },
  { pattern: /^socket\.io$/i, tier: 'must-add', reason: 'Real-time communication' },
  { pattern: /^vercel blob/i, tier: 'must-add', reason: 'Cloud storage' },

  // ── NICE-TO-HAVE: Worth listing if stack isn't long ───────────
  { pattern: /^framer motion$|^motion$|^gsap$/i, tier: 'nice-to-have', reason: 'Animation library' },
  { pattern: /^react hook form$/i, tier: 'nice-to-have', reason: 'Form handling' },
  { pattern: /^zod$/i, tier: 'nice-to-have', reason: 'Schema validation' },
  { pattern: /^sharp$/i, tier: 'nice-to-have', reason: 'Image optimization' },
  { pattern: /^three\.js$|^react three/i, tier: 'nice-to-have', reason: '3D graphics' },
  { pattern: /^react \d+$/i, tier: 'nice-to-have', reason: 'React version (if not implicit from Next.js)' },
  { pattern: /^vercel$/i, tier: 'nice-to-have', reason: 'Deployment platform (often obvious)' },
  { pattern: /^python$/i, tier: 'nice-to-have', reason: 'Language (add if not already implied by Python framework)' },
  { pattern: /^uvicorn$/i, tier: 'nice-to-have', reason: 'ASGI server' },
  { pattern: /^celery$/i, tier: 'nice-to-have', reason: 'Task queue' },
  { pattern: /^bullmq$/i, tier: 'nice-to-have', reason: 'Job queue' },
  { pattern: /^axios$|^httpx$/i, tier: 'nice-to-have', reason: 'HTTP client' },
  { pattern: /^mapbox|^leaflet|^google maps/i, tier: 'nice-to-have', reason: 'Maps integration' },
  { pattern: /^react-markdown$|^marked$/i, tier: 'nice-to-have', reason: 'Markdown rendering' },
  { pattern: /^pdf-lib$|^jspdf$/i, tier: 'nice-to-have', reason: 'PDF generation' },
  { pattern: /^aws s3|^r2$/i, tier: 'nice-to-have', reason: 'Object storage' },
  { pattern: /^multipart form/i, tier: 'nice-to-have', reason: 'File upload handling' },

  // ── SKIP: Noise, redundant, or implementation details ──────────
  { pattern: /^javascript$/i, tier: 'skip', reason: 'Redundant when TypeScript is listed' },
  { pattern: /^typescript$/i, tier: 'skip', reason: 'Usually already in PORTFOLIO.md' },
  { pattern: /^html\/css$|^html$|^css$/i, tier: 'skip', reason: 'Obvious for web projects' },
  { pattern: /^sql$/i, tier: 'skip', reason: 'Redundant when specific DB is listed' },
  { pattern: /^date-fns$|^dayjs$|^moment$/i, tier: 'skip', reason: 'Utility library — implementation detail' },
  { pattern: /^nanoid$|^uuid$/i, tier: 'skip', reason: 'Utility library — implementation detail' },
  { pattern: /^lodash$/i, tier: 'skip', reason: 'Utility library — implementation detail' },
  { pattern: /^gray-matter$/i, tier: 'skip', reason: 'Build tool — implementation detail' },
  { pattern: /^remark$/i, tier: 'skip', reason: 'Build tool — implementation detail' },
  { pattern: /^dotenv$/i, tier: 'skip', reason: 'Config utility' },
  { pattern: /^eslint$|^prettier$/i, tier: 'skip', reason: 'Dev tooling' },
  { pattern: /^tsx$|^ts-node$/i, tier: 'skip', reason: 'Dev tooling' },
  { pattern: /^exif extraction/i, tier: 'skip', reason: 'Usually already documented more specifically' },
  { pattern: /^chalk$|^rich$/i, tier: 'skip', reason: 'CLI formatting — implementation detail' },
  { pattern: /^commander|^inquirer/i, tier: 'skip', reason: 'CLI framework — implementation detail' },
  { pattern: /^i18next$|^react-i18next$|^next-intl$/i, tier: 'skip', reason: 'Covered by i18n pattern detection' },
  { pattern: /^nodemailer$/i, tier: 'skip', reason: 'Low-level — prefer listing Resend/SendGrid' },
  { pattern: /^vitest$|^jest$/i, tier: 'skip', reason: 'Unit test runner — not portfolio-worthy alone' },
  { pattern: /^node-fetch$|^requests$/i, tier: 'skip', reason: 'HTTP client — too basic' },
  { pattern: /^jinja2$/i, tier: 'skip', reason: 'Templating — implementation detail' },
  { pattern: /^passlib$|^jwt$|^pyjwt$/i, tier: 'skip', reason: 'Auth utility — covered by auth framework' },
  { pattern: /^wrangler$/i, tier: 'skip', reason: 'Covered by Cloudflare Workers' },
  { pattern: /^powershell$|^shell$/i, tier: 'skip', reason: 'Scripting language — not portfolio-worthy' },
];

function classifyGap(techName: string, portfolioStack: string[]): { tier: Tier; reason: string } {
  const normalized = techName.toLowerCase();

  // Context-aware rules before checking the static list
  // Skip "React 19" if "Next.js" is already in portfolio (it's implied)
  if (/^react\s*\d/i.test(techName)) {
    const hasNextjs = portfolioStack.some(p => /next\.?js/i.test(p));
    if (hasNextjs) {
      return { tier: 'skip', reason: 'Implied by Next.js' };
    }
  }

  // Skip "Python" if a Python framework (FastAPI, Flask, Django) is already listed
  if (/^python$/i.test(techName)) {
    const hasPyFramework = portfolioStack.some(p => /fastapi|flask|django|streamlit/i.test(p));
    if (hasPyFramework) {
      return { tier: 'skip', reason: 'Implied by Python framework' };
    }
  }

  // Skip "PostgreSQL" if Neon Postgres or Supabase already listed
  if (/^postgresql$/i.test(techName)) {
    const hasSpecificDb = portfolioStack.some(p => /neon|supabase/i.test(p));
    if (hasSpecificDb) {
      return { tier: 'skip', reason: 'Redundant — specific provider already listed' };
    }
  }

  // Skip "OpenAI API" if a specific model like "GPT-4o Vision" or "OpenAI GPT-4o" already listed
  if (/^openai api$/i.test(techName)) {
    const hasSpecific = portfolioStack.some(p => /gpt-4|openai gpt/i.test(p));
    if (hasSpecific) {
      return { tier: 'skip', reason: 'Redundant — specific model already listed' };
    }
  }

  // Check tier rules
  for (const rule of TIER_RULES) {
    if (rule.pattern.test(normalized) || rule.pattern.test(techName)) {
      return { tier: rule.tier, reason: rule.reason };
    }
  }

  // Default: nice-to-have for known categories, skip for unknowns
  return { tier: 'skip', reason: 'Unclassified — default skip' };
}

// ── Audit types ─────────────────────────────────────────────────────

interface ClassifiedGap {
  name: string;
  category: string;
  evidence: string;
  tier: Tier;
  reason: string;
}

interface AuditResult {
  repo: string;
  hasPortfolio: boolean;
  matched: Array<{ documented: string; detected: string; evidence: string }>;
  gaps: ClassifiedGap[];
  unverified: string[]; // documented but not detected
  errors: string[];
}

// ── Main ────────────────────────────────────────────────────────────

function auditRepo(repoName: string): AuditResult {
  const repoDir = getLocalDir(repoName);
  const scan = scanRepo(repoDir, repoName);

  const result: AuditResult = {
    repo: repoName,
    hasPortfolio: scan.portfolioStack.length > 0,
    matched: [],
    gaps: [],
    unverified: [],
    errors: scan.errors,
  };

  if (!existsSync(repoDir)) {
    result.errors.push(`No local clone at ${repoDir}`);
    return result;
  }

  const portfolioStack = scan.portfolioStack;
  const detected = scan.detected.filter(d => !d.isDevOnly);

  // Match detected tech against portfolio
  const matchedDetected = new Set<number>();
  const matchedPortfolio = new Set<number>();

  for (let di = 0; di < detected.length; di++) {
    for (let pi = 0; pi < portfolioStack.length; pi++) {
      if (matchedPortfolio.has(pi)) continue;
      if (techNamesMatch(detected[di].name, portfolioStack[pi])) {
        matchedDetected.add(di);
        matchedPortfolio.add(pi);
        result.matched.push({
          documented: portfolioStack[pi],
          detected: detected[di].name,
          evidence: detected[di].evidence,
        });
        break;
      }
    }
  }

  // Gaps: detected but not in PORTFOLIO.md — classify each
  for (let di = 0; di < detected.length; di++) {
    if (matchedDetected.has(di)) continue;
    const { tier, reason } = classifyGap(detected[di].name, portfolioStack);
    result.gaps.push({
      name: detected[di].name,
      category: detected[di].category,
      evidence: detected[di].evidence,
      tier,
      reason,
    });
  }

  // Unverified: documented but not detected
  for (let pi = 0; pi < portfolioStack.length; pi++) {
    if (matchedPortfolio.has(pi)) continue;
    result.unverified.push(portfolioStack[pi]);
  }

  return result;
}

function printAuditResult(result: AuditResult, showSkipped: boolean = false): void {
  const totalDocumented = result.matched.length + result.unverified.length;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`=== ${result.repo} ===`);

  if (!result.hasPortfolio) {
    console.log('  (no PORTFOLIO.md tech_stack found)');
  }

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      console.log(`  ERROR: ${err}`);
    }
  }

  const mustAdd = result.gaps.filter(g => g.tier === 'must-add');
  const niceToHave = result.gaps.filter(g => g.tier === 'nice-to-have');
  const skipped = result.gaps.filter(g => g.tier === 'skip');

  if (mustAdd.length > 0) {
    console.log('\n  MUST-ADD (high-signal, hireable tech):');
    for (const gap of mustAdd) {
      console.log(`    ++ ${gap.name.padEnd(32)} ${gap.reason}`);
    }
  }

  if (niceToHave.length > 0) {
    console.log('\n  NICE-TO-HAVE (add if stack is thin):');
    for (const gap of niceToHave) {
      console.log(`     + ${gap.name.padEnd(32)} ${gap.reason}`);
    }
  }

  if (showSkipped && skipped.length > 0) {
    console.log('\n  SKIPPED (noise / redundant):');
    for (const gap of skipped) {
      console.log(`     - ${gap.name.padEnd(32)} ${gap.reason}`);
    }
  }

  if (result.unverified.length > 0) {
    console.log('\n  UNVERIFIED (in PORTFOLIO.md but not detected):');
    for (const item of result.unverified) {
      console.log(`     ? ${item}`);
    }
  }

  if (result.matched.length > 0 && totalDocumented > 0) {
    console.log(`\n  MATCHED: ${result.matched.length}/${totalDocumented} portfolio items verified`);
  }

  const actionable = mustAdd.length + niceToHave.length;
  if (actionable === 0 && result.unverified.length === 0 && result.hasPortfolio) {
    console.log('  Portfolio tech_stack is comprehensive!');
  }
}

function fixPortfolioMd(result: AuditResult, includeNiceToHave: boolean, dryRun: boolean): { added: string[]; repo: string } | null {
  const mustAdd = result.gaps.filter(g => g.tier === 'must-add');
  const niceToHave = includeNiceToHave ? result.gaps.filter(g => g.tier === 'nice-to-have') : [];
  const toAdd = [...mustAdd, ...niceToHave];

  if (toAdd.length === 0) return null;

  const repoDir = getLocalDir(result.repo);
  const mdPath = join(repoDir, 'PORTFOLIO.md');
  if (!existsSync(mdPath)) return null;

  const content = readFileSync(mdPath, 'utf-8');

  // Find the tech_stack block — handle both inline and multi-line YAML arrays
  const techStackRegex = /^(tech_stack:\s*\n)((?:\s+-\s+"[^"]*"\s*\n)*)/m;
  const match = content.match(techStackRegex);
  if (!match) {
    console.log(`  [SKIP] Could not find tech_stack block in PORTFOLIO.md`);
    return null;
  }

  const existingBlock = match[0];
  const indent = '  '; // Standard 2-space YAML indent

  const newEntries = toAdd
    .map(g => `${indent}- "${g.name}"`)
    .join('\n');

  const addedNames = toAdd.map(g => g.name);

  if (dryRun) {
    console.log(`  [DRY RUN] Would add ${toAdd.length} items:`);
    for (const g of toAdd) {
      const tierLabel = g.tier === 'must-add' ? '++' : ' +';
      console.log(`    ${tierLabel} "${g.name}"`);
    }
    return { added: addedNames, repo: result.repo };
  }

  const updatedBlock = existingBlock.trimEnd() + '\n' + newEntries + '\n';
  const updatedContent = content.replace(existingBlock, updatedBlock);

  writeFileSync(mdPath, updatedContent, 'utf-8');
  console.log(`  [UPDATED] Added ${toAdd.length} items to PORTFOLIO.md`);

  // Commit and push
  try {
    const tierNote = includeNiceToHave ? 'must-add + nice-to-have' : 'must-add';
    execSync(
      `git add PORTFOLIO.md && git commit -m "chore: update tech_stack with ${toAdd.length} detected technologies (${tierNote})" && git push`,
      { cwd: repoDir, stdio: 'pipe' },
    );
    console.log(`  [PUSHED] Committed and pushed`);
    return { added: addedNames, repo: result.repo };
  } catch (err: any) {
    const stderr = err.stderr?.toString() || err.message || '';
    console.log(`  [WARN] Could not commit/push: ${stderr.substring(0, 120)}`);
    return { added: addedNames, repo: result.repo };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes('--all');
  const jsonOutput = args.includes('--json');
  const fixMode = args.includes('--fix');
  const dryFix = args.includes('--dry-fix');
  const includeNice = args.includes('--nice');
  const verbose = args.includes('--verbose');
  const targetRepo = args.find(a => !a.startsWith('--'));

  // Load project list from generated JSON
  const jsonPath = join(__dirname, '..', 'src', 'data', 'projects.generated.json');
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  let projects: Array<{ name: string }> = data.projects;

  if (targetRepo) {
    projects = projects.filter(p => p.name === targetRepo);
    if (projects.length === 0) {
      console.error(`Project "${targetRepo}" not found in projects.generated.json`);
      process.exit(1);
    }
  }

  // Also scan local repos that aren't in the generated JSON if --all
  if (showAll) {
    const { readdirSync, statSync } = await import('fs');
    const entries = readdirSync(PROJECTS_ROOT);
    const knownNames = new Set(projects.map(p => p.name));
    const reverseAliases: Record<string, string> = {};
    for (const [name, alias] of Object.entries(REPO_ALIASES)) {
      reverseAliases[alias] = name;
    }
    for (const entry of entries) {
      const fullPath = join(PROJECTS_ROOT, entry);
      if (!statSync(fullPath).isDirectory()) continue;
      if (entry === SELF_REPO || entry.startsWith('.')) continue;
      const repoName = reverseAliases[entry] || entry;
      if (!knownNames.has(repoName)) {
        projects.push({ name: repoName });
      }
    }
  }

  const mode = dryFix ? 'DRY-FIX PREVIEW' : fixMode ? 'FIX MODE' : 'AUDIT';
  console.log(`\nPortfolio Tech Audit — ${mode}`);
  if (fixMode || dryFix) {
    const tier = includeNice ? 'must-add + nice-to-have' : 'must-add only';
    console.log(`Tier: ${tier}`);
  }
  console.log(`Scanning ${projects.length} project(s)...\n`);

  const results: AuditResult[] = [];
  let totalMustAdd = 0;
  let totalNiceToHave = 0;
  let totalSkipped = 0;
  let totalUnverified = 0;
  let totalMatched = 0;
  const fixResults: Array<{ repo: string; added: string[] }> = [];

  for (const project of projects) {
    if (project.name === SELF_REPO) continue;

    const repoDir = getLocalDir(project.name);
    if (!existsSync(repoDir)) {
      if (!jsonOutput) console.log(`[${project.name}] No local clone found`);
      continue;
    }

    const result = auditRepo(project.name);
    results.push(result);

    if (!jsonOutput) {
      if (!result.hasPortfolio && !showAll) continue;
      const hasActionable = result.gaps.some(g => g.tier !== 'skip') || result.unverified.length > 0;
      // In fix/dry-fix mode, only show repos with actionable items
      if ((fixMode || dryFix) && !hasActionable) continue;
      printAuditResult(result, verbose);
    }

    if ((fixMode || dryFix) && result.hasPortfolio) {
      const fixResult = fixPortfolioMd(result, includeNice, dryFix);
      if (fixResult) {
        fixResults.push(fixResult);
      }
    }

    totalMustAdd += result.gaps.filter(g => g.tier === 'must-add').length;
    totalNiceToHave += result.gaps.filter(g => g.tier === 'nice-to-have').length;
    totalSkipped += result.gaps.filter(g => g.tier === 'skip').length;
    totalUnverified += result.unverified.length;
    totalMatched += result.matched.length;
  }

  if (jsonOutput) {
    console.log(JSON.stringify({
      results,
      summary: { totalMustAdd, totalNiceToHave, totalSkipped, totalUnverified, totalMatched },
      fixes: fixResults,
    }, null, 2));
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Projects scanned:     ${results.length}`);
    console.log(`  With PORTFOLIO.md:    ${results.filter(r => r.hasPortfolio).length}`);
    console.log(`  Tech items matched:   ${totalMatched}`);
    console.log('');
    console.log(`  Must-add gaps:        ${totalMustAdd}`);
    console.log(`  Nice-to-have gaps:    ${totalNiceToHave}`);
    console.log(`  Skipped (noise):      ${totalSkipped}`);
    console.log(`  Unverified:           ${totalUnverified}`);

    if (fixResults.length > 0) {
      console.log('');
      const verb = dryFix ? 'Would update' : 'Updated';
      console.log(`  ${verb} ${fixResults.length} repo(s):`);
      for (const fr of fixResults) {
        console.log(`    ${fr.repo}: +${fr.added.length} items`);
      }
    }

    if (!fixMode && !dryFix && totalMustAdd > 0) {
      console.log(`\n  Preview changes:  npx tsx scripts/audit-portfolio.ts --dry-fix`);
      console.log(`  Apply must-add:   npx tsx scripts/audit-portfolio.ts --fix`);
      console.log(`  Apply all:        npx tsx scripts/audit-portfolio.ts --fix --nice`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
