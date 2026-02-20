/**
 * migrate-portfolio-md.ts
 *
 * Fetches PORTFOLIO.md from every RCushmaniii repo, applies field migrations
 * to the canonical schema, and pushes updated files back to GitHub.
 *
 * Usage:
 *   GITHUB_TOKEN=$(gh auth token) npx tsx scripts/migrate-portfolio-md.ts --dry-run
 *   GITHUB_TOKEN=$(gh auth token) npx tsx scripts/migrate-portfolio-md.ts
 */

import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';

config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? 'RCushmaniii';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// ── Helpers ─────────────────────────────────────────────────────────

interface FileInfo {
  content: string;
  sha: string;
  filename: string; // 'PORTFOLIO.md' or 'portfolio.md'
}

async function fetchPortfolioFile(owner: string, repo: string): Promise<FileInfo | null> {
  for (const filename of ['PORTFOLIO.md', 'portfolio.md']) {
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: filename });
      if ('content' in data && 'sha' in data) {
        const content = Buffer.from(data.content as string, 'base64').toString('utf-8');
        return { content, sha: data.sha as string, filename };
      }
    } catch {
      // not found, try next
    }
  }
  return null;
}

/** Always double-quote YAML values for safety. */
function yq(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const s = String(value);
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// ── Migration Logic ─────────────────────────────────────────────────

function migrateFields(fm: Record<string, unknown>, repoName: string): { fm: Record<string, unknown>; changes: string[] } {
  const out: Record<string, unknown> = { ...fm };
  const changes: string[] = [];

  // 1. Old control flags
  if ('include_in_portfolio' in out) {
    out.portfolio_enabled = out.include_in_portfolio;
    delete out.include_in_portfolio;
    changes.push('include_in_portfolio → portfolio_enabled');
  }
  if ('portfolio_order' in out) {
    out.portfolio_priority = out.portfolio_order;
    delete out.portfolio_order;
    changes.push('portfolio_order → portfolio_priority');
  }
  if ('is_featured' in out) {
    out.portfolio_featured = out.is_featured;
    delete out.is_featured;
    changes.push('is_featured → portfolio_featured');
  }

  // 2. hero_images → slides
  if ('hero_images' in out) {
    const hi = out.hero_images;
    if (Array.isArray(hi) && hi.length > 0) {
      const first = hi[0];
      if (typeof first === 'string') {
        // Flat string paths
        out.slides = hi.map((p: string, i: number) => ({
          src: p,
          alt_en: `${out.title || repoName} slide ${i + 1}`,
          alt_es: `${out.title || repoName} diapositiva ${i + 1}`,
        }));
        changes.push(`hero_images (flat strings × ${hi.length}) → slides`);
      } else if (typeof first === 'object' && first !== null) {
        if ('path' in first) {
          // { path, alt, caption } format
          out.slides = hi.map((img: Record<string, string>) => ({
            src: img.path,
            ...(img.src_es ? { src_es: img.src_es } : {}),
            alt_en: img.alt || img.caption || String(out.title || repoName),
            alt_es: img.alt_es || img.caption || String(out.title || repoName),
          }));
          changes.push(`hero_images (path/alt/caption × ${hi.length}) → slides`);
        } else if ('src' in first) {
          // Already { src, alt_en, alt_es } — just rename the key
          out.slides = hi.map((img: Record<string, string>) => {
            const slide: Record<string, string> = {
              src: img.src,
              alt_en: img.alt_en,
              alt_es: img.alt_es,
            };
            if (img.src_es) slide.src_es = img.src_es;
            return slide;
          });
          changes.push(`hero_images → slides (renamed, ${hi.length} items)`);
        }
      }
    } else {
      // Empty array — just drop it
      changes.push('hero_images: [] → removed');
    }
    delete out.hero_images;
  }

  // 3. demo_video_url → video_url
  if ('demo_video_url' in out) {
    out.video_url = out.demo_video_url;
    delete out.demo_video_url;
    changes.push('demo_video_url → video_url');
  }

  // 4. video_brief object → flat fields
  if ('video_brief' in out) {
    const vb = out.video_brief as Record<string, string> | null;
    if (vb && typeof vb === 'object') {
      if (vb.url) out.video_url = vb.url;
      if (vb.poster) out.video_poster = vb.poster;
      changes.push('video_brief { url, poster } → video_url + video_poster');
    }
    delete out.video_brief;
  }

  // 5. Category normalization
  const catMap: Record<string, string> = {
    'AI / Chatbots': 'AI Automation',
    'ai-automation': 'AI Automation',
    'ai automation': 'AI Automation',
    'document-processing': 'Document Processing',
    'web-tools': 'Web Tools',
    'developer-tools': 'Developer Tools',
    'dev-tools': 'Developer Tools',
    'templates': 'Templates',
    'creative': 'Creative',
    'tools': 'Tools',
    'marketing': 'Marketing',
  };
  if (typeof out.category === 'string' && catMap[out.category]) {
    const old = out.category;
    out.category = catMap[out.category];
    changes.push(`category "${old}" → "${out.category}"`);
  }

  // 6. Warn on oversized tech_stack
  if (Array.isArray(out.tech_stack) && out.tech_stack.length > 5) {
    changes.push(`⚠️  tech_stack has ${out.tech_stack.length} items (max recommended: 5)`);
  }

  return { fm: out, changes };
}

// ── Canonical YAML Builder ──────────────────────────────────────────

function buildCanonical(fm: Record<string, unknown>, body: string): string {
  const L: string[] = ['---'];

  // Control flags
  L.push('# === CONTROL FLAGS ===');
  L.push(`portfolio_enabled: ${fm.portfolio_enabled ?? true}`);
  L.push(`portfolio_priority: ${fm.portfolio_priority ?? 99}`);
  L.push(`portfolio_featured: ${fm.portfolio_featured ?? false}`);
  L.push('');

  // Card display
  L.push('# === CARD DISPLAY ===');
  if (fm.title) L.push(`title: ${yq(fm.title)}`);
  if (fm.tagline) L.push(`tagline: ${yq(fm.tagline)}`);
  if (fm.slug) L.push(`slug: ${yq(fm.slug)}`);
  if (fm.category) L.push(`category: ${yq(fm.category)}`);
  if (Array.isArray(fm.tech_stack) && fm.tech_stack.length > 0) {
    L.push('tech_stack:');
    for (const t of fm.tech_stack) L.push(`  - ${yq(t)}`);
  }
  if (fm.thumbnail) L.push(`thumbnail: ${yq(fm.thumbnail)}`);
  if (fm.thumbnail_es) L.push(`thumbnail_es: ${yq(fm.thumbnail_es)}`);
  if (fm.status) L.push(`status: ${yq(fm.status)}`);
  L.push('');

  // Detail page
  L.push('# === DETAIL PAGE ===');
  if (fm.problem) L.push(`problem: ${yq(fm.problem)}`);
  if (fm.solution) L.push(`solution: ${yq(fm.solution)}`);
  if (Array.isArray(fm.key_features) && fm.key_features.length > 0) {
    L.push('key_features:');
    for (const f of fm.key_features) L.push(`  - ${yq(f)}`);
  }
  L.push('');

  // Slides
  const slides = fm.slides as Record<string, string>[] | undefined;
  if (Array.isArray(slides) && slides.length > 0) {
    L.push('# === MEDIA: PORTFOLIO SLIDES ===');
    L.push('slides:');
    for (const s of slides) {
      L.push(`  - src: ${yq(s.src)}`);
      if (s.src_es) L.push(`    src_es: ${yq(s.src_es)}`);
      L.push(`    alt_en: ${yq(s.alt_en)}`);
      L.push(`    alt_es: ${yq(s.alt_es)}`);
    }
    L.push('');
  }

  // Video
  if (fm.video_url || fm.video_poster) {
    L.push('# === MEDIA: VIDEO ===');
    if (fm.video_url) L.push(`video_url: ${yq(fm.video_url)}`);
    if (fm.video_url_es) L.push(`video_url_es: ${yq(fm.video_url_es)}`);
    if (fm.video_poster) L.push(`video_poster: ${yq(fm.video_poster)}`);
    if (fm.video_poster_es) L.push(`video_poster_es: ${yq(fm.video_poster_es)}`);
    L.push('');
  }

  // Links
  L.push('# === LINKS ===');
  L.push(`demo_url: ${yq(fm.demo_url || '')}`);
  L.push(`live_url: ${yq(fm.live_url || '')}`);
  L.push('');

  // Optional
  L.push('# === OPTIONAL ===');
  if (Array.isArray(fm.metrics) && fm.metrics.length > 0) {
    L.push('metrics:');
    for (const m of fm.metrics) L.push(`  - ${yq(m)}`);
  }
  if (Array.isArray(fm.tags) && fm.tags.length > 0) {
    L.push('tags:');
    for (const tg of fm.tags) L.push(`  - ${yq(tg)}`);
  }
  if (fm.date_completed) L.push(`date_completed: ${yq(fm.date_completed)}`);
  L.push('---');

  if (body && body.trim()) {
    L.push('');
    L.push(body.trim());
  }

  L.push(''); // trailing newline
  return L.join('\n');
}

// ── Main ────────────────────────────────────────────────────────────

interface Result { repo: string; changes: string[]; error?: string }

async function main() {
  console.log('🔄 PORTFOLIO.md Migration Script');
  console.log(`   Mode: ${DRY_RUN ? '🟡 DRY RUN (no changes pushed)' : '🔴 LIVE — changes will be pushed to GitHub'}`);
  console.log('');

  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username: GITHUB_OWNER,
    type: 'owner',
    sort: 'updated',
    per_page: 100,
  });
  console.log(`📦 Found ${repos.length} repositories\n`);

  const results: Result[] = [];
  let migrated = 0, skipped = 0, errors = 0, renamed = 0;

  for (const repo of repos) {
    const file = await fetchPortfolioFile(GITHUB_OWNER, repo.name);
    if (!file) {
      if (VERBOSE) console.log(`⏭️  ${repo.name}: no PORTFOLIO.md`);
      skipped++;
      continue;
    }

    console.log(`📝 ${repo.name} (${file.filename})`);

    try {
      const { data: frontmatter, content: body } = matter(file.content);
      const { fm: migrated_fm, changes } = migrateFields(frontmatter as Record<string, unknown>, repo.name);

      const needsRename = file.filename === 'portfolio.md';

      if (changes.length === 0 && !needsRename) {
        console.log('   ✅ Already canonical\n');
        skipped++;
        continue;
      }

      for (const c of changes) console.log(`   🔧 ${c}`);
      if (needsRename) console.log('   🔧 portfolio.md → PORTFOLIO.md');

      const newContent = buildCanonical(migrated_fm, body);

      if (VERBOSE) {
        console.log('   --- preview ---');
        newContent.split('\n').slice(0, 12).forEach(l => console.log(`   | ${l}`));
        console.log('   ...');
      }

      if (!DRY_RUN) {
        if (needsRename) {
          // Create PORTFOLIO.md (new file — no sha)
          await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: repo.name,
            path: 'PORTFOLIO.md',
            message: 'chore: migrate PORTFOLIO.md to canonical format [skip ci]',
            content: Buffer.from(newContent).toString('base64'),
          });
          // Delete old portfolio.md
          await octokit.repos.deleteFile({
            owner: GITHUB_OWNER,
            repo: repo.name,
            path: 'portfolio.md',
            message: 'chore: remove old portfolio.md after rename [skip ci]',
            sha: file.sha,
          });
          renamed++;
        } else {
          await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_OWNER,
            repo: repo.name,
            path: file.filename,
            message: 'chore: migrate PORTFOLIO.md to canonical format [skip ci]',
            content: Buffer.from(newContent).toString('base64'),
            sha: file.sha,
          });
        }
      } else {
        if (needsRename) {
          console.log('   [DRY RUN] Would create PORTFOLIO.md and delete portfolio.md');
        } else {
          console.log(`   [DRY RUN] Would update ${file.filename}`);
        }
      }

      migrated++;
      results.push({ repo: repo.name, changes });
      console.log('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`   ❌ Error: ${msg}\n`);
      errors++;
      results.push({ repo: repo.name, changes: [], error: msg });
    }
  }

  // Summary
  console.log('\n📊 Migration Summary');
  console.log('═'.repeat(50));
  console.log(`  Total repos:    ${repos.length}`);
  console.log(`  Migrated:       ${migrated}`);
  console.log(`  Renamed:        ${renamed}`);
  console.log(`  Skipped/clean:  ${skipped}`);
  console.log(`  Errors:         ${errors}`);

  const changed = results.filter(r => r.changes.length > 0);
  if (changed.length > 0) {
    console.log('\n  Changes by repo:');
    for (const r of changed) {
      console.log(`    ${r.repo}:`);
      for (const c of r.changes) console.log(`      - ${c}`);
    }
  }

  const errored = results.filter(r => r.error);
  if (errored.length > 0) {
    console.log('\n  Errors:');
    for (const r of errored) console.log(`    ${r.repo}: ${r.error}`);
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
