import { spawn } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type AuditLevel = "OK" | "WARN" | "FAIL";

const cwd = process.cwd();
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

function color(level: AuditLevel, text: string) {
  if (!process.stdout.isTTY) return text;
  const reset = "\x1b[0m";
  const map: Record<AuditLevel, string> = {
    OK: "\x1b[32m",
    WARN: "\x1b[33m",
    FAIL: "\x1b[31m",
  };
  return `${map[level]}${text}${reset}`;
}

function log(level: AuditLevel, title: string, details?: string) {
  const tag = color(level, `[${level}]`);
  process.stdout.write(`${tag} ${title}${details ? `\n${details}` : ""}\n`);
}

function run(command: string, args: string[], title: string) {
  return new Promise<void>((resolve, reject) => {
    log("OK", title);
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", (err) => reject(err));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${title} failed (exit ${code})`));
    });
  });
}

async function safeRunGitStatus(): Promise<string | null> {
  return new Promise((resolve) => {
    const child = spawn("git", ["status", "--porcelain"], {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let out = "";
    child.stdout.on("data", (d) => {
      out += String(d);
    });
    child.on("error", () => resolve(null));
    child.on("exit", (code) => {
      if (code !== 0) resolve(null);
      resolve(out.trim());
    });
  });
}

function getEnv(name: string) {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

async function walkFiles(root: string, ignores: Set<string>): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    const rel = path.relative(cwd, fullPath);

    if (ignores.has(entry.name)) continue;
    if (rel.split(path.sep).some((seg) => ignores.has(seg))) continue;

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, ignores)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function isTextFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return [
    ".ts",
    ".tsx",
    ".js",
    ".mjs",
    ".cjs",
    ".astro",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".txt",
    ".env",
    ".xml",
    ".html",
    ".css",
  ].includes(ext);
}

function isEnvFile(filePath: string) {
  const base = path.basename(filePath);
  return base === ".env" || base.startsWith(".env.") || base.endsWith(".env");
}

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (!obj || typeof obj !== "object") return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") {
      out.push(...keyPaths(v, next));
    } else {
      out.push(next);
    }
  }
  return out;
}

async function checkEnv() {
  const required: string[] = ["GITHUB_TOKEN", "GITHUB_OWNER"];
  const missing = required.filter((k) => !getEnv(k));

  if (missing.length) {
    log(
      "FAIL",
      "Missing required environment variables",
      missing.map((k) => `- ${k}`).join("\n")
    );
    return false;
  }

  const consult = getEnv("PUBLIC_CONSULTATION_URL");
  const consult30 = getEnv("PUBLIC_CONSULTATION_URL_30");
  const consult60 = getEnv("PUBLIC_CONSULTATION_URL_60");

  if (!consult && !consult30 && !consult60) {
    log(
      "WARN",
      "No consultation booking URL is set",
      "Set PUBLIC_CONSULTATION_URL (or PUBLIC_CONSULTATION_URL_30/_60) so the scheduling flow can embed the booking calendar."
    );
  } else {
    log("OK", "Consultation booking URL is set");
  }

  const waPublic = getEnv("PUBLIC_WHATSAPP_NUMBER");
  const waPrivate = getEnv("WHATSAPP_NUMBER");
  if (!waPublic && waPrivate) {
    log(
      "WARN",
      "PUBLIC_WHATSAPP_NUMBER is not set",
      "The site will fall back to WHATSAPP_NUMBER, but Astro expects PUBLIC_ vars for client-safe usage."
    );
  } else if (!waPublic && !waPrivate) {
    log("WARN", "No WhatsApp number configured");
  } else {
    log("OK", "WhatsApp number is configured");
  }

  return true;
}

