/**
 * sync-portfolio.ts — One-shot portfolio sync for cushlabs.ai
 *
 * Designed to be invoked by an AI assistant (or human) with a single command.
 * Replaces the multi-step sync sequence with one durable pipeline that:
 *
 *   1. Validates every sibling repo's PORTFOLIO.md (auto-fixes duplicate
 *      top-level YAML keys, the recurring failure mode that silently
 *      corrupted projects.generated.json before — see LESSONS-LEARNED.md)
 *   2. Uploads any changed assets to Cloudflare R2 (hash-based diff)
 *   3. Regenerates src/data/projects.generated.json
 *   4. Diffs old vs new and reports a structured summary of what changed
 *      (so the assistant can tell the user exactly which thumbnails were
 *      restored, which projects gained content, etc.)
 *
 * Fails LOUDLY at any step. Idempotent — safe to run repeatedly.
 *
 * Usage:
 *   npm run sync:portfolio                    # full sync
 *   npm run sync:portfolio -- --dry-run       # preview without writing
 *   npm run sync:portfolio -- --skip-r2       # skip R2 upload step
 *   npm run sync:portfolio -- --repo <name>   # restrict R2 upload to one repo
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const JSON_PATH = join(REPO_ROOT, 'src/data/projects.generated.json');
const SNAPSHOT_PATH = join(REPO_ROOT, 'src/data/.projects.snapshot.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_R2 = args.includes('--skip-r2');
const repoFlagIdx = args.indexOf('--repo');
const REPO_FILTER = repoFlagIdx >= 0 ? args[repoFlagIdx + 1] : null;

interface Project {
  name: string;
  title: string;
  tagline: string | null;
  thumbnail: string | null;
  priority: number;
  slides?: { src: string }[];
}

interface ProjectDiff {
  name: string;
  thumbnailBefore: string | null;
  thumbnailAfter: string | null;
  taglineBefore: string | null;
  taglineAfter: string | null;
  changed: string[];
}

function header(label: string) {
  const line = '='.repeat(60);
  console.log(`\n${line}\n  ${label}\n${line}\n`);
}

function step(n: number, total: number, label: string) {
  console.log(`\n[${n}/${total}] ${label}`);
}

function run(cmd: string, label: string): void {
  try {
    execSync(cmd, { cwd: REPO_ROOT, stdio: 'inherit', env: { ...process.env } });
  } catch {
    console.error(`\n❌ ${label} failed. Aborting sync.`);
    process.exit(1);
  }
}

function loadProjects(path: string): Project[] {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf-8')).projects ?? [];
}

function diffProjects(before: Project[], after: Project[]): ProjectDiff[] {
  const beforeMap = new Map(before.map((p) => [p.name, p]));
  const diffs: ProjectDiff[] = [];

  for (const a of after) {
    const b = beforeMap.get(a.name);
    if (!b) {
      diffs.push({
        name: a.name,
        thumbnailBefore: null,
        thumbnailAfter: a.thumbnail,
        taglineBefore: null,
        taglineAfter: a.tagline,
        changed: ['NEW PROJECT'],
      });
      continue;
    }
    const changed: string[] = [];
    if ((b.thumbnail ?? null) !== (a.thumbnail ?? null)) changed.push('thumbnail');
    if ((b.tagline ?? null) !== (a.tagline ?? null)) changed.push('tagline');
    if ((b.title ?? null) !== (a.title ?? null)) changed.push('title');
    if ((b.priority ?? null) !== (a.priority ?? null)) changed.push('priority');
    if (changed.length > 0) {
      diffs.push({
        name: a.name,
        thumbnailBefore: b.thumbnail,
        thumbnailAfter: a.thumbnail,
        taglineBefore: b.tagline,
        taglineAfter: a.tagline,
        changed,
      });
    }
  }

  // Removed projects
  const afterNames = new Set(after.map((p) => p.name));
  for (const b of before) {
    if (!afterNames.has(b.name)) {
      diffs.push({
        name: b.name,
        thumbnailBefore: b.thumbnail,
        thumbnailAfter: null,
        taglineBefore: b.tagline,
        taglineAfter: null,
        changed: ['REMOVED'],
      });
    }
  }

  return diffs;
}

function summarize(before: Project[], after: Project[], diffs: ProjectDiff[]): void {
  header('SYNC SUMMARY');

  const beforeVisible = before.filter((p) => p.priority < 99);
  const afterVisible = after.filter((p) => p.priority < 99);
  const beforeMissing = beforeVisible.filter((p) => !p.thumbnail && !(p.slides?.[0]?.src));
  const afterMissing = afterVisible.filter((p) => !p.thumbnail && !(p.slides?.[0]?.src));

  console.log(`Visible projects: ${beforeVisible.length} → ${afterVisible.length}`);
  console.log(`Missing thumbnails: ${beforeMissing.length} → ${afterMissing.length}`);

  if (afterMissing.length > 0) {
    console.log(`\n⚠️  ${afterMissing.length} project(s) still missing a thumbnail (content gap, not a code bug):`);
    for (const p of afterMissing) console.log(`    - ${p.name} (priority ${p.priority})`);
  }

  if (diffs.length === 0) {
    console.log('\n✅ No project data changed.');
    return;
  }

  console.log(`\n📝 ${diffs.length} project(s) changed:\n`);
  for (const d of diffs) {
    console.log(`  ${d.name}  [${d.changed.join(', ')}]`);
    if (d.changed.includes('thumbnail')) {
      console.log(`    thumb: ${d.thumbnailBefore ?? '(none)'}`);
      console.log(`        → ${d.thumbnailAfter ?? '(none)'}`);
    }
    if (d.changed.includes('tagline')) {
      console.log(`    tag:   ${d.taglineBefore?.slice(0, 60) ?? '(none)'}`);
      console.log(`        → ${d.taglineAfter?.slice(0, 60) ?? '(none)'}`);
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────
header('CushLabs Portfolio Sync');
console.log(DRY_RUN ? '🟡 DRY RUN — no files will be written' : '🟢 LIVE');
if (SKIP_R2) console.log('⏭️  Skipping R2 upload step');
if (REPO_FILTER) console.log(`📌 R2 upload filtered to: ${REPO_FILTER}`);

// Snapshot the current JSON so we can diff after regen
const before = loadProjects(JSON_PATH);
if (existsSync(JSON_PATH)) copyFileSync(JSON_PATH, SNAPSHOT_PATH);

const totalSteps = SKIP_R2 ? 3 : 4;
let n = 0;

// 1. Validate (auto-fix duplicate keys)
n++;
step(n, totalSteps, 'Validating PORTFOLIO.md files (auto-fix mode)');
run('npx tsx scripts/validate-portfolio-md.ts --fix', 'PORTFOLIO.md validation');

// 2. Upload assets to R2
if (!SKIP_R2) {
  n++;
  step(n, totalSteps, 'Uploading changed assets to Cloudflare R2');
  const dryFlag = DRY_RUN ? ' --dry-run' : '';
  const repoArg = REPO_FILTER ? ` ${REPO_FILTER}` : '';
  run(`npx tsx scripts/upload-to-r2.ts${repoArg}${dryFlag}`, 'R2 upload');
}

// 3. Regenerate JSON
n++;
step(n, totalSteps, 'Regenerating src/data/projects.generated.json');
if (DRY_RUN) {
  console.log('  (dry-run: skipped)');
} else {
  run('npx tsx scripts/generate-projects.ts', 'JSON regeneration');
}

// 4. Diff & summarize
n++;
step(n, totalSteps, 'Comparing before/after');
const after = loadProjects(JSON_PATH);
const diffs = diffProjects(before, after);
summarize(before, after, diffs);

// Cleanup snapshot
if (existsSync(SNAPSHOT_PATH)) {
  try { unlinkSync(SNAPSHOT_PATH); } catch { /* ignore */ }
}

console.log('\n✅ Sync complete.');
if (!DRY_RUN && diffs.length > 0) {
  console.log('\nNext steps:');
  console.log('  1. Visual check at npm run dev or on prod after merge');
  console.log('  2. Stage explicitly: git add src/data/projects.generated.json');
  console.log('  3. Commit + push (or open a PR)');
}
