/**
 * Credential scanner — reports WHERE, never WHAT.
 *
 * WHY THIS EXISTS
 * On 2026-08-22 GitGuardian found a live MySQL password in
 * docs/features/DATABASE_MIGRATION.md. It had been in this PUBLIC repo since the v1.0.0
 * redesign, copied in with a batch of nyenglishteacher.com documentation. The host still
 * resolved and port 3306 was still open nine months later.
 *
 * It survived because every check anyone ran was the wrong shape. The docs audit asked
 * "is this doc stale?" The deletion pass asked "does anything link to it?" Nobody asked
 * "what is inside it?" — and the file never named the project it belonged to, so it read
 * as generic infrastructure documentation.
 *
 * THE OUTPUT CONTRACT — the reason this file is written the way it is
 * A scanner that prints what it finds is a credential-disclosure tool. Its report goes
 * into CI logs, terminal scrollback, and pasted messages. So the value is never carried
 * into any string that can be printed:
 *
 *   - matched values are converted to {length, charset} at the match site and discarded
 *   - no prefixes, suffixes, masks, hashes, or first-N-characters — all of those leak
 *     usable information and a hash of a low-entropy secret is crackable
 *   - findings carry the variable NAME (which is a label, not a credential) and a
 *     location, so a human can go look with their own eyes
 *
 * Read that as a hard rule: if you extend this file, never add the value to a finding.
 *
 * Usage
 *   npm run audit:secrets              working tree
 *   npm run audit:secrets -- --history every blob ever committed (slow; finds the buried ones)
 *   npm run audit:secrets -- --json    machine-readable, same redaction contract
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
const SCAN_HISTORY = args.includes("--history");
const AS_JSON = args.includes("--json");

/* ---------------------------------------------------------------- detectors */

/**
 * Each detector names a credential shape. `capture` is the group holding the value —
 * used only to measure it.
 */
const DETECTORS = [
  {
    id: "db-credential-assignment",
    // MYSQL_PASSWORD=..., DB_USER=..., DATABASE_URL=...
    re: /\b((?:mysql|mariadb|postgres|pg|mongo|redis|db|database|sql)[_a-z0-9]*(?:pass(?:word)?|pwd|user(?:name)?|host|dsn|url|uri|conn[a-z]*))\s*[:=]\s*["'`]?([^"'`\s,;<>{}]{4,})/i,
    capture: 2,
    name: 1,
  },
  {
    id: "generic-credential-assignment",
    re: /\b((?:api[_-]?key|secret|token|passwd|password|pwd|private[_-]?key|access[_-]?key|auth[_-]?token|client[_-]?secret)[_a-z0-9]*)\s*[:=]\s*["'`]?([^"'`\s,;<>{}]{8,})/i,
    capture: 2,
    name: 1,
  },
  {
    id: "connection-uri-with-inline-password",
    // scheme://user:pass@host
    re: /\b([a-z][a-z0-9+.-]*):\/\/[^\s:@/]+:([^\s:@/]{4,})@[^\s/]+/i,
    capture: 2,
    name: 1,
  },
  {
    id: "private-key-block",
    re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
    capture: 0,
    name: null,
  },
];

/**
 * A captured "value" that is really CODE, not a credential.
 *
 * The first run of this scanner reported 6 HIGH findings and 3 were code:
 *   const secret = tokenFor(company);        -> captured "tokenFor(company);"
 *   accessKeyId: R2_ACCESS_KEY_ID,           -> captured "R2_ACCESS_KEY_ID,"
 *   secretAccessKey: R2_SECRET_ACCESS_KEY,   -> captured the variable name
 *
 * A 50% false-positive rate is how a security gate gets ignored, which is worse than not
 * having one. So in CODE files a credential must be a QUOTED literal to count — a bare
 * identifier, a member expression, or a call is a reference to a secret, not a secret.
 * Data files (.md, .env, .yml, .txt) still match unquoted, because KEY=value is the
 * normal shape there — and that is exactly where the MySQL password was hiding.
 */
const CODE_FILE =
  /\.(ts|tsx|js|jsx|mjs|cjs|astro|vue|svelte|py|rb|go|php|java|cs)$/i;
const LOOKS_LIKE_CODE =
  /^(?:[A-Za-z_$][\w$]*\s*\(|[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*[,;)\]}]?$|await\s|new\s|process\.env|import\.meta)/;

/** Values that are obviously not real. */
const PLACEHOLDER =
  /^(?:your[-_ ]?\w*|my[-_ ]?\w*|the[-_ ]?\w*|example|placeholder|changeme|change[-_ ]?me|redacted|dummy|sample|test|foo|bar|baz|none|null|undefined|true|false|xxx+|yyy+|zzz+|abc123|123456\d*|password|secret|token|value|\*+|\.{2,}|-+|<[^>]*>|\{\{?[^}]*\}?\}|\$\{[^}]*\}|\$[A-Z_]+|process\.env\.[A-Z_]+|import\.meta\.env\.[A-Z_]+)$/i;

