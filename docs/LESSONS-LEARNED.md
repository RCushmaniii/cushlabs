# Lessons Learned

A running log of bugs, near-misses, and decisions worth remembering. The goal is permanent: each entry should make a class of failure impossible to repeat.

---

## 2026-04-07 — Silent YAML corruption broke 19 portfolio cards

### Symptom
Portfolio grid on `cushlabs.ai/portfolio` showed the default `CUSHLABS.AI` placeholder for 19 of 32 visible projects. Cards looked broken. Robert noticed during a visual review and was (correctly) furious — the portfolio is one of the most important client-credibility surfaces on the site.

### Root cause
`scripts/generate-projects.ts` reads each sibling repo's `PORTFOLIO.md` via gray-matter to populate `src/data/projects.generated.json`. **21 of those PORTFOLIO.md files had two top-level `health_status:` blocks** — added by separate audit/standardizer passes that appended a new block instead of replacing the existing one.

YAML rejects duplicate keys. gray-matter threw a `YAMLException: duplicated mapping key`. The previous version of `tryLocalPortfolioMd()` had:

```ts
} catch {
  // Parse error, skip
}
```

The catch swallowed the throw, the function returned `null`, and the project was written to JSON with `thumbnail: null`. **No log. No warning. No CI failure.** The corruption was invisible until someone looked at the rendered grid.

### How it lingered
- The duplicate-key bug was added gradually as different audit passes ran on different repos.
- Each `npm run build` regenerates `projects.generated.json`. Hero-copy PRs that day used `git add -A`, sweeping the regenerated (corrupted) JSON into commits unrelated to the portfolio. This made it look like the day's work had broken something.
- A `git diff` against `projects.generated.json` from before the day's PRs proved the affected projects had `thumbnail: null` in *both* versions. The PRs hadn't broken anything — but they had hidden the real problem behind noise.

### Permanent fixes
1. **`scripts/validate-portfolio-md.ts` (new).** Scans every sibling repo's `PORTFOLIO.md`, detects duplicate top-level YAML keys, and validates with gray-matter. Fails loudly on any error. `--fix` flag auto-removes the second duplicate block. Wired into `npm run generate-projects` via `package.json` so it runs before every regen.
2. **Hardened `tryLocalPortfolioMd()`** in `scripts/generate-projects.ts`. The silent catch is gone. Parse errors now log loudly with the repo + file + exception message, push to `syncIssues`, and re-throw. The build fails fast instead of silently shipping broken JSON.
3. **Documentation in three places** so the lesson persists across sessions:
   - Global `~/CLAUDE.md` — "Data Pipeline Scripts — Never Silent-Catch" rule
   - Repo `cushlabs/CLAUDE.md` — "Recurring Failure: Silent YAML Corruption" runbook with fix steps
   - Memory file `feedback_portfolio_md_yaml_silent_corruption.md` — context for future Claude sessions
4. **Repo audit scripts must REPLACE, not APPEND.** Any future skill or script that updates `health_status:` (or any other top-level block) in PORTFOLIO.md must check for an existing block and overwrite it in place. Appending creates duplicate-key time bombs.

### Process lessons
- **Never `catch { /* skip */ }` in data-pipeline scripts.** Silent catches are how broken state gets shipped to production. If parsing user-managed config can fail, it must log loudly and fail the build. Convenience now = debugging hell later.
- **Don't `git add -A` on PRs that didn't intentionally touch generated files.** Stage changed files explicitly. Generated/derived data riding along on unrelated commits makes diffs noisy and hides real problems.
- **When the user reports broken state, diff the suspected file against a known-good commit before assuming you broke it.** A 60-second `git show <sha>:path | diff` saves an hour of panic.
- **Robert's portfolio is load-bearing infrastructure for his business.** Treat it like production. Validate aggressively, fail loudly, document permanently.

### Verification
After fix:
- `npm run validate:portfolio-md` reports 0 errors, 1 warning (one repo legitimately lacks a thumbnail field).
- All 19 affected projects now have correct `thumbnail` values in `projects.generated.json`.
- Portfolio grid renders real images for every card.

### Files touched
- `scripts/validate-portfolio-md.ts` — new
- `scripts/generate-projects.ts` — hardened catch block
- `package.json` — wired validator into `generate-projects` script
- 21 sibling-repo `PORTFOLIO.md` files — second `health_status:` block removed
