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
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FIXTURE = "docs/__secret-scan-fixture.md";

// Fabricated for this test. Never real credentials.
const PLANTED = {
  mysqlPassword: "Zq7$Kv2!mNp9Xw",
  uriPassword: "Hunter2Hunter2",
  apiKey: "sk-live-4f8Ba91Qz7RtYu3WxE0",
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
        `MYSQL_PASSWORD=${PLANTED.mysqlPassword}`,
        `DATABASE_URL=postgres://admin:${PLANTED.uriPassword}@db.example.io:5432/app`,
        `api_key = "${PLANTED.apiKey}"`,
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
    expect(output).toContain(FIXTURE.replace(/^/, ""));
    expect(output).toMatch(/MYSQL_PASSWORD/);
    expect(output).toMatch(/HIGH/);
  });

  it("never prints a planted value in full", () => {
    for (const [name, value] of Object.entries(PLANTED)) {
      expect(output, `leaked ${name}`).not.toContain(value);
    }
  });

  it("never prints any 6+ character fragment of a planted value", () => {
    // Catches prefixes, suffixes, partial masks, and "first N chars" helpfulness.
    for (const [name, value] of Object.entries(PLANTED)) {
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
});