/** Files whose whole purpose is to show the SHAPE of a credential. */
const EXEMPT_FILE =
  /\.(example|sample|template|dist)$|\.env\.example$|(^|\/)(README|CHANGELOG)\.md$/i;

const SKIP_DIR =
  /(^|\/)(node_modules|dist|\.git|\.astro|\.vercel|coverage|build)(\/|$)/;
const SCANNABLE =
  /\.(md|mdx|txt|ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|astro|vue|svelte|html|php|py|rb|go|sh|ps1|sql|toml|ini|conf|env|vars)$/i;

/* ------------------------------------------------------------ measurement */

/** Convert a value to metadata, then let it go. Nothing else ever sees it. */
function measure(value) {
  const classes = [];
  if (/[a-z]/.test(value)) classes.push("lower");
  if (/[A-Z]/.test(value)) classes.push("upper");
  if (/[0-9]/.test(value)) classes.push("digit");
  if (/[^A-Za-z0-9]/.test(value)) classes.push("symbol");

  // Shannon entropy per character — separates "localhost" from "K7#vQ2pLm!x9".
  const freq = new Map();
  for (const ch of value) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let entropy = 0;
  for (const n of freq.values()) {
    const p = n / value.length;
    entropy -= p * Math.log2(p);
  }

  return {
    length: value.length,
    charset: classes.join("+") || "none",
    entropyPerChar: Number(entropy.toFixed(2)),
    looksPlaceholder: PLACEHOLDER.test(value),
  };
}

/** High = act now. Low = probably a placeholder or an example. */
function severityOf(meta, detectorId) {
  if (detectorId === "private-key-block") return "HIGH";
  if (meta.looksPlaceholder) return "LOW";
  if (meta.length < 8) return "LOW";
  const mixed = meta.charset.split("+").length >= 3;
  if (mixed && meta.entropyPerChar >= 2.5) return "HIGH";
  if (meta.entropyPerChar >= 3.2) return "HIGH";
  return "MEDIUM";
}

/* ----------------------------------------------------------------- scanning */

