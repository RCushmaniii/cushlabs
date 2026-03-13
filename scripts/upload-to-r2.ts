/**
 * Upload portfolio assets from local project clones to Cloudflare R2.
 *
 * Scans each project's PORTFOLIO.md for asset references (slides, thumbnails,
 * video, poster), finds the files in the local clone's public/ directory,
 * and uploads them to the R2 bucket under /{repo-name}/{path}.
 *
 * Usage:
 *   npx tsx scripts/upload-to-r2.ts              # upload all projects
 *   npx tsx scripts/upload-to-r2.ts ny-eng        # upload one project
 *   npx tsx scripts/upload-to-r2.ts --dry-run     # preview without uploading
 *
 * Required .env vars:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, S3_API (R2 endpoint)
 */

import { config } from 'dotenv';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, existsSync, readdirSync } from 'fs';
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

// ── Helpers ─────────────────────────────────────────────────────────
interface UploadTask {
  repo: string;
  localPath: string;
  r2Key: string;
  size: number;
}

function findLocalFile(repo: string, assetPath: string): string | null {
  // assetPath comes from PORTFOLIO.md, e.g. "/images/portfolio/foo-01.webp"
  // Strip leading /public/ if present (common PORTFOLIO.md mistake)
  const cleaned = assetPath.replace(/^\/public\//, '/');
  const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

  // Try: {projects_root}/{repo}/public{normalizedPath}
  const candidate = join(PROJECTS_ROOT, repo, 'public', normalizedPath);
  if (existsSync(candidate)) return candidate;

  // Try without /portfolio/ subdirectory (some repos use /images/ directly)
  // Already handled by the path as-is

  return null;
}

function parsePortfolioMd(repo: string): string[] {
  const paths: string[] = [];
  const mdPath = join(PROJECTS_ROOT, repo, 'PORTFOLIO.md');
  if (!existsSync(mdPath)) return paths;

  const raw = readFileSync(mdPath, 'utf-8');
  const { data } = matter(raw);

  // Collect all asset paths from frontmatter
  if (data.thumbnail) paths.push(data.thumbnail);
  if (data.video_url) paths.push(data.video_url);
  if (data.video_poster) paths.push(data.video_poster);
  if (data.demo_video_url) paths.push(data.demo_video_url);
  if (data.demo_video_poster) paths.push(data.demo_video_poster);

  if (Array.isArray(data.slides)) {
    for (const slide of data.slides) {
      if (slide.src) paths.push(slide.src);
    }
  }

  return paths;
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(task: UploadTask, dryRun: boolean): Promise<boolean> {
  const { r2Key, localPath } = task;

  if (dryRun) {
    console.log(`  [DRY RUN] Would upload: ${r2Key} (${(task.size / 1024).toFixed(0)}KB)`);
    return true;
  }

  // Check if already uploaded
  const exists = await objectExists(r2Key);
  if (exists) {
    console.log(`  [SKIP] Already exists: ${r2Key}`);
    return true;
  }

  const body = readFileSync(localPath);
  const contentType = getMimeType(localPath);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  console.log(`  [UPLOADED] ${r2Key} (${(task.size / 1024).toFixed(0)}KB, ${contentType})`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
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
  if (dryRun) console.log('   ⚠️  DRY RUN — no files will be uploaded\n');
  else console.log('');

  let totalUploaded = 0;
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

    const repoDir = join(PROJECTS_ROOT, repo);
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

      const { statSync } = await import('fs');
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
        const uploaded = await uploadFile(task, dryRun);
        if (uploaded) {
          totalUploaded++;
          totalBytes += stat.size;
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
  console.log(`  Uploaded/Exists: ${totalUploaded}`);
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
