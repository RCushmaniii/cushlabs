import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for existing projects file
const outputPath = join(__dirname, '../src/data/projects.generated.json');

interface Slide {
  src: string;
  srcEs?: string;
  altEn: string;
  altEs: string;
}

interface Project {
  id: number;
  name: string;
  title: string;
  description: string;
  summary: string;
  url: string;
  demoUrl: string | null;
  liveUrl: string | null;
  homepage: string | null;
  topics: string[];
  categories: string[];
  tags: string[];
  stack: string[];
  status: string | null;
  language: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  lastPushed: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  // Portfolio.md fields
  tagline: string | null;
  thumbnail: string | null;
  problem: string | null;
  solution: string | null;
  keyFeatures: string[];
  metrics: string[];
  priority: number;
  dateCompleted: string | null;
  slides: Slide[];
  videoUrl: string | null;
  videoPoster: string | null;
}

interface PortfolioFrontmatter {
  portfolio_enabled?: boolean;
  portfolio_priority?: number;
  portfolio_featured?: boolean;
  title?: string;
  tagline?: string;
  slug?: string;
  category?: string;
  tech_stack?: string[];
  thumbnail?: string;
  status?: string;
  problem?: string;
  problem_solved?: string;
  solution?: string;
  key_features?: string[];
  key_outcomes?: string[];
  metrics?: string[];
  demo_url?: string;
  live_url?: string;
  slides?: (string | { src: string; src_es?: string; alt_en: string; alt_es: string })[];
  hero_images?: (string | { src: string; src_es?: string; alt_en: string; alt_es: string })[];
  video_url?: string;
  video_poster?: string;
  demo_video_url?: string;
  demo_video_poster?: string;
  tags?: string[];
  date_completed?: string;
}

const GITHUB_TOKEN = process.env.PROJECT_SYNC_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? 'RCushmaniii';
const SELF_REPO = 'cushlabs'; // Assets in this repo are local — keep relative paths
const CDN_BASE = 'https://cdn.cushlabs.ai'; // Cloudflare R2 CDN for portfolio assets

// ── Sync issue tracking ──────────────────────────────────────────────
interface SyncIssue {
  level: 'error' | 'warning';
  repo: string;
  message: string;
}
const syncIssues: SyncIssue[] = [];

/**
 * Resolve a relative asset path to an absolute URL.
 * - Paths in the cushlabs repo itself stay relative (served from public/)
 * - Other repos: use their deployment URL (Vercel CDN) if available
 * - Fallback: raw.githubusercontent.com
 */
