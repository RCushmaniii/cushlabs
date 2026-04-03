/**
 * Upload portfolio assets from local project clones to Cloudflare R2.
 *
 * Scans each project's PORTFOLIO.md for asset references (slides, thumbnails,
 * video, poster), finds the files in the local clone's public/ directory,
 * and uploads them to the R2 bucket under /{repo-name}/{path}.
 *
 * Usage:
 *   npx tsx scripts/upload-to-r2.ts              # upload all (skip unchanged)
 *   npx tsx scripts/upload-to-r2.ts ny-eng        # upload one project
 *   npx tsx scripts/upload-to-r2.ts --dry-run     # preview without uploading
 *   npx tsx scripts/upload-to-r2.ts --force        # re-upload all (ignore cache)
 *   npx tsx scripts/upload-to-r2.ts ny-eng --force # re-upload one project
 *
 * Required .env vars:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, S3_API (R2 endpoint)
 */

import { config } from 'dotenv';
import { createHash } from 'crypto';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────
const BUCKET = 'cushlabs-assets';
const CDN_BASE = 'https://cdn.cushlabs.ai';
const PROJECTS_ROOT = join(__dirname, '..', '..'); // Parent of cushlabs repo
const SELF_REPO = 'cushlabs';

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const S3_ENDPOINT = process.env.S3_API;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !S3_ENDPOINT) {
  console.error('❌ Missing R2 credentials. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and S3_API in .env');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ── MIME types ──────────────────────────────────────────────────────
const MIME_MAP: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function getMimeType(filepath: string): string {
  return MIME_MAP[extname(filepath).toLowerCase()] || 'application/octet-stream';
}

// ── Repo name aliases (local clone name differs from GitHub repo name) ──
const REPO_ALIASES: Record<string, string> = {
  'stock-alert': 'ai-stock-alert',
};

// ── Helpers ─────────────────────────────────────────────────────────
interface UploadTask {
  repo: string;
  localPath: string;
  r2Key: string;
  size: number;
}

function getLocalDir(repo: string): string {
  const alias = REPO_ALIASES[repo] || repo;
  return join(PROJECTS_ROOT, alias);
}

function findLocalFile(repo: string, assetPath: string): string | null {
  // assetPath comes from PORTFOLIO.md, e.g. "/images/portfolio/foo-01.webp"
  const cleaned = assetPath.replace(/^\/public\//, '/');
  const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  const localDir = getLocalDir(repo);

  // Try: {localDir}/public{normalizedPath}
  const candidate1 = join(localDir, 'public', normalizedPath);
  if (existsSync(candidate1)) return candidate1;

  // Try: {localDir}{normalizedPath} (assets at repo root, e.g. /assets/images/...)
  const candidate2 = join(localDir, normalizedPath);
  if (existsSync(candidate2)) return candidate2;

  // Try: {localDir}/client/public{normalizedPath} (e.g. ai-resume-tailor)
  const candidate3 = join(localDir, 'client', 'public', normalizedPath);
  if (existsSync(candidate3)) return candidate3;

  // Try: {localDir}/client/dist{normalizedPath}
  const candidate4 = join(localDir, 'client', 'dist', normalizedPath);
  if (existsSync(candidate4)) return candidate4;

  // Try: {localDir}/dist{normalizedPath}
  const candidate5 = join(localDir, 'dist', normalizedPath);
  if (existsSync(candidate5)) return candidate5;

  // Try: swap /images/ for /videos/ and vice versa (some repos use /videos/ not /video/)
  const swapped = normalizedPath.replace('/images/', '/videos/').replace('/public/images/', '/public/videos/');
  if (swapped !== normalizedPath) {
    const candidate6 = join(localDir, 'public', swapped);
    if (existsSync(candidate6)) return candidate6;
  }

  return null;
}

/** Scan local directories for portfolio image/video files not listed in PORTFOLIO.md */
function scanLocalPortfolioAssets(repo: string): string[] {
  const localDir = getLocalDir(repo);
  const found: string[] = [];
  const extensions = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm']);

  // Directories to scan for portfolio assets
  const scanDirs = [
    join(localDir, 'public', 'portfolio'),
    join(localDir, 'public', 'images', 'portfolio'),
    join(localDir, 'public', 'video'),
    join(localDir, 'public', 'videos'),
    join(localDir, 'public', 'images'),
    join(localDir, 'assets', 'images', 'portfolio'),
    join(localDir, 'assets', 'video'),
    join(localDir, 'assets', 'images'),
    join(localDir, 'client', 'public', 'images'),
    join(localDir, 'client', 'public', 'images', 'portfolio'),
  ];

  function scanRecursive(dir: string) {
    if (!existsSync(dir)) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          scanRecursive(fullPath);
        } else {
          const ext = extname(entry.name).toLowerCase();
          if (!extensions.has(ext)) continue;
          const relativePath = fullPath.replace(localDir, '').replace(/\\/g, '/');
          const cleanedPath = relativePath.replace(/^\/public\//, '/');
          found.push(cleanedPath);
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  for (const dir of scanDirs) {
    scanRecursive(dir);
  }

  return found;
}

function parsePortfolioMd(repo: string): string[] {
  const paths: string[] = [];
  const localDir = getLocalDir(repo);
  const mdPath = join(localDir, 'PORTFOLIO.md');
  if (!existsSync(mdPath)) return paths;

  const raw = readFileSync(mdPath, 'utf-8');
  const { data } = matter(raw);

  // Collect all asset paths from frontmatter
  if (data.thumbnail) paths.push(data.thumbnail);
  if (data.video_url) paths.push(data.video_url);
  if (data.video_poster) paths.push(data.video_poster);
  if (data.demo_video_url) paths.push(data.demo_video_url);
  if (data.demo_video_poster) paths.push(data.demo_video_poster);

  // Check both slides and hero_images (PORTFOLIO.md uses either key)
  const slideArray = data.slides ?? data.hero_images ?? [];
  if (Array.isArray(slideArray)) {
    for (const slide of slideArray) {
      if (typeof slide === 'string') {
        paths.push(slide);
      } else if (slide.src) {
        paths.push(slide.src);
        if (slide.src_es) paths.push(slide.src_es);
      }
    }
  }

  // Also scan local directories for any portfolio assets not in frontmatter
  const scanned = scanLocalPortfolioAssets(repo);
  // Normalize all paths for dedup: strip /public/ prefix to match scanned format
  const normalizedSet = new Set(paths.map(p => p.replace(/^\/public\//, '/')));
  for (const p of scanned) {
    const normalized = p.replace(/^\/public\//, '/');
    if (!normalizedSet.has(normalized)) {
      normalizedSet.add(normalized);
      paths.push(p);
    }
  }

  return paths;
}

function localMd5(filePath: string): string {
  const data = readFileSync(filePath);
  return createHash('md5').update(data).digest('hex');
}

async function getRemoteEtag(key: string): Promise<string | null> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    // R2 ETag is MD5 wrapped in quotes for single-part uploads
    return head.ETag?.replace(/"/g, '') || null;
  } catch {
    return null; // Object doesn't exist
  }
}

type UploadResult = 'uploaded' | 'updated' | 'skipped';

async function uploadFile(task: UploadTask, dryRun: boolean, force: boolean): Promise<UploadResult> {
  const { r2Key, localPath } = task;
  const body = readFileSync(localPath);
  const localHash = createHash('md5').update(body).digest('hex');

  if (!force) {
    const remoteEtag = await getRemoteEtag(r2Key);
    if (remoteEtag) {
      if (remoteEtag === localHash) {
        console.log(`  [SKIP] Unchanged: ${r2Key}`);
        return 'skipped';
      }
      // File exists but content differs
      if (dryRun) {
        console.log(`  [DRY RUN] Would UPDATE (content changed): ${r2Key} (${(task.size / 1024).toFixed(0)}KB)`);
        return 'updated';
      }
      const contentType = getMimeType(localPath);
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      console.log(`  [UPDATED] ${r2Key} (${(task.size / 1024).toFixed(0)}KB, content changed)`);
      return 'updated';
    }
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would upload: ${r2Key} (${(task.size / 1024).toFixed(0)}KB)`);
    return 'uploaded';
  }

  const contentType = getMimeType(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  console.log(`  [UPLOADED] ${r2Key} (${(task.size / 1024).toFixed(0)}KB, ${contentType})`);
  return 'uploaded';
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const targetRepo = args.find(a => !a.startsWith('--'));

  // Load project list from generated JSON
  const jsonPath = join(__dirname, '..', 'src', 'data', 'projects.generated.json');
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  let projects: Array<{ name: string }> = data.projects;

  if (targetRepo) {
    projects = projects.filter(p => p.name === targetRepo);
    if (projects.length === 0) {
      console.error(`❌ Project "${targetRepo}" not found in projects.generated.json`);
      process.exit(1);
    }
  }

  console.log(`\n📦 Uploading portfolio assets to R2 (${CDN_BASE})`);
  console.log(`   Bucket: ${BUCKET}`);
  console.log(`   Projects: ${projects.length}`);
  if (force) console.log('   FORCE MODE — re-uploading all files');
  if (dryRun) console.log('   ⚠️  DRY RUN — no files will be uploaded\n');
  else console.log('');

  let totalUploaded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalBytes = 0;
  const failedRepos: string[] = [];

  for (const project of projects) {
    const repo = project.name;
    if (repo === SELF_REPO) {
      console.log(`[${repo}] Skipping — assets served locally from cushlabs.ai`);
      continue;
    }

    const repoDir = getLocalDir(repo);
    if (!existsSync(repoDir)) {
      console.log(`[${repo}] ⚠️  No local clone found at ${repoDir}`);
      failedRepos.push(repo);
      continue;
    }

    const assetPaths = parsePortfolioMd(repo);
    if (assetPaths.length === 0) {
      console.log(`[${repo}] No assets in PORTFOLIO.md`);
      continue;
    }

    console.log(`[${repo}] ${assetPaths.length} assets`);

    for (const assetPath of assetPaths) {
      const localPath = findLocalFile(repo, assetPath);
      if (!localPath) {
        console.log(`  [MISS] Cannot find locally: ${assetPath}`);
        totalFailed++;
        continue;
      }

      const stat = statSync(localPath);
      // R2 key: {repo}/{normalized-path} (no leading slash)
      const cleaned = assetPath.replace(/^\/public\//, '/').replace(/^\//, '');
      const r2Key = `${repo}/${cleaned}`;

      const task: UploadTask = {
        repo,
        localPath,
        r2Key,
        size: stat.size,
      };

      try {
        const result = await uploadFile(task, dryRun, force);
        if (result === 'uploaded') {
          totalUploaded++;
          totalBytes += stat.size;
        } else if (result === 'updated') {
          totalUpdated++;
          totalBytes += stat.size;
        } else {
          totalSkipped++;
        }
      } catch (err: any) {
        console.log(`  [ERROR] ${r2Key}: ${err.message}`);
        totalFailed++;
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`  New uploads:     ${totalUploaded}`);
  console.log(`  Updated (diff):  ${totalUpdated}`);
  console.log(`  Unchanged:       ${totalSkipped}`);
  console.log(`  Failed/Missing:  ${totalFailed}`);
  console.log(`  Total size:      ${(totalBytes / 1048576).toFixed(1)}MB`);
  if (failedRepos.length > 0) {
    console.log(`  Missing clones:  ${failedRepos.join(', ')}`);
  }
  console.log(`\n  CDN base URL: ${CDN_BASE}`);
  console.log(`  Example: ${CDN_BASE}/ny-eng/images/portfolio/ny-eng-01.webp`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