function scanText(text, where) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 2000) continue; // minified bundles, lockfile blobs
    for (const d of DETECTORS) {
      const m = line.match(d.re);
      if (!m) continue;
      const value = d.capture === 0 ? m[0] : m[d.capture];
      if (!value) continue;

      // In code, only a quoted literal is a credential. `KEY: SOME_VAR` and
      // `const s = getSecret()` are references — see the note on LOOKS_LIKE_CODE.
      if (d.id !== "private-key-block" && CODE_FILE.test(where.file)) {
        const quoted = new RegExp(
          `[:=]\\s*["'\`]${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        ).test(line);
        if (!quoted || LOOKS_LIKE_CODE.test(value)) continue;
      }

      // In DATA files a dotted string is a hostname, not a member expression — applying
      // the code heuristic here silently dropped MYSQL_HOST and MYSQL_USER from the very
      // finding this scanner exists to catch. Only env-var references are excluded.
      if (/^(?:process\.env|import\.meta\.env)\b/.test(value)) continue;

      const meta = measure(value);
      out.push({
        ...where,
        line: i + 1,
        detector: d.id,
        name: d.name ? m[d.name] : "(private key block)",
        severity: severityOf(meta, d.id),
        length: meta.length,
        charset: meta.charset,
        entropyPerChar: meta.entropyPerChar,
        looksPlaceholder: meta.looksPlaceholder,
      });
      // `value` and `m` go out of scope here. Nothing downstream holds them.
    }
  }
  return out;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    const rel = path.relative(".", p).replace(/\\/g, "/");
    if (SKIP_DIR.test(rel)) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (SCANNABLE.test(entry)) out.push(rel);
  }
  return out;
}

const findings = [];

if (SCAN_HISTORY) {
  const blobs = execSync("git rev-list --objects --all", {
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  })
    .split("\n")
    .map((l) => {
      const i = l.indexOf(" ");
      return i === -1 ? null : { sha: l.slice(0, i), file: l.slice(i + 1) };
    })
    .filter((o) => o && SCANNABLE.test(o.file) && !SKIP_DIR.test(o.file));

  const seen = new Set();
  process.stderr.write(`scanning ${blobs.length} historical blobs…\n`);
  for (const b of blobs) {
    if (seen.has(b.sha) || EXEMPT_FILE.test(b.file)) continue;
    seen.add(b.sha);
    let content;
    try {
      content = execSync(`git cat-file -p ${b.sha}`, {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      continue;
    }
    findings.push(
      ...scanText(content, { file: b.file, blob: b.sha.slice(0, 8) }),
    );
  }
} else {
  for (const file of walk(".")) {
    if (EXEMPT_FILE.test(file)) continue;
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    findings.push(...scanText(content, { file }));
  }
}

/* ------------------------------------------------------------------ report */

// Collapse duplicates: the same credential in 40 historical blobs is one problem.
const unique = new Map();
for (const f of findings) {
  const key = `${f.file}|${f.name}|${f.length}|${f.charset}|${f.detector}`;
  if (!unique.has(key)) unique.set(key, { ...f, occurrences: 1 });
  else unique.get(key).occurrences += 1;
}
const list = [...unique.values()].sort(
  (a, b) =>
    ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[a.severity] -
    { HIGH: 0, MEDIUM: 1, LOW: 2 }[b.severity],
);

const high = list.filter((f) => f.severity === "HIGH");
const medium = list.filter((f) => f.severity === "MEDIUM");

if (AS_JSON) {
  console.log(
    JSON.stringify(
      { scope: SCAN_HISTORY ? "history" : "working-tree", findings: list },
      null,
      2,
    ),
  );
} else {
  console.log(
    `\naudit-secrets: scanned ${SCAN_HISTORY ? "ALL GIT HISTORY" : "the working tree"} — ` +
      `${high.length} high, ${medium.length} medium, ${list.length - high.length - medium.length} low\n`,
  );
  console.log("Values are never printed. Go look at the location yourself.\n");

  for (const group of [
    ["HIGH — treat as live until proven otherwise", high],
    ["MEDIUM — check, likely fine", medium],
  ]) {
    if (!group[1].length) continue;
    console.log(`── ${group[0]} ──`);
    for (const f of group[1]) {
      console.log(`  ${f.file}:${f.line}${f.blob ? `  (blob ${f.blob})` : ""}`);
      console.log(`     variable : ${f.name}`);
      console.log(`     detector : ${f.detector}`);
      console.log(
        `     value    : ${f.length} chars, ${f.charset}, entropy ${f.entropyPerChar}/char` +
          (f.occurrences > 1 ? `, seen in ${f.occurrences} places` : ""),
      );
      console.log("");
    }
  }

  if (!high.length && !medium.length)
    console.log("✅ Nothing above LOW severity.\n");
  else
    console.log(
      "A HIGH finding in git history is NOT fixed by deleting the file — the blob stays\n" +
        "reachable. Rotate or destroy the credential first; scrubbing history is secondary.\n",
    );
}

process.exit(high.length > 0 ? 1 : 0);