function resolveAssetUrl(path: string | undefined | null, repoName: string, _deployUrl: string | null): string | null {
  if (!path) return null;
  // Already a full URL — return as-is
  if (/^https?:\/\//i.test(path)) return path;
  if (repoName === SELF_REPO) return path; // local asset

  // Strip /public/ prefix (common PORTFOLIO.md mistake)
  const cleaned = path.replace(/^\/public\//, '/');
  // Normalize: ensure path starts with /
  const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;

  // All external repo assets are served from Cloudflare R2 CDN
  // Assets are stored as: {cdn}/{repoName}/{path}
  return `${CDN_BASE}/${repoName}${normalizedPath}`;
}

// On CI/Vercel builds, use the committed projects.generated.json as source of truth.
// The GitHub API can serve stale cached PORTFOLIO.md data, and CI has no local clones.
// Run generate-projects locally to refresh, then commit the result.
if (process.env.VERCEL || process.env.CI) {
  if (existsSync(outputPath)) {
    console.log('✅ CI/Vercel detected — using committed projects.generated.json');
    process.exit(0);
  }
  console.warn('⚠️  CI/Vercel detected but no projects.generated.json found — will generate from API');
}

if (!GITHUB_TOKEN) {
  if (existsSync(outputPath)) {
    console.warn('⚠️  GITHUB_TOKEN not set, using existing projects.generated.json');
    process.exit(0);
  }
  console.error('❌ GITHUB_TOKEN environment variable is required (no existing projects file found)');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Local projects directory — fallback when GitHub API can't read private repo contents
const LOCAL_PROJECTS_DIR = join(__dirname, '../../');

function tryLocalPortfolioMd(repo: string): PortfolioFrontmatter | null {
  for (const filename of ['PORTFOLIO.md', 'portfolio.md']) {
    const localPath = join(LOCAL_PROJECTS_DIR, repo, filename);
    if (existsSync(localPath)) {
      try {
        const content = readFileSync(localPath, 'utf-8');
        const { data: frontmatter } = matter(content);
        console.warn(`  📂 Read ${filename} from local clone`);
        return frontmatter as PortfolioFrontmatter;
      } catch {
        // Parse error, skip
      }
    }
  }
  return null;
}

async function fetchPortfolioMd(owner: string, repo: string): Promise<PortfolioFrontmatter | null> {
  // Prefer local clone — always fresher than GitHub's contents API cache
  const local = tryLocalPortfolioMd(repo);
  if (local) return local;

  // Fallback: try GitHub API (PORTFOLIO.md, then portfolio.md)
  let got403 = false;
  for (const filename of ['PORTFOLIO.md', 'portfolio.md']) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filename,
        mediaType: { format: 'raw' }
      });

      const content = typeof data === 'string' ? data : String(data);
      const { data: frontmatter } = matter(content);
      return frontmatter as PortfolioFrontmatter;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 403) got403 = true;
      // File not found or access denied, try next filename
    }
  }

  // Track the 403 only if all sources failed
  if (got403) {
    syncIssues.push({ level: 'error', repo, message: '403 Forbidden — token lacks access to this repo' });
    console.warn(`  ❌ 403 Forbidden — token cannot access PORTFOLIO.md`);
  }

  return null;
}

async function extractDemoUrlFromReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getReadme({
      owner,
      repo,
      mediaType: { format: 'raw' }
    });

    const content = typeof data === 'string' ? data : String(data);

    const demoPatterns = [
      /\[(?:demo|live|production|deployed|preview|site)\]\s*\(([^)]+)\)/gi,
      /(?:demo|live|production|deployed|preview|site):\s*(https?:\/\/[^\s<)]+)/gi,
      /(https?:\/\/[^\s<)]*(?:vercel\.app|netlify\.app|github\.io)[^\s<)]*)/gi
    ];

    for (const pattern of demoPatterns) {
      const match = pattern.exec(content);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function extractSummaryFromReadme(owner: string, repo: string, description: string): Promise<string> {
  try {
    const { data } = await octokit.repos.getReadme({
      owner,
      repo,
      mediaType: { format: 'raw' }
    });

    const content = typeof data === 'string' ? data : String(data);

    const lines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed &&
             !trimmed.startsWith('#') &&
             !trimmed.startsWith('!') &&
             !trimmed.startsWith('[') &&
             !trimmed.startsWith('```') &&
             trimmed.length > 50;
    });

    if (lines.length > 0) {
      return lines[0].trim().substring(0, 200);
    }

    return description;
  } catch {
    return description;
  }
}

function prettifyRepoName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function categorizeTopic(topic: string): { category?: string; tag?: string; stack?: string; status?: string } {
  if (topic.startsWith('cat-')) {
    return { category: topic.replace('cat-', '') };
  }
  if (topic.startsWith('stack-')) {
    return { stack: topic.replace('stack-', '') };
  }
  if (topic.startsWith('status-')) {
    return { status: topic.replace('status-', '') };
  }
  return { tag: topic };
}

