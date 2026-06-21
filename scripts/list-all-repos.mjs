#!/usr/bin/env node
/**
 * List EVERY GitHub repo and its URLs — the full inventory, not just the
 * portfolio subset. Pulls all repos live via `gh repo list`, then merges in
 * portfolio data (page URL + demo/live) for the ones that are published.
 *
 *   node scripts/list-all-repos.mjs           # grouped table
 *   node scripts/list-all-repos.mjs --csv      # writes all-repos-urls.csv
 *   node scripts/list-all-repos.mjs --json     # machine-readable
 *
 * Status per repo:
 *   posted     = live on /portfolio (priority < 99)
 *   hidden     = synced into portfolio data but not surfaced (priority >= 99)
 *   not-listed = not in the portfolio (no PORTFOLIO.md, or portfolio_enabled:false)
 *
 * Requires the `gh` CLI authenticated.
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OWNER = "RCushmaniii";
const SITE = "https://www.cushlabs.ai";

const repos = JSON.parse(
  execSync(
    `gh repo list ${OWNER} --limit 400 --json name,url,homepageUrl,isArchived,visibility`,
    { encoding: "utf-8" },
  ),
);

const gen = JSON.parse(
  readFileSync(join(__dirname, "../src/data/projects.generated.json"), "utf-8"),
);
const byName = new Map(gen.projects.map((p) => [p.name, p]));

const STATUS_RANK = { posted: 0, hidden: 1, "not-listed": 2 };

const rows = repos
  .map((r) => {
    const p = byName.get(r.name);
    const status = !p ? "not-listed" : p.priority < 99 ? "posted" : "hidden";
    const liveUrl = (p && (p.demoUrl || p.liveUrl)) || r.homepageUrl || "";
    return {
      name: r.name,
      status,
      archived: r.isArchived,
      visibility: r.visibility,
      github: r.url,
      liveUrl,
      homepage: r.homepageUrl || "",
      portfolioPage: p ? `${SITE}/projects/${r.name}/` : "",
    };
  })
  .sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.name.localeCompare(b.name),
  );

const flag = process.argv[2];

if (flag === "--json") {
  console.log(JSON.stringify({ total: rows.length, repos: rows }, null, 2));
} else if (flag === "--csv") {
  const cols = [
    "name",
    "status",
    "archived",
    "visibility",
    "github",
    "liveUrl",
    "homepage",
    "portfolioPage",
  ];
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  const out = join(__dirname, "../all-repos-urls.csv");
  writeFileSync(out, lines.join("\n"));
  console.log(`Wrote ${rows.length} repos → ${out}`);
} else {
  const groups = { posted: [], hidden: [], "not-listed": [] };
  for (const r of rows) groups[r.status].push(r);
  const label = {
    posted: "POSTED (live on /portfolio)",
    hidden: "HIDDEN (synced, not surfaced)",
    "not-listed": "NOT LISTED (no portfolio entry)",
  };
  console.log(`Total repos: ${rows.length}\n`);
  for (const key of ["posted", "hidden", "not-listed"]) {
    const list = groups[key];
    console.log(`=== ${label[key]} (${list.length}) ===`);
    for (const r of list) {
      const live = r.liveUrl || "(no live url)";
      const arch = r.archived ? " [archived]" : "";
      console.log(`  ${r.name.padEnd(34)}${arch}  ${live}`);
      console.log(`      github: ${r.github}`);
      if (r.portfolioPage) console.log(`      page:   ${r.portfolioPage}`);
    }
    console.log("");
  }
}
