import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for existing projects file
const outputPath = join(__dirname, '../src/data/projects.generated.json');

interface Project {
  id: number;
  name: string;
  title: string;
  description: string;
  summary: string;
  url: string;
  demoUrl: string | null;
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
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? 'RCushmaniii';

if (!GITHUB_TOKEN) {
  if (existsSync(outputPath)) {
    console.warn('⚠️  GITHUB_TOKEN not set, using existing projects.generated.json');
    process.exit(0);
  }
  console.error('❌ GITHUB_TOKEN environment variable is required (no existing projects file found)');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

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

  for (const repo of repos) {
    console.warn(`\n📝 Processing: ${repo.name}`);

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

    const isFeatured = repo.topics?.includes('featured') ?? false;

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

    const project: Project = {
      id: repo.id,
      name: repo.name,
      title: prettifyRepoName(repo.name),
      description,
      summary,
      url: repo.html_url,
      demoUrl,
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
      isPrivate: repo.private
    };

    projects.push(project);
    console.warn(`  ✅ ${project.title} (${categories.join(', ') || 'uncategorized'})`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    count: projects.length,
    projects: projects.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.lastPushed).getTime() - new Date(a.lastPushed).getTime();
    })
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.warn(`\n✨ Generated ${projects.length} projects → ${outputPath}`);
  console.warn(`   Featured: ${projects.filter(p => p.isFeatured).length}`);
  console.warn(`   Categories: ${new Set(projects.flatMap(p => p.categories)).size}`);
}

generateProjects().catch(error => {
  console.error('❌ Error generating projects:', error);
  process.exit(1);
});