async function generateProjects() {
  console.warn('🔍 Fetching repositories from GitHub...');

  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    visibility: 'all',
    affiliation: 'owner',
    sort: 'updated',
    per_page: 100
  });

  console.warn(`📦 Found ${repos.length} repositories`);

  const projects: Project[] = [];
  let skippedByPortfolio = 0;

  for (const repo of repos) {
    console.warn(`\n📝 Processing: ${repo.name}`);

    // Fetch portfolio.md alongside other data
    const portfolio = await fetchPortfolioMd(GITHUB_OWNER, repo.name);

    if (portfolio) {
      console.warn(`  📄 Found PORTFOLIO.md`);
    }

    // If portfolio explicitly disables this repo, skip it
    if (portfolio && portfolio.portfolio_enabled === false) {
      console.warn(`  ⏭️  Skipped (portfolio_enabled: false)`);
      skippedByPortfolio++;
      continue;
    }

    // Parse topics into categories/tags/stack/status
    const categories: string[] = [];
    const tags: string[] = [];
    const stack: string[] = [];
    let status: string | null = null;

    (repo.topics ?? []).forEach(topic => {
      const categorized = categorizeTopic(topic);
      if (categorized.category) categories.push(categorized.category);
      if (categorized.tag) tags.push(categorized.tag);
      if (categorized.stack) stack.push(categorized.stack);
      if (categorized.status) status = categorized.status;
    });

    let isFeatured = repo.topics?.includes('featured') ?? false;

    const description = repo.description ?? '';
    const summary = await extractSummaryFromReadme(GITHUB_OWNER, repo.name, description);

    let demoUrl: string | null = repo.homepage ?? null;

    demoUrl ??= await extractDemoUrlFromReadme(GITHUB_OWNER, repo.name);

    if (!demoUrl && repo.has_pages) {
      demoUrl = `https://${GITHUB_OWNER}.github.io/${repo.name}`;
    }

    let languages: Record<string, number> = {};
    try {
      const { data: langData } = await octokit.repos.listLanguages({
        owner: GITHUB_OWNER,
        repo: repo.name
      });
      languages = langData;
    } catch {
      console.warn(`  ⚠️  Could not fetch languages`);
    }

    // Apply portfolio.md overrides
    if (portfolio) {
      if (portfolio.title) {
        console.warn(`  📌 Title override: "${portfolio.title}"`);
      }
      if (portfolio.category) {
        // Add portfolio category if not already present
        if (!categories.includes(portfolio.category)) {
          categories.push(portfolio.category);
        }
      }
      if (portfolio.tech_stack) {
        // Portfolio tech_stack replaces topic-derived stack
        stack.length = 0;
        stack.push(...portfolio.tech_stack);
      }
      if (portfolio.status) {
        status = portfolio.status;
      }
      if (portfolio.demo_url) {
        demoUrl = portfolio.demo_url;
      }
      if (portfolio.portfolio_featured !== undefined) {
        isFeatured = portfolio.portfolio_featured;
      }
      if (portfolio.tags) {
        // Merge portfolio tags with topic-derived tags (deduplicated)
        for (const tag of portfolio.tags) {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        }
      }
    }

    // Resolve relative asset paths to absolute URLs for external repos
    // Only use URLs explicitly set in PORTFOLIO.md — GitHub homepage/README URLs
    // may point to a different project's deployment (e.g. a marketing site)
    const deployUrl = portfolio?.live_url || portfolio?.demo_url || null;
    const resolve = (path: string | undefined | null) => resolveAssetUrl(path, repo.name, deployUrl);

    const project: Project = {
      id: repo.id,
      name: repo.name,
      title: portfolio?.title ?? prettifyRepoName(repo.name),
      description,
      summary,
      url: repo.html_url,
      demoUrl,
      liveUrl: portfolio?.live_url ?? null,
      homepage: repo.homepage ?? null,
      topics: repo.topics ?? [],
      categories,
      tags,
      stack,
      status,
      language: repo.language ?? null,
      languages,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      lastPushed: repo.pushed_at ?? repo.updated_at ?? '',
      createdAt: repo.created_at ?? '',
      isFeatured,
      isArchived: repo.archived ?? false,
      isPrivate: repo.private,
      // Portfolio.md fields
      tagline: portfolio?.tagline ?? null,
      thumbnail: resolve(portfolio?.thumbnail),
      problem: portfolio?.problem ?? portfolio?.problem_solved ?? null,
      solution: portfolio?.solution ?? null,
      keyFeatures: portfolio?.key_features ?? portfolio?.key_outcomes ?? [],
      metrics: portfolio?.metrics ?? [],
      priority: portfolio?.portfolio_priority ?? 99,
      dateCompleted: portfolio?.date_completed ?? null,
      slides: (portfolio?.slides ?? portfolio?.hero_images ?? []).map(img => {
        if (typeof img === 'string') {
          return { src: resolve(img)!, altEn: portfolio?.title ?? repo.name, altEs: portfolio?.title ?? repo.name };
        }
        return {
          src: resolve(img.src)!,
          ...(img.src_es ? { srcEs: resolve(img.src_es)! } : {}),
          altEn: img.alt_en,
          altEs: img.alt_es
        };
      }),
      videoUrl: resolve(portfolio?.video_url ?? portfolio?.demo_video_url),
      videoPoster: resolve(portfolio?.video_poster ?? portfolio?.demo_video_poster)
    };

    projects.push(project);
    console.warn(`  ✅ ${project.title} (${categories.join(', ') || 'uncategorized'}) [priority: ${project.priority}]`);
  }

  // Apply curated display order from portfolio-order.json
  const orderPath = join(__dirname, '../src/data/portfolio-order.json');
  if (existsSync(orderPath)) {
    const orderConfig = JSON.parse(readFileSync(orderPath, 'utf-8'));
    const orderMap = new Map<string, { priority: number; featured: boolean; categories?: string[] }>();
    for (const entry of orderConfig.order) {
      orderMap.set(entry.name, entry);
    }
    for (const project of projects) {
      const override = orderMap.get(project.name);
      if (override) {
        project.priority = override.priority;
        project.isFeatured = override.featured;
        if (override.categories) {
          project.categories = override.categories;
        }
      }
    }
    console.warn(`\n📋 Applied portfolio-order.json overrides (${orderConfig.order.length} entries)`);
  }

  // ── Post-sync data quality checks on portfolio-listed projects ──
  const portfolioProjects = projects.filter(p => p.priority < 99);
  for (const p of portfolioProjects) {
    if (!p.tagline) {
      syncIssues.push({ level: 'warning', repo: p.name, message: 'Missing tagline' });
    }
    if (!p.thumbnail) {
      syncIssues.push({ level: 'warning', repo: p.name, message: 'Missing thumbnail' });
    }
    if (p.stack.length === 0) {
      syncIssues.push({ level: 'warning', repo: p.name, message: 'Empty tech stack' });
    }
    if (!p.problem) {
      syncIssues.push({ level: 'warning', repo: p.name, message: 'Missing problem/challenge description' });
    }
    if (p.slides.length === 0) {
      syncIssues.push({ level: 'warning', repo: p.name, message: 'No portfolio slides/screenshots' });
    }
  }

  // Sort: priority ascending (lower = higher), then featured first, then lastPushed descending
  const sorted = projects.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime();
  });

  const output = {
    generatedAt: new Date().toISOString(),
    count: sorted.length,
    projects: sorted
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.warn(`\n✨ Generated ${sorted.length} projects → ${outputPath}`);
  console.warn(`   Featured: ${sorted.filter(p => p.isFeatured).length}`);
  console.warn(`   With PORTFOLIO.md: ${sorted.filter(p => p.tagline !== null).length}`);
  console.warn(`   Skipped (portfolio_enabled: false): ${skippedByPortfolio}`);
  console.warn(`   Categories: ${new Set(sorted.flatMap(p => p.categories)).size}`);

  // ── Report sync issues via GitHub Issue ──
  if (syncIssues.length > 0) {
    await reportSyncIssues(syncIssues);
  } else {
    console.warn(`\n✅ No sync issues detected`);
    // Close any stale open issue from a previous run
    await closeResolvedIssue();
  }
}

