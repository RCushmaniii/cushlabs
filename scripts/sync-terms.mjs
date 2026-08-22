/**
 * Copy the commercial terms from operating-system into this repo.
 *
 * operating-system is a separate repo, so the site cannot import across the boundary at
 * build time — the same constraint that makes projects.generated.json a committed file
 * rather than a live fetch. This mirrors that pattern: sync locally, commit the result,
 * and let Vercel build from what is in the tree.
 *
 * Usage:  npm run sync:terms          copy and report what changed
 *         npm run sync:terms -- --check   exit 1 if the local copy is stale (for CI)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SOURCE =
  "C:/Users/Robert Cushman/Projects/operating-system/cushlabs/commercial-terms.json";
const DEST = "src/data/commercialTerms.json";
const checkOnly = process.argv.includes("--check");

if (!existsSync(SOURCE)) {
  // Vercel and CI do not have the operating-system repo checked out. The committed copy
  // is the build input there, so a missing source is expected, not an error.
  console.log(
    "sync-terms: operating-system not present — using the committed copy (expected on CI/Vercel).",
  );
  process.exit(0);
}

const source = readFileSync(SOURCE, "utf8");
const current = existsSync(DEST) ? readFileSync(DEST, "utf8") : "";

// Parse both so a malformed source fails here rather than at render time.
let parsed;
try {
  parsed = JSON.parse(source);
} catch (err) {
  console.error("sync-terms: source is not valid JSON —", err.message);
  process.exit(1);
}

if (source === current) {
  console.log(
    `sync-terms: up to date (source last_updated ${parsed._meta?.last_updated})`,
  );
  process.exit(0);
}

if (checkOnly) {
  console.error(
    `sync-terms: ${DEST} is STALE. Run \`npm run sync:terms\` and commit the result.`,
  );
  process.exit(1);
}

writeFileSync(DEST, source, "utf8");
console.log(
  `sync-terms: updated ${DEST} (source last_updated ${parsed._meta?.last_updated})`,
);
