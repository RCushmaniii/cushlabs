import { describe, it, expect, vi } from "vitest";
// Plain JS Worker module with no types alongside it; resolves as implicit `any`.
import { checkRateLimit, clientKey } from "../workers/lib/rate-limit-d1.js";

describe("clientKey — the unit a limit applies to", () => {
  it("uses an IPv4 address whole", () => {
    expect(clientKey("203.0.113.7")).toBe("203.0.113.7");
  });

  it("collapses IPv6 to its /64, so a rotating address cannot escape the bucket", () => {
    // Two temporary addresses from one subscriber's /64. Hosts rotate these on
    // their own schedule under RFC 4941; keying on the full address gives each
    // one a fresh bucket, which is how 1,500 requests from a single machine got
    // through unrefused on a sibling Worker.
    const a = "2806:103e:19:6dcb:f480:934c:9264:166a";
    const b = "2806:103e:19:6dcb:aaaa:bbbb:cccc:dddd";
    expect(clientKey(a)).toBe("2806:103e:19:6dcb::/64");
    expect(clientKey(a)).toBe(clientKey(b));
  });

  it("keeps different /64s apart", () => {
    expect(clientKey("2806:103e:19:6dcb::1")).not.toBe(
      clientKey("2001:db8:1:2:3:4:5:6"),
    );
  });

  it("handles a missing address rather than keying on undefined", () => {
    expect(clientKey(undefined)).toBe("unknown");
    expect(clientKey("")).toBe("unknown");
  });

  it("passes compressed forms through rather than mangling them", () => {
    expect(clientKey("::1")).toBe("::1");
  });
});

/**
 * Minimal D1 stand-in backed by an array. Enough to exercise the sliding
 * window: COUNT/MIN over a bucket, INSERT, and DELETE.
 */
function fakeDb() {
  const rows: { bucket: string; ts: number }[] = [];
  return {
    rows,
    batch: async () => [],
    prepare(sql: string) {
      const state: unknown[] = [];
      const api = {
        bind(...args: unknown[]) {
          state.push(...args);
          return api;
        },
        async first() {
          const [bucket, windowStart] = state as [string, number];
          const inWindow = rows.filter(
            (r) => r.bucket === bucket && r.ts > windowStart,
          );
          return {
            n: inWindow.length,
            oldest: inWindow.length
              ? Math.min(...inWindow.map((r) => r.ts))
              : null,
          };
        },
        async run() {
          if (sql.includes("INSERT INTO rate_limit")) {
            const [bucket, ts] = state as [string, number];
            rows.push({ bucket, ts });
          }
          return { success: true };
        },
      };
      return api;
    },
  };
}

describe("checkRateLimit — shared sliding window", () => {
  it("allows up to the limit and refuses the one after it", async () => {
    const db = fakeDb();
    for (let i = 0; i < 5; i++) {
      const r = await checkRateLimit(db, "book:1.2.3.4", 5, 3_600_000);
      expect(r.allowed).toBe(true);
    }
    const sixth = await checkRateLimit(db, "book:1.2.3.4", 5, 3_600_000);
    expect(sixth.allowed).toBe(false);
    expect(sixth.resetIn).toBeGreaterThan(0);
  });

  it("counts each bucket separately, so one client cannot exhaust another", async () => {
    const db = fakeDb();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(db, "book:1.2.3.4", 5, 3_600_000);
    }
    const other = await checkRateLimit(db, "book:5.6.7.8", 5, 3_600_000);
    expect(other.allowed).toBe(true);
  });

  it("keeps surfaces apart, so browsing dates cannot use up the booking budget", async () => {
    const db = fakeDb();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(db, "slots:1.2.3.4", 5, 3_600_000);
    }
    const booking = await checkRateLimit(db, "book:1.2.3.4", 5, 3_600_000);
    expect(booking.allowed).toBe(true);
  });

  it("does not record a request it refused", async () => {
    const db = fakeDb();
    for (let i = 0; i < 6; i++) {
      await checkRateLimit(db, "book:1.2.3.4", 5, 3_600_000);
    }
    // Six calls, five allowed — the refused one must not have been written, or
    // a blocked flood would grow the table without bound.
    expect(db.rows.length).toBe(5);
  });

  it("fails OPEN and flags degraded when the binding is missing", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await checkRateLimit(null, "book:1.2.3.4", 5, 3_600_000);
    expect(r.allowed).toBe(true);
    expect(r.degraded).toBe(true);
    // Failing open is a deliberate trade on this Worker, but it must never be
    // silent — that is how a limiter stops working without anyone noticing.
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it("fails OPEN and flags degraded when the datastore throws", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken = {
      batch: async () => {
        throw new Error("D1 unreachable");
      },
      prepare: () => {
        throw new Error("D1 unreachable");
      },
    };
    const r = await checkRateLimit(broken, "book:1.2.3.4", 5, 3_600_000);
    expect(r.allowed).toBe(true);
    expect(r.degraded).toBe(true);
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});