const SYNC_LABEL = 'portfolio-sync';

async function closeResolvedIssue(): Promise<void> {
  try {
    let { data: openIssues } = await octokit.issues.listForRepo({
      owner: GITHUB_OWNER,
      repo: SELF_REPO,
      labels: SYNC_LABEL,
      state: 'open',
      per_page: 1,
    });
    if (openIssues.length === 0) {
      const { data: titleSearch } = await octokit.issues.listForRepo({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        state: 'open',
        per_page: 10,
      });
      openIssues = titleSearch.filter(i => i.title.startsWith('Portfolio Sync:'));
    }
    if (openIssues.length > 0) {
      const issue = openIssues[0];
      await octokit.issues.createComment({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        issue_number: issue.number,
        body: `✅ **All issues resolved** — sync completed cleanly on ${new Date().toISOString().split('T')[0]}.\n\nAuto-closing.`,
      });
      await octokit.issues.update({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        issue_number: issue.number,
        state: 'closed',
      });
      console.warn(`\n🎉 Closed resolved sync issue #${issue.number}`);
    }
  } catch {
    // Non-critical — don't fail the build over issue management
  }
}

async function reportSyncIssues(issues: SyncIssue[]): Promise<void> {
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');

  console.warn(`\n⚠️  Sync completed with ${errors.length} error(s) and ${warnings.length} warning(s)`);

  // Group issues by repo for the report
  const byRepo = new Map<string, SyncIssue[]>();
  for (const issue of issues) {
    const list = byRepo.get(issue.repo) || [];
    list.push(issue);
    byRepo.set(issue.repo, list);
  }

  // Build the issue body
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [
    `The portfolio sync script detected **${errors.length} error(s)** and **${warnings.length} warning(s)** on ${date}.`,
    '',
  ];

  if (errors.length > 0) {
    lines.push('## Errors');
    lines.push('');
    for (const [repo, repoIssues] of byRepo) {
      const repoErrors = repoIssues.filter(i => i.level === 'error');
      if (repoErrors.length > 0) {
        lines.push(`### \`${repo}\``);
        for (const e of repoErrors) {
          lines.push(`- ❌ ${e.message}`);
        }
        lines.push('');
      }
    }
  }

  if (warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const [repo, repoIssues] of byRepo) {
      const repoWarnings = repoIssues.filter(i => i.level === 'warning');
      if (repoWarnings.length > 0) {
        lines.push(`### \`${repo}\``);
        for (const w of repoWarnings) {
          lines.push(`- ⚠️ ${w.message}`);
        }
        lines.push('');
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('**How to fix:**');
  lines.push('- **403 errors**: Update the fine-grained PAT (`PROJECT_SYNC_TOKEN`) to include the repo in its scope');
  lines.push('- **Missing thumbnail/slides**: Add media assets to the repo\'s `PORTFOLIO.md`');
  lines.push('- **Missing tagline/problem/stack**: Fill in the field in the repo\'s `PORTFOLIO.md` frontmatter');
  lines.push('');
  lines.push('*This issue was auto-generated by `scripts/generate-projects.ts`*');

  const body = lines.join('\n');
  const title = `Portfolio Sync: ${errors.length} error(s), ${warnings.length} warning(s) — ${date}`;

  try {
    // Check for existing open issue to avoid duplicates
    // Try label-based search first, fall back to title-based search
    let { data: openIssues } = await octokit.issues.listForRepo({
      owner: GITHUB_OWNER,
      repo: SELF_REPO,
      labels: SYNC_LABEL,
      state: 'open',
      per_page: 1,
    });
    if (openIssues.length === 0) {
      // Label may not have applied (token permissions) — search by title prefix
      const { data: titleSearch } = await octokit.issues.listForRepo({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        state: 'open',
        per_page: 10,
      });
      openIssues = titleSearch.filter(i => i.title.startsWith('Portfolio Sync:'));
    }

    if (openIssues.length > 0) {
      // Update existing issue with a new comment
      const issue = openIssues[0];
      await octokit.issues.createComment({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        issue_number: issue.number,
        body: `## Updated Report — ${date}\n\n${body}`,
      });
      // Update the title to reflect latest counts
      await octokit.issues.update({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        issue_number: issue.number,
        title,
      });
      console.warn(`📬 Updated existing sync issue #${issue.number}`);
    } else {
      // Create new issue
      const { data: created } = await octokit.issues.create({
        owner: GITHUB_OWNER,
        repo: SELF_REPO,
        title,
        body,
        labels: [SYNC_LABEL],
      });
      console.warn(`📬 Created sync issue #${created.number}: ${created.html_url}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️  Could not create GitHub issue (non-fatal): ${msg}`);
  }
}

generateProjects().catch(error => {
  console.error('❌ Error generating projects:', error);
  process.exit(1);
});
