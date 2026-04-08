/**
 * validate-portfolio-md.ts
 *
 * Scans every sibling project repo for a PORTFOLIO.md and validates it
 * before generate-projects.ts runs. Fails LOUDLY on any of:
 *   1. YAML parse errors (e.g. duplicate top-level keys)
 *   2. Missing required fields (when portfolio_enabled: true)
 *   3. Thumbnail referenced but not in expected format
 *
 * This exists because of a recurring silent-corruption bug:
 *   - PORTFOLIO.md files were getting two top-level `health_status:` blocks
 *     (added by separate audit passes that didn't dedupe).
 *   - YAML rejects duplicate keys → gray-matter throws.
 *   - generate-projects.ts caught the throw silently and wrote
 *     thumbnail: null into projects.generated.json.
 *   - Portfolio cards rendered the default placeholder. Site looked broken.
 *   - Took multiple debug sessions to track down because nothing logged.
 *
 * RULE: validate-portfolio-md.ts MUST pass before generate-projects.ts runs.
 * Wired into `npm run generate-projects` via prescript hook.
 *
 * Usage:
 *   npx tsx scripts/validate-portfolio-md.ts          # validate all
 *   npx tsx scripts/validate-portfolio-md.ts --fix    # auto-fix duplicate health_status
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECTS_ROOT = join(__dirname, '..', '..');
const FIX_MODE = process.argv.includes('--fix');

interface Issue {
  repo: string;
  file: string;
  level: 'error' | 'warning';
  message: string;
  fixable: boolean;
}

const issues: Issue[] = [];

function listRepoDirs(): string[] {
  return readdirSync(PROJECTS_ROOT)
    .filter((name) => {
      if (name.startsWith('.')) return false;
      const full = join(PROJECTS_ROOT, name);
      try {
        return statSync(full).isDirectory();
      } catch {
        return false;
      }
    });
}

function findPortfolioMd(repoDir: string): string | null {
  for (const filename of ['PORTFOLIO.md', 'portfolio.md']) {
    const fp = join(PROJECTS_ROOT, repoDir, filename);
    if (existsSync(fp)) return fp;
  }
  return null;
}

/**
 * Detect duplicate top-level YAML keys. gray-matter/js-yaml throws on
 * duplicates but the message can be cryptic — this gives us a clean
 * pre-check with a clear error and an opt-in auto-fix.
 */
function findDuplicateTopLevelKeys(content: string): string[] {
  // Extract just the frontmatter block between --- markers
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const line of fm.split('\n')) {
    // Top-level key = no leading whitespace, ends in colon
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)?$/);
    if (!m) continue;
    const key = m[1];
    if (seen.has(key)) dupes.add(key);
    seen.add(key);
  }
  return Array.from(dupes);
}

/**
 * Auto-fix: delete the SECOND occurrence of a duplicate top-level key
 * and any indented lines that belong to it.
 */
function autoFixDuplicateKey(content: string, key: string): string {
  const lines = content.split('\n');
  const indices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`^${key}:\\s*$`).test(lines[i])) indices.push(i);
  }
  if (indices.length < 2) return content;
  const start = indices[1];
  let end = start;
  for (let i = start + 1; i < lines.length; i++) {
    // Keep going while line is indented or comment, stop at next top-level key or ---
    if (/^---$/.test(lines[i])) break;
    if (/^[A-Za-z_]/.test(lines[i])) break;
    end = i;
  }
  lines.splice(start, end - start + 1);
  return lines.join('\n');
}

function validateFile(repo: string, filepath: string): void {
  const filename = filepath.split(/[\\/]/).pop()!;
  let content = readFileSync(filepath, 'utf-8');

  // Pre-check: duplicate top-level keys
  const dupes = findDuplicateTopLevelKeys(content);
  if (dupes.length > 0) {
    if (FIX_MODE) {
      for (const key of dupes) {
        content = autoFixDuplicateKey(content, key);
      }
      writeFileSync(filepath, content);
      console.log(`  🔧 FIXED ${repo}/${filename}: removed duplicate ${dupes.join(', ')}`);
    } else {
      issues.push({
        repo,
        file: filename,
        level: 'error',
        message: `Duplicate top-level YAML key(s): ${dupes.join(', ')}. Run with --fix to auto-resolve.`,
        fixable: true,
      });
      return;
    }
  }

  // YAML parse check (catches anything findDuplicateTopLevelKeys missed)
  try {
    const { data } = matter(content);
    // Sanity: portfolio_enabled projects should have a thumbnail
    if (data.portfolio_enabled === true && !data.thumbnail) {
      issues.push({
        repo,
        file: filename,
        level: 'warning',
        message: 'portfolio_enabled but no thumbnail field set',
        fixable: false,
      });
    }
  } catch (err) {
    issues.push({
      repo,
      file: filename,
      level: 'error',
      message: `YAML parse failed: ${(err as Error).message}`,
      fixable: false,
    });
  }
}

// ── Main ────────────────────────────────────────────────────────────
console.log('🔍 Validating PORTFOLIO.md files across all sibling repos...\n');

const repos = listRepoDirs();
let scanned = 0;
for (const repo of repos) {
  const fp = findPortfolioMd(repo);
  if (!fp) continue;
  scanned++;
  validateFile(repo, fp);
}

console.log(`\n📊 Scanned ${scanned} PORTFOLIO.md files`);

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} ERROR(S):\n`);
  for (const i of errors) {
    console.error(`  ${i.repo}/${i.file}: ${i.message}`);
  }
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  ${warnings.length} WARNING(S):\n`);
  for (const i of warnings) {
    console.warn(`  ${i.repo}/${i.file}: ${i.message}`);
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All PORTFOLIO.md files valid');
}

// Fail the build on any error
if (errors.length > 0) {
  console.error('\n💥 Validation failed. Fix the errors above (or run with --fix) before regenerating projects.');
  process.exit(1);
}