async function checkI18nParity() {
  const enMod = await import(
    pathToFileURL(path.join(cwd, "src/i18n/translations/en.ts")).href
  );
  const esMod = await import(
    pathToFileURL(path.join(cwd, "src/i18n/translations/es.ts")).href
  );

  const enKeys = new Set(keyPaths(enMod.en));
  const esKeys = new Set(keyPaths(esMod.es));

  const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
  const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));

  if (!missingInEs.length && !missingInEn.length) {
    log("OK", "i18n dictionaries are in sync (en/es)");
    return true;
  }

  const lines: string[] = [];
  if (missingInEs.length) {
    lines.push("Missing in es:");
    lines.push(...missingInEs.map((k) => `- ${k}`));
  }
  if (missingInEn.length) {
    lines.push("Missing in en:");
    lines.push(...missingInEn.map((k) => `- ${k}`));
  }

  log("FAIL", "i18n dictionaries are out of sync", lines.join("\n"));
  return false;
}

async function checkSecretLeaks() {
  const ignores = new Set([
    ".git",
    "node_modules",
    "dist",
    ".astro",
    "backup",
  ]);

  const files = (await walkFiles(cwd, ignores)).filter(isTextFile);

  const patterns: { name: string; re: RegExp }[] = [
    { name: "GitHub classic token", re: /\bghp_[A-Za-z0-9]{20,}\b/ },
    { name: "GitHub fine-grained token", re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
    { name: "OpenAI-style key", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  ];

  const violations: { file: string; pattern: string }[] = [];
  const envFindings: { file: string; pattern: string }[] = [];

  for (const file of files) {
    const base = path.basename(file);
    if (base === "package-lock.json") continue;

    let content: string;
    try {
      content = await readFile(file, "utf8");
    } catch {
      continue;
    }

    for (const ptn of patterns) {
      if (!ptn.re.test(content)) continue;
      if (isEnvFile(file)) envFindings.push({ file, pattern: ptn.name });
      else violations.push({ file, pattern: ptn.name });
    }
  }

  if (violations.length) {
    const details = violations
      .map((v) => `- ${path.relative(cwd, v.file)} (${v.pattern})`)
      .join("\n");
    log("FAIL", "Potential secret leak detected in tracked source files", details);
    return false;
  }

  if (envFindings.length) {
    const details = envFindings
      .map((v) => `- ${path.relative(cwd, v.file)} (${v.pattern})`)
      .join("\n");
    log(
      "WARN",
      "Secrets detected in env files",
      `${details}\nEnsure .env files remain gitignored and never committed.`
    );
  } else {
    log("OK", "No obvious secret patterns found");
  }

  return true;
}

async function checkRepoHygiene() {
  const status = await safeRunGitStatus();
  if (status === null) {
    log("WARN", "Git status unavailable");
    return true;
  }
  if (!status) {
    log("OK", "Working tree clean");
    return true;
  }
  log("WARN", "Working tree has uncommitted changes", status);
  return true;
}

async function checkStaticArtifacts() {
  const dist = path.join(cwd, "dist");
  try {
    const s = await stat(dist);
    if (!s.isDirectory()) {
      log("FAIL", "dist exists but is not a directory");
      return false;
    }
  } catch {
    log("FAIL", "dist/ not found (build may have failed)");
    return false;
  }

  const expected = [
    "index.html",
    "portfolio/index.html",
    "consultation/index.html",
    "contact/index.html",
    "about/index.html",
    "es/index.html",
    "es/portfolio/index.html",
    "es/reservar/index.html",
    "es/contact/index.html",
    "es/about/index.html",
    "projects/react-vite-tailwind-base/index.html",
    "es/projects/react-vite-tailwind-base/index.html",
  ];

  const missing: string[] = [];
  for (const rel of expected) {
    try {
      const p = path.join(dist, rel);
      const s = await stat(p);
      if (!s.isFile()) missing.push(rel);
    } catch {
      missing.push(rel);
    }
  }

  if (missing.length) {
    log(
      "WARN",
      "Some expected static outputs were not found in dist/",
      missing.map((m) => `- ${m}`).join("\n")
    );
  } else {
    log("OK", "Expected dist/ pages exist");
  }

  const rootRobots = path.join(cwd, "robots.txt");
  const publicRobots = path.join(cwd, "public/robots.txt");

  const hasRootRobots = await exists(rootRobots);
  const hasPublicRobots = await exists(publicRobots);

  if (hasRootRobots && hasPublicRobots) {
    log(
      "WARN",
      "robots.txt exists in both repo root and public/",
      "Astro will publish the public/ version. Consider removing the root copy to avoid confusion."
    );
  }

  return true;
}

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

// ─── SEO Audit (runs against built dist/) ──────────────────────

const SEO_LIMITS = {
  titleMax: 60,
  descMax: 160,
  titleMin: 20,
  descMin: 50,
};

async function collectHtmlFiles(dir: string): Promise<string[]> {
  const htmlFiles: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      htmlFiles.push(...(await collectHtmlFiles(full)));
    } else if (entry.name.endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
  return htmlFiles;
}

function extractTag(html: string, tag: string): string | null {
  // <title>...</title>
  if (tag === "title") {
    const m = html.match(/<title[^>]*>(.*?)<\/title>/is);
    return m ? m[1].trim() : null;
  }
  // <meta name="description" content="...">
  if (tag === "description") {
    const m = html.match(/<meta\s[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*\/?>/is)
           || html.match(/<meta\s[^>]*content=["'](.*?)["'][^>]*name=["']description["'][^>]*\/?>/is);
    return m ? m[1].trim() : null;
  }
  return null;
}

function extractInternalHrefs(html: string): string[] {
  const staticExts = /\.(css|js|mjs|ico|png|jpg|jpeg|webp|avif|svg|gif|woff2?|ttf|eot|xml|json|txt|webmanifest|pdf)$/i;
  const matches = [...html.matchAll(/href=["'](\/[^"'#]*?)["']/g)];
  return matches.map(m => m[1]).filter(h => !h.startsWith("//") && !h.startsWith("/_astro/") && !staticExts.test(h));
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i);
  return m ? m[1] : null;
}

function extractHreflang(html: string): string[] {
  const matches = [...html.matchAll(/<link\s[^>]*rel=["']alternate["'][^>]*href=["'](.*?)["']/gi)];
  return matches.map(m => m[1]);
}

async function checkSeoOnBuild() {
  const dist = path.join(cwd, "dist");
  let htmlFiles: string[];
  try {
    htmlFiles = await collectHtmlFiles(dist);
  } catch {
    log("WARN", "Cannot run SEO audit — dist/ not found");
    return true;
  }

  if (!htmlFiles.length) {
    log("WARN", "No HTML files found in dist/");
    return true;
  }

  const titleIssues: string[] = [];
  const descIssues: string[] = [];
  const trailingSlashIssues: string[] = [];
  const orphanCandidates = new Set<string>();
  const linkedPaths = new Set<string>();
  const allPages = new Set<string>();

  for (const file of htmlFiles) {
    const rel = path.relative(dist, file).replace(/\\/g, "/").replace(/index\.html$/, "");
    const pagePath = `/${rel}`;
    allPages.add(pagePath);

    let html: string;
    try {
      html = await readFile(file, "utf8");
    } catch {
      continue;
    }

    // ── Title length check ──
    const title = extractTag(html, "title");
    if (title) {
      if (title.length > SEO_LIMITS.titleMax) {
        titleIssues.push(`- ${pagePath} → ${title.length} chars: "${title.slice(0, 70)}..."`);
      } else if (title.length < SEO_LIMITS.titleMin) {
        titleIssues.push(`- ${pagePath} → ${title.length} chars (too short): "${title}"`);
      }
    }

    // ── Description length check (skip 404) ──
    const desc = extractTag(html, "description");
    if (desc && !pagePath.includes("404")) {
      if (desc.length > SEO_LIMITS.descMax) {
        descIssues.push(`- ${pagePath} → ${desc.length} chars: "${desc.slice(0, 80)}..."`);
      } else if (desc.length < SEO_LIMITS.descMin) {
        descIssues.push(`- ${pagePath} → ${desc.length} chars (too short)`);
      }
    }

    // ── Internal links trailing slash check ──
    const hrefs = extractInternalHrefs(html);
    for (const href of hrefs) {
      if (href !== "/" && !href.endsWith("/")) {
        trailingSlashIssues.push(`- ${pagePath} → href="${href}" (missing trailing slash)`);
      }
      // Track linked paths for orphan detection
      const normalized = href.endsWith("/") ? href : `${href}/`;
      linkedPaths.add(normalized);
    }

    // ── Canonical vs hreflang consistency ──
    const canonical = extractCanonical(html);
    const hreflangs = extractHreflang(html);
    if (canonical && hreflangs.length) {
      const canonicalPath = new URL(canonical).pathname;
      for (const hl of hreflangs) {
        try {
          const hlPath = new URL(hl).pathname;
          if (hlPath !== "/" && !hlPath.endsWith("/")) {
            trailingSlashIssues.push(`- ${pagePath} → hreflang "${hlPath}" missing trailing slash`);
          }
        } catch { /* skip malformed URLs */ }
      }
    }
  }

  // ── Orphan page detection (pages with no incoming internal links) ──
  for (const page of allPages) {
    if (page === "/" || page === "/es/" || page === "/404/" || page === "/404.html") continue;
    if (!linkedPaths.has(page)) {
      orphanCandidates.add(page);
    }
  }

  let ok = true;

  // Report results
  if (titleIssues.length) {
    log("FAIL", `Title length issues (${titleIssues.length} pages, limit: ${SEO_LIMITS.titleMax} chars)`, titleIssues.join("\n"));
    ok = false;
  } else {
    log("OK", `All page titles within ${SEO_LIMITS.titleMin}-${SEO_LIMITS.titleMax} chars`);
  }

  if (descIssues.length) {
    log("FAIL", `Meta description length issues (${descIssues.length} pages, limit: ${SEO_LIMITS.descMax} chars)`, descIssues.join("\n"));
    ok = false;
  } else {
    log("OK", `All meta descriptions within ${SEO_LIMITS.descMin}-${SEO_LIMITS.descMax} chars`);
  }

  if (trailingSlashIssues.length) {
    const dedupedIssues = [...new Set(trailingSlashIssues)].slice(0, 20);
    log("FAIL", `Trailing slash issues (${trailingSlashIssues.length} links)`, dedupedIssues.join("\n") + (trailingSlashIssues.length > 20 ? `\n  ... and ${trailingSlashIssues.length - 20} more` : ""));
    ok = false;
  } else {
    log("OK", "All internal links have trailing slashes");
  }

  if (orphanCandidates.size > 0) {
    const orphanList = [...orphanCandidates].slice(0, 15);
    log("WARN", `${orphanCandidates.size} pages with no incoming internal links`, orphanList.map(p => `- ${p}`).join("\n") + (orphanCandidates.size > 15 ? `\n  ... and ${orphanCandidates.size - 15} more` : ""));
  } else {
    log("OK", "All pages have incoming internal links");
  }

  return ok;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  process.stdout.write(`Pre-deploy audit (Astro)\n`);
  process.stdout.write(`Node ${process.version}\n\n`);

  let ok = true;

  ok = (await checkRepoHygiene()) && ok;
  ok = (await checkEnv()) && ok;
  ok = (await checkSecretLeaks()) && ok;
  ok = (await checkI18nParity()) && ok;

  try {
    await run(npmCmd, ["run", "astro", "--", "check"], "Typecheck (astro check)");
  } catch (e) {
    log("FAIL", "astro check failed", String(e));
    ok = false;
  }

  try {
    await run(npmCmd, ["run", "build"], "Build (npm run build)");
  } catch (e) {
    log("FAIL", "Build failed", String(e));
    ok = false;
  }

  ok = (await checkStaticArtifacts()) && ok;

  // SEO checks run on built output
  process.stdout.write("\n--- SEO Audit ---\n\n");
  ok = (await checkSeoOnBuild()) && ok;

  if (!ok) {
    process.stdout.write("\nAudit result: FAILED\n");
    process.exit(1);
  }

  process.stdout.write("\nAudit result: OK\n");
}

main().catch((err) => {
  log("FAIL", "Audit crashed", String(err));
  process.exit(1);
});
