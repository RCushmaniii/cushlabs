/**
 * sync-all.ts — Syncs portfolio data for both cushlabs AND ai-portfolio repos.
 *
 * 1. Runs cushlabs generate-projects (GitHub → projects.generated.json)
 * 2. Runs ai-portfolio sync-portfolio (GitHub → portfolio.json)
 * 3. Auto-commits and pushes both repos if data changed
 *
 * Usage: npm run sync:all
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';

const CUSHLABS_DIR = resolve(import.meta.dirname!, '..');
const AI_PORTFOLIO_DIR = resolve(CUSHLABS_DIR, '../ai-portfolio');

function run(cmd: string, cwd: string, label: string): boolean {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔄 ${label}`);
  console.log(`${'='.repeat(60)}\n`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } });
    return true;
  } catch {
    console.error(`\n❌ Failed: ${label}`);
    return false;
  }
}

function hasChanges(cwd: string, paths: string[]): boolean {
  try {
    const status = execSync(`git status --porcelain -- ${paths.join(' ')}`, {
      cwd,
      encoding: 'utf-8',
    }).trim();
    return status.length > 0;
  } catch {
    return false;
  }
}

function commitAndPush(cwd: string, files: string[], message: string): boolean {
  try {
    execSync(`git add ${files.join(' ')}`, { cwd, stdio: 'inherit' });
    execSync(
      `git commit -m "${message}"`,
      { cwd, stdio: 'inherit' }
    );
    execSync('git push', { cwd, stdio: 'inherit' });
    console.log(`✅ Committed and pushed: ${message}`);
    return true;
  } catch {
    console.error(`❌ Failed to commit/push in ${cwd}`);
    return false;
  }
}

async function main() {
  console.log('🚀 CushLabs Portfolio Sync — All Repos\n');

  // Verify ai-portfolio repo exists
  if (!existsSync(AI_PORTFOLIO_DIR)) {
    console.error(`❌ ai-portfolio repo not found at: ${AI_PORTFOLIO_DIR}`);
    console.error('   Expected: ../ai-portfolio relative to cushlabs repo');
    process.exit(1);
  }

  let cushlabsOk = false;
  let aiPortfolioOk = false;

  // ── Step 1: Sync cushlabs ──
  cushlabsOk = run(
    'npx tsx scripts/generate-projects.ts',
    CUSHLABS_DIR,
    'CushLabs — generate-projects'
  );

  if (cushlabsOk && hasChanges(CUSHLABS_DIR, ['src/data/projects.generated.json'])) {
    commitAndPush(
      CUSHLABS_DIR,
      ['src/data/projects.generated.json'],
      'chore: refresh projects data [skip ci]'
    );
  } else if (cushlabsOk) {
    console.log('ℹ️  CushLabs: no changes to commit');
  }

  // ── Step 2: Sync ai-portfolio ──
  aiPortfolioOk = run(
    'pnpm sync',
    AI_PORTFOLIO_DIR,
    'AI Portfolio — sync-portfolio'
  );

  if (aiPortfolioOk && hasChanges(AI_PORTFOLIO_DIR, ['content/portfolio.json'])) {
    commitAndPush(
      AI_PORTFOLIO_DIR,
      ['content/portfolio.json'],
      'chore: refresh portfolio data [skip ci]'
    );
  } else if (aiPortfolioOk) {
    console.log('ℹ️  AI Portfolio: no changes to commit');
  }

  // ── Summary ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 Sync Summary');
  console.log(`${'='.repeat(60)}`);
  console.log(`  CushLabs:     ${cushlabsOk ? '✅' : '❌'}`);
  console.log(`  AI Portfolio:  ${aiPortfolioOk ? '✅' : '❌'}`);
  console.log();

  if (!cushlabsOk || !aiPortfolioOk) {
    process.exit(1);
  }
}

main();
