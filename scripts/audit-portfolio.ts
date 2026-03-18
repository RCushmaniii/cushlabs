/**
 * Portfolio Audit Script
 *
 * Scans each repo's actual tech vs documented PORTFOLIO.md tech_stack.
 * Reports gaps: "detected but not documented" and "documented but not detected".
 *
 * Usage:
 *   npx tsx scripts/audit-portfolio.ts                          # audit all repos
 *   npx tsx scripts/audit-portfolio.ts biojalisco-species-id    # audit one repo
 *   npx tsx scripts/audit-portfolio.ts --all                    # include repos without PORTFOLIO.md
 *   npx tsx scripts/audit-portfolio.ts --json                   # machine-readable output
 *   npx tsx scripts/audit-portfolio.ts --fix                    # update PORTFOLIO.md with missing tech
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

// ── Audit types ─────────────────────────────────────────────────────

interface AuditResult {
  repo: string;
  hasPortfolio: boolean;
  matched: Array<{ documented: string; detected: string; evidence: string }>;
  gaps: Array<{ name: string; category: string; evidence: string }>; // detected but not documented
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

  // Gaps: detected but not in PORTFOLIO.md
  for (let di = 0; di < detected.length; di++) {
    if (matchedDetected.has(di)) continue;
    result.gaps.push({
      name: detected[di].name,
      category: detected[di].category,
      evidence: detected[di].evidence,
    });
  }

  // Unverified: documented but not detected
  for (let pi = 0; pi < portfolioStack.length; pi++) {
    if (matchedPortfolio.has(pi)) continue;
    result.unverified.push(portfolioStack[pi]);
  }

  return result;
}

function printAuditResult(result: AuditResult): void {
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

  if (result.gaps.length > 0) {
    console.log('\n  GAPS (detected but not in PORTFOLIO.md):');
    for (const gap of result.gaps) {
      console.log(`    + ${gap.name.padEnd(35)} [${gap.evidence}]`);
    }
  }

  if (result.unverified.length > 0) {
    console.log('\n  UNVERIFIED (in PORTFOLIO.md but not detected):');
    for (const item of result.unverified) {
      console.log(`    ? ${item}`);
    }
  }

  if (result.matched.length > 0 && totalDocumented > 0) {
    console.log(`\n  MATCHED: ${result.matched.length}/${totalDocumented} portfolio items verified`);
  }

  if (result.gaps.length === 0 && result.unverified.length === 0 && result.hasPortfolio) {
    console.log('  All portfolio items verified!');
  }
}

function fixPortfolioMd(result: AuditResult): boolean {
  if (result.gaps.length === 0) return false;

  const repoDir = getLocalDir(result.repo);
  const mdPath = join(repoDir, 'PORTFOLIO.md');
  if (!existsSync(mdPath)) return false;

  const content = readFileSync(mdPath, 'utf-8');

  // Find the tech_stack block
  const techStackRegex = /^(tech_stack:\s*\n)((?:\s+-\s+"[^"]*"\s*\n)*)/m;
  const match = content.match(techStackRegex);
  if (!match) {
    console.log(`  [SKIP] Could not find tech_stack block in ${mdPath}`);
    return false;
  }

  const existingBlock = match[0];
  const indent = '  '; // Standard 2-space YAML indent

  // Build new entries for gaps (only non-devOnly, definite/likely confidence)
  const newEntries = result.gaps
    .filter(g => g.evidence && !g.evidence.includes('devDependencies'))
    .map(g => `${indent}- "${g.name}"`)
    .join('\n');

  if (!newEntries) return false;

  const updatedBlock = existingBlock.trimEnd() + '\n' + newEntries + '\n';
  const updatedContent = content.replace(existingBlock, updatedBlock);

  writeFileSync(mdPath, updatedContent, 'utf-8');
  console.log(`  [FIXED] Added ${result.gaps.length} items to ${mdPath}`);

  // Commit and push
  try {
    execSync(`git add PORTFOLIO.md && git commit -m "chore: update tech_stack with detected technologies" && git push`, {
      cwd: repoDir,
      stdio: 'pipe',
    });
    console.log(`  [PUSHED] Committed and pushed changes`);
    return true;
  } catch (err: any) {
    console.log(`  [WARN] Could not commit/push: ${err.message?.substring(0, 100)}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes('--all');
  const jsonOutput = args.includes('--json');
  const fixMode = args.includes('--fix');
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
    // Build reverse alias map
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

  console.log(`\nPortfolio Tech Audit`);
  console.log(`Scanning ${projects.length} project(s)...\n`);

  const results: AuditResult[] = [];
  let totalGaps = 0;
  let totalUnverified = 0;
  let totalMatched = 0;

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
      printAuditResult(result);
    }

    if (fixMode && result.gaps.length > 0 && result.hasPortfolio) {
      fixPortfolioMd(result);
    }

    totalGaps += result.gaps.length;
    totalUnverified += result.unverified.length;
    totalMatched += result.matched.length;
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ results, summary: { totalGaps, totalUnverified, totalMatched } }, null, 2));
  } else {
    console.log(`\n${'='.repeat(60)}`);
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Projects scanned:     ${results.length}`);
    console.log(`  With PORTFOLIO.md:    ${results.filter(r => r.hasPortfolio).length}`);
    console.log(`  Tech items matched:   ${totalMatched}`);
    console.log(`  Gaps (undocumented):  ${totalGaps}`);
    console.log(`  Unverified:           ${totalUnverified}`);
    if (totalGaps > 0 && !fixMode) {
      console.log(`\n  Run with --fix to auto-update PORTFOLIO.md files`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
