/**
 * The scanner's output contract, as a test.
 *
 * Robert's constraint, verbatim: exposing a credential "would be one of the worst things
 * that you could do to me." A scanner that prints what it finds IS a disclosure tool —
 * its report lands in CI logs, terminal scrollback, and pasted messages.
 *
 * So the guarantee is asserted rather than assumed: plant known credentials, run the
 * scanner, and require that it (a) finds them and (b) reproduces no part of them.
 * "No part" is checked hard — the whole value, and every substring of 6+ characters,
 * which is what makes prefix/suffix/mask leakage impossible to sneak back in.
 *
 * WHY THE CANARIES ARE GENERATED AND NOT WRITTEN DOWN
 * This file originally hard-coded them:
 *
 *   const PLANTED = { mysqlPassword: "<a quoted literal>", apiKey: "<another>" };
 *
 * which is precisely the shape the scanner hunts for — a credential-ish name assigned a
 * quoted, high-entropy literal in a code file. So the scanner flagged its own test file,
 * 2 HIGH, exit 1, and the `Secret scan` CI step failed on every push from 2026-08-26
 * until this was fixed. A security gate whose own fixtures trip it gets switched off,
 * which would have left the repo with no gate at all.
 *
 * Generating them at run time fixes it at the root: no line in any tracked file carries a
 * credential shape, so there is nothing to exempt and no exemption for a real secret to
 * later hide behind. It is also a stronger test — a fixed literal can be quietly tuned
 * until it passes, while a fresh random value each run cannot.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { randomInt } from "node:crypto";

const FIXTURE = "docs/__secret-scan-fixture.md";
const SELF = "tests/audit-secrets.test.ts";

/**
 * Character pools, one per class the scanner's `measure()` recognises. Visually
 * ambiguous characters are left out only to keep failure output readable.
 *
 * None of these pools contain a character the detectors treat as a value terminator
 * (quote, backtick, whitespace, comma, semicolon, angle bracket, brace) or a URI
 * delimiter (`:`, `@`, `/`), so a generated canary survives both the `KEY=value` and
 * the `scheme://user:pass@host` fixture lines intact.
 */
const POOLS = [
  "abcdefghijkmnopqrstuvwxyz",
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "23456789",
  "!#$%&*+-=?^_",
];

/**
 * A fabricated credential that is deterministically HIGH severity.
 *
 * `severityOf()` calls something HIGH when it mixes >= 3 character classes and carries
 * >= 2.5 bits of entropy per character. Taking at least one character from every pool
 * and never repeating a character guarantees both — 4 classes, and entropy of exactly
 * log2(length) bits per char (3.8 at length 14). Without the distinctness rule a lucky
 * draw could land under the threshold and this test would flake.
 */
function canary(length: number): string {
  const picked: string[] = [];
  const used = new Set<string>();

  const take = (pool: string): boolean => {
    const ch = pool[randomInt(pool.length)];
    if (used.has(ch)) return false;
    used.add(ch);
    picked.push(ch);
    return true;
  };

  for (const pool of POOLS) {
    let drawn = false;
    while (!drawn) drawn = take(pool);
  }
  while (picked.length < length) take(POOLS[randomInt(POOLS.length)]);

  // Fisher-Yates, so the guaranteed one-per-pool prefix is not positional.
  for (let i = picked.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked.join("");
}

const planted = {
  mysqlPassword: canary(14),
  uriPassword: canary(14),
  apiKey: canary(20),
};

const run = () => {
  try {
    return execFileSync("node", ["scripts/audit-secrets.mjs"], {
      encoding: "utf8",
    });
  } catch (err: any) {
    // Exit 1 is the expected outcome when findings exist.
    return `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }
};

describe("audit-secrets output contract", () => {
  let output = "";

  beforeAll(() => {
    if (!existsSync("docs")) mkdirSync("docs", { recursive: true });
    writeFileSync(
      FIXTURE,
      [
        "# fixture",
        "",
        `MYSQL_PASSWORD=${planted.mysqlPassword}`,
        `DATABASE_URL=postgres://admin:${planted.uriPassword}@db.example.io:5432/app`,
        `api_key = "${planted.apiKey}"`,
        "",
      ].join("\n"),
      "utf8",
    );
    output = run();
  });

  afterAll(() => {
    if (existsSync(FIXTURE)) unlinkSync(FIXTURE);
  });

  it("finds planted credentials", () => {
    expect(output).toContain(FIXTURE);
    expect(output).toMatch(/MYSQL_PASSWORD/);
    expect(output).toMatch(/HIGH/);
  });

  it("finds all three planted shapes, not just the easy one", () => {
    // One per detector: bare KEY=value, an inline-password URI, a quoted literal.
    // Losing any one of these silently is how the original leak stayed hidden.
    expect(output).toMatch(/db-credential-assignment/);
    expect(output).toMatch(/connection-uri-with-inline-password/);
    expect(output).toMatch(/generic-credential-assignment/);
  });

  it("never prints a planted value in full", () => {
    for (const [name, value] of Object.entries(planted)) {
      expect(output, `leaked ${name}`).not.toContain(value);
    }
  });

  it("never prints any 6+ character fragment of a planted value", () => {
    // Catches prefixes, suffixes, partial masks, and "first N chars" helpfulness.
    for (const [name, value] of Object.entries(planted)) {
      for (let i = 0; i + 6 <= value.length; i++) {
        const fragment = value.slice(i, i + 6);
        expect(
          output,
          `leaked fragment of ${name} at offset ${i}`,
        ).not.toContain(fragment);
      }
    }
  });

  it("reports location and shape instead of content", () => {
    expect(output).toMatch(/value\s*:\s*\d+ chars/);
    expect(output).toMatch(/entropy/);
    expect(output).toMatch(/Values are never printed/);
  });

  it("does not flag its own test file", () => {
    // The regression that made CI red for two weeks. If a future edit reintroduces a
    // hard-coded canary here, the scanner reports this file and the `Secret scan` step
    // fails on every push — so assert it directly instead of discovering it in CI.
    expect(output).not.toContain(SELF);
  });
});
