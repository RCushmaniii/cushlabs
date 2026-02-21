import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { writeFileSync, existsSync } from 'fs';
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
  solution?: string;
  key_features?: string[];
  metrics?: string[];
  demo_url?: string;
  live_url?: string;
  slides?: { src: string; src_es?: string; alt_en: string; alt_es: string }[];
  video_url?: string;
  video_poster?: string;
  tags?: string[];
  date_completed?: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? 'RCushmaniii';
const SELF_REPO = 'cushlabs'; // Assets in this repo are local — keep relative paths

/**
 * Resolve a relative asset path to an absolute URL.
 * - Paths in the cushlabs repo itself stay relative (served from public/)
 * - Other repos: use their deployment URL (Vercel CDN) if available
 * - Fallback: raw.githubusercontent.com
 */
function resolveAssetUrl(path: string | undefined | null, repoName: string, deployUrl: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/')) return path; // already absolute URL
  if (repoName === SELF_REPO) return path; // local asset

  if (deployUrl) {
    const base = deployUrl.replace(/\/+$/, '');
    return `${base}${path}`;
  }
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repoName}/main/public${path}`;
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

async function fetchPortfolioMd(owner: string, repo: string): Promise<PortfolioFrontmatter | null> {
  // Try PORTFOLIO.md first, then portfolio.md
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
    } catch {
      // File not found, try next filename
    }
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

  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username: GITHUB_OWNER,
    type: 'owner',
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
    const deployUrl = portfolio?.live_url || portfolio?.demo_url || demoUrl;
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
      problem: portfolio?.problem ?? null,
      solution: portfolio?.solution ?? null,
      keyFeatures: portfolio?.key_features ?? [],
      metrics: portfolio?.metrics ?? [],
      priority: portfolio?.portfolio_priority ?? 99,
      dateCompleted: portfolio?.date_completed ?? null,
      slides: (portfolio?.slides ?? []).map(img => ({
        src: resolve(img.src)!,
        ...(img.src_es ? { srcEs: resolve(img.src_es)! } : {}),
        altEn: img.alt_en,
        altEs: img.alt_es
      })),
      videoUrl: resolve(portfolio?.video_url),
      videoPoster: resolve(portfolio?.video_poster)
    };

    projects.push(project);
    console.warn(`  ✅ ${project.title} (${categories.join(', ') || 'uncategorized'}) [priority: ${project.priority}]`);
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
}

generateProjects().catch(error => {
  console.error('❌ Error generating projects:', error);
  process.exit(1);
});
