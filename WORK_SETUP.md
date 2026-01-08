# Work Portfolio Setup

This document explains how the automated GitHub portfolio system works.

## Overview

The `/work` page automatically generates a portfolio from your GitHub repositories using:

- **GitHub Topics** as metadata (categories, tags, stack, status)
- **GitHub Actions** for automated weekly updates
- **Static JSON** for fast client-side rendering

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up GitHub Token

Create a `.env` file in the root:

```bash
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=cushdog
```

**Getting a GitHub Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `public_repo` scope
3. Copy the token to your `.env` file

### 3. Generate Projects Locally

```bash
npm run generate-projects
```

This creates `src/data/projects.generated.json` with all your repos.

### 4. View the Portfolio

Open `work.html` in your browser or deploy to see your projects.

## GitHub Topics Convention

Add topics to your repos to control how they appear:

### Categories

- `cat-ai` → AI/ML projects
- `cat-web` → Web applications
- `cat-automation` → Automation tools
- `cat-devtools` → Developer tools

### Stack

- `stack-astro` → Built with Astro
- `stack-nextjs` → Built with Next.js
- `stack-react` → Built with React
- `stack-supabase` → Uses Supabase
- `stack-python` → Python projects

### Status

- `status-shipped` → Production/live
- `status-wip` → Work in progress
- `status-archived` → No longer maintained

### Featured

- `featured` → Highlight on portfolio (shows first)

### Custom Tags

Any topic without a prefix becomes a regular tag.

## How It Works

### 1. Generator Script (`scripts/generate-projects.ts`)

Fetches all your repos via GitHub API and:

- Reads repo metadata (name, description, stars, etc.)
- Extracts demo URLs from:
  - `homepage` field
  - README links (demo, live, production)
  - GitHub Pages (if enabled)
- Parses topics into categories/tags/stack/status
- Generates summaries from README first paragraph
- Outputs to `src/data/projects.generated.json`

### 2. GitHub Actions (`.github/workflows/refresh-projects.yml`)

Runs automatically:

- **Weekly** on Sundays at 2 AM UTC
- **On demand** via workflow_dispatch
- **On push** when generator script changes

The workflow:

1. Checks out repo
2. Installs dependencies
3. Runs generator with `GITHUB_TOKEN`
4. Commits changes if `projects.generated.json` updated
5. Triggers Vercel/Netlify rebuild automatically

### 3. Client-Side Rendering (`work.js`)

- Fetches `projects.generated.json`
- Builds dynamic filters from categories/stack
- Renders project cards with hover effects
- Handles filtering and sorting

## Project Data Structure

Each project in `projects.generated.json`:

```json
{
  "id": 123456,
  "name": "repo-name",
  "title": "Repo Name",
  "description": "Short description",
  "summary": "Longer summary from README",
  "url": "https://github.com/cushdog/repo-name",
  "demoUrl": "https://demo.example.com",
  "homepage": "https://example.com",
  "topics": ["featured", "cat-web", "stack-nextjs"],
  "categories": ["web"],
  "tags": [],
  "stack": ["nextjs"],
  "status": "shipped",
  "language": "TypeScript",
  "languages": { "TypeScript": 95000, "CSS": 5000 },
  "stars": 42,
  "forks": 5,
  "lastPushed": "2025-01-15T10:30:00Z",
  "createdAt": "2024-06-01T08:00:00Z",
  "isFeatured": true,
  "isArchived": false,
  "isPrivate": false
}
```

## Customization

### Manual Overrides

To add custom data for specific projects, create `src/data/projects.overrides.json`:

```json
{
  "repo-name": {
    "title": "Custom Title",
    "summary": "Custom summary that's better than auto-generated",
    "demoUrl": "https://custom-demo.com",
    "featured": true
  }
}
```

Then modify the generator script to merge overrides.

### Featured Projects

Add the `featured` topic to repos you want highlighted. Featured projects:

- Show first in the list
- Have orange border accent
- Display "Featured" badge

### Case Studies (Future)

For deeper project showcases, create MDX files in `src/content/case-studies/`:

```mdx
---
title: "Project Name"
repo: "repo-name"
demo: "https://demo.com"
stack: ["Next.js", "Supabase", "TailwindCSS"]
---

# Deep dive into the project...
```

## Deployment

### Vercel/Netlify

The site auto-deploys when:

1. GitHub Actions commits updated `projects.generated.json`
2. Git push triggers platform rebuild
3. New portfolio is live in ~1 minute

### Environment Variables

Set in your hosting platform:

- Not needed for static site (JSON is committed)
- Only needed if you want on-demand regeneration

## Maintenance

### Weekly Updates

GitHub Actions handles this automatically. Check the Actions tab to verify runs.

### Manual Refresh

```bash
npm run generate-projects
git add src/data/projects.generated.json
git commit -m "chore: refresh projects"
git push
```

### Debugging

- Check GitHub Actions logs for errors
- Verify `GITHUB_TOKEN` has correct permissions
- Ensure topics follow naming convention
- Test locally before pushing

## SEO Benefits

By keeping `/work` on the same domain:

- ✅ Single domain authority
- ✅ Internal linking benefits
- ✅ Cohesive brand story
- ✅ No hosting complexity
- ✅ Shared analytics/tracking

## Next Steps

1. **Add topics to your repos** following the convention
2. **Mark 3-6 repos as featured** with the `featured` topic
3. **Run the generator** to see your portfolio
4. **Create manual overrides** for featured projects (optional)
5. **Write case studies** for key projects (optional)

---

**Questions?** Check the generator script comments or GitHub Actions logs for details.
