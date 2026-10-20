import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { gzipSync } from "zlib";
import { join } from "path";

// Page-weight tripwire. Every page inlines the whole stylesheet
// (astro.config.mjs -> build.inlineStylesheets: "always", a deliberate
// first-paint trade made 2026-10-12), so any growth in the CSS is paid on
// every page view. Live pages were 166-299 KB raw / 38-43 KB gzip on
// 2026-10-20 with a 116 KB inline <style>; these budgets catch a regression
// in CI before it reaches production. Raise a budget only with a reason.

const DIST = join(__dirname, "..", "dist");

const RAW_BUDGET = 350 * 1024;
const GZIP_BUDGET = 60 * 1024;
const INLINE_CSS_BUDGET = 130 * 1024;

function pages(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) pages(full, acc);
    else if (entry === "index.html") acc.push(full);
  }
  return acc;
}

// Gzipping 140 pages took 15 s on a cold disk the first time it ran, past
// vitest's 5 s default, so the budget tests get their own ceiling.
describe("Page weight budgets", { timeout: 60_000 }, () => {
  const all = pages(DIST);

  it("finds the built pages", () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it(`no page exceeds ${RAW_BUDGET / 1024} KB raw or ${GZIP_BUDGET / 1024} KB gzipped`, () => {
    const over: string[] = [];
    for (const file of all) {
      const html = readFileSync(file);
      const gz = gzipSync(html).length;
      if (html.length > RAW_BUDGET || gz > GZIP_BUDGET) {
        over.push(
          `${file.replace(DIST, "")}: ${Math.round(html.length / 1024)} KB raw, ${Math.round(gz / 1024)} KB gzip`,
        );
      }
    }
    expect(over, over.join("\n")).toEqual([]);
  });

  it(`inline CSS stays under ${INLINE_CSS_BUDGET / 1024} KB per page`, () => {
    const over: string[] = [];
    for (const file of all) {
      const html = readFileSync(file, "utf-8");
      let inline = 0;
      for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
        inline += m[1].length;
      if (inline > INLINE_CSS_BUDGET) {
        over.push(
          `${file.replace(DIST, "")}: ${Math.round(inline / 1024)} KB inline CSS`,
        );
      }
    }
    expect(over, over.join("\n")).toEqual([]);
  });
});
