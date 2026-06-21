#!/usr/bin/env node
/**
 * List every portfolio project and its URLs from the committed
 * projects.generated.json — no GitHub API calls needed.
 *
 *   node scripts/list-portfolio.mjs           # grouped table to stdout
 *   node scripts/list-portfolio.mjs --json     # machine-readable JSON
 *   node scripts/list-portfolio.mjs --csv      # write portfolio-urls.csv
 *
 * "Posted"  = shown on /portfolio  (priority < 99)
 * "Hidden"  = synced into the data but not surfaced (priority >= 99)
 * Repos with `portfolio_enabled: false` in their PORTFOLIO.md are dropped
 * before this file is generated, so they never appear here — see the
 * companion grep in the chat for those.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  readFileSync(join(__dirname, "../src/data/projects.generated.json"), "utf-8"),
);

const SITE = "https://www.cushlabs.ai";

const rows = data.projects.map((p) => ({
  name: p.name,
  title: p.title,
  priority: p.priority,
  posted: p.priority < 99,
  featured: p.isFeatured,
  status: p.status || "",
  portfolioUrl: `${SITE}/projects/${p.name}/`,
  github: p.url || "",
  demoUrl: p.demoUrl || "",
  liveUrl: p.liveUrl || "",
  homepage: p.homepage || "",
}));

const posted = rows
  .filter((r) => r.posted)
  .sort((a, b) => a.priority - b.priority);
const hidden = rows
  .filter((r) => !r.posted)
  .sort((a, b) => a.name.localeCompare(b.name));

const flag = process.argv[2];

if (flag === "--json") {
  console.log(JSON.stringify({ posted, hidden }, null, 2));
} else if (flag === "--csv") {
  const cols = [
    "name",
    "title",
    "priority",
    "posted",
    "featured",
    "status",
    "portfolioUrl",
    "github",
    "demoUrl",
    "liveUrl",
    "homepage",
  ];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const r of [...posted, ...hidden])
    lines.push(cols.map((c) => esc(r[c])).join(","));
  const out = join(__dirname, "../portfolio-urls.csv");
  writeFileSync(out, lines.join("\n"));
  console.log(`Wrote ${posted.length + hidden.length} rows → ${out}`);
} else {
  const show = (label, list) => {
    console.log(`\n=== ${label} (${list.length}) ===`);
    for (const r of list) {
      const url = r.demoUrl || r.liveUrl || r.homepage || "(no live url)";
      console.log(
        `  [p${String(r.priority).padStart(2)}]${r.featured ? " ★" : "  "} ${r.name.padEnd(34)} ${url}`,
      );
      console.log(`        page:   ${r.portfolioUrl}`);
      console.log(`        github: ${r.github}`);
    }
  };
  console.log(`Generated: ${data.generatedAt}   total synced: ${data.count}`);
  show("POSTED (live on /portfolio)", posted);
  show("HIDDEN (synced but priority >= 99)", hidden);
  console.log(`\nTip: --csv writes a spreadsheet, --json for piping to jq.`);
}
