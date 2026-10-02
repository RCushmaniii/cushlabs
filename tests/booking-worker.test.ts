/**
 * The booking Worker end to end, with Google Calendar, Google OAuth and
 * Turnstile replaced by an in-memory calendar. Nothing here touches the real
 * calendar. Added 2026-10-02 after a booking read as the wrong time and the
 * slot rules (notice, buffer, live re-check) changed — see
 * docs/BOOKING-CONFIRMATIONS.md "Time zones".
 *
 * Fixed clock: Friday 2 Oct 2026, 1:00 PM Mexico City (19:00 UTC).
 * Mexico City is UTC-6 all year; New York is UTC-4 until 1 Nov, then UTC-5.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fakeD1 } from "./helpers/fake-d1";

const NOW = new Date("2026-10-02T19:00:00Z");
const PERSONAL = "personal@test";
const WORK = "work@test";

type Busy = { start: string; end: string };
type Inserted = {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: { email: string }[];
};

/** A fake Google: freeBusy reads `busy`, event inserts append to it. */
function fakeGoogle() {
  const busy: Busy[] = [];
  const inserted: Inserted[] = [];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const reply = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

    if (url.startsWith("https://oauth2.googleapis.com/token")) {
      return reply({ access_token: "test-token", expires_in: 3600 });
    }
    if (url.startsWith("https://challenges.cloudflare.com/turnstile/v0/siteverify")) {
      return reply({ success: true });
    }
    if (url.startsWith("https://www.googleapis.com/calendar/v3/freeBusy")) {
      return reply({ calendars: { [PERSONAL]: { busy }, [WORK]: { busy: [] } } });
    }
    if (url.includes("/calendar/v3/calendars/") && url.includes("/events")) {
      const ev = JSON.parse(String(init?.body)) as Inserted;
      inserted.push(ev);
      // Google answers with the offset form; the slot grid is fixed UTC-6.
      const startsAt = `${ev.start.dateTime}-06:00`;
      busy.push({
        start: new Date(startsAt).toISOString(),
        end: new Date(`${ev.end.dateTime}-06:00`).toISOString(),
      });
      return reply({
        id: `evt-${inserted.length}`,
        hangoutLink: "https://meet.google.com/test-test-test",
        start: { dateTime: startsAt },
      });
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  });
  return { busy, inserted, fetchMock };
}

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    DB: fakeD1(),
    GOOGLE_CLIENT_ID: "id",
    GOOGLE_CLIENT_SECRET: "secret",
    GOOGLE_REFRESH_TOKEN: "refresh",
    GOOGLE_CALENDAR_ID: WORK,
    PERSONAL_CALENDAR_ID: PERSONAL,
    ALLOWED_ORIGINS: "https://www.cushlabs.ai",
    TURNSTILE_SECRET_KEY: "turnstile-secret",
    TIMEZONE: "America/Mexico_City",
    ...overrides,
  };
}

let google: ReturnType<typeof fakeGoogle>;
let worker: { fetch: (r: Request, env: unknown) => Promise<Response> };

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  google = fakeGoogle();
  vi.stubGlobal("fetch", google.fetchMock);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  // Fresh module per test: the Worker caches its OAuth token and slot lists
  // in module scope, and one test's cache must not answer for the next.
  vi.resetModules();
  // Plain JS Worker module with no types alongside it; resolves as implicit `any`.
  worker = (await import("../workers/booking-worker.js")).default;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function slots(env: unknown, date: string): Promise<string[]> {
  const res = await worker.fetch(
    new Request(`https://booking.test/slots/${date}?lang=en`, {
      headers: { Origin: "https://www.cushlabs.ai" },
    }),
    env,
  );
  const data = await res.json();
  expect(data.ok).toBe(true);
  return data.slots;
}

async function book(env: unknown, body: Record<string, unknown>) {
  const res = await worker.fetch(
    new Request("https://booking.test/book?lang=en", {
      method: "POST",
      headers: {
        Origin: "https://www.cushlabs.ai",
        "Content-Type": "application/json",
        "CF-Connecting-IP": "203.0.113.7",
      },
      body: JSON.stringify({
        name: "Test Person",
        email: "test@example.com",
        lang: "en",
        turnstileToken: "token",
        ...body,
      }),
    }),
    env,
  );
  return { status: res.status, data: await res.json() };
}

/** Mexico City wall time on a date, as a UTC ISO string. */
const mx = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00-06:00`).toISOString();

describe("slot rules", () => {
  it("needs 12 hours' notice: nothing left today at 1 PM", async () => {
    expect(await slots(makeEnv(), "2026-10-02")).toEqual([]);
  });

  it("is closed on Sunday", async () => {
    expect(await slots(makeEnv(), "2026-10-04")).toEqual([]);
  });

  it("offers the full weekday grid when the calendar is empty", async () => {
    const s = await slots(makeEnv(), "2026-10-05");
    expect(s[0]).toBe("09:00");
    expect(s).toContain("13:30");
    expect(s).toContain("16:00");
    expect(s.at(-1)).toBe("19:30");
    expect(s).not.toContain("14:00"); // lunch gap 14:00-16:00
  });

  it("keeps a 15-minute gap either side of anything already on the calendar", async () => {
    google.busy.push({ start: mx("2026-10-05", "11:00"), end: mx("2026-10-05", "11:30") });
    const s = await slots(makeEnv(), "2026-10-05");
    expect(s).toContain("10:00");
    expect(s).not.toContain("10:30"); // would end 11:00, inside the 10:45 buffer
    expect(s).not.toContain("11:00");
    expect(s).not.toContain("11:30"); // would start inside the 11:45 buffer
    expect(s).toContain("12:00");
  });

  it("lets BUFFER_MINUTES and MIN_NOTICE_HOURS be tuned without a code change", async () => {
    google.busy.push({ start: mx("2026-10-05", "11:00"), end: mx("2026-10-05", "11:30") });
    const s = await slots(makeEnv({ BUFFER_MINUTES: "0" }), "2026-10-05");
    expect(s).toContain("10:30");
    expect(s).toContain("11:30");
    const today = await slots(makeEnv({ MIN_NOTICE_HOURS: "2" }), "2026-10-02");
    expect(today).toContain("16:00");
  });
});

describe("booking", () => {
  it("creates the event on Mexico City time with every clock in the description", async () => {
    const env = makeEnv();
    const { status, data } = await book(env, {
      date: "2026-10-05",
      time: "10:00",
      timeZone: "America/Los_Angeles",
    });
    expect(status).toBe(200);
    expect(data.ok).toBe(true);

    const ev = google.inserted[0];
    expect(ev.start).toEqual({ dateTime: "2026-10-05T10:00:00", timeZone: "America/Mexico_City" });
    expect(ev.end).toEqual({ dateTime: "2026-10-05T10:30:00", timeZone: "America/Mexico_City" });
    expect(ev.attendees).toEqual([{ email: "test@example.com" }]);
    expect(ev.description).toContain(
      "When: 10:00 AM CDMX · 12:00 PM EDT · booker: 9:00 AM PDT (America/Los_Angeles)",
    );

    const row = await env.DB.prepare("SELECT booker_tz, starts_at FROM bookings").first();
    expect(row).toEqual({ booker_tz: "America/Los_Angeles", starts_at: mx("2026-10-05", "10:00") });
  });

  it("follows US daylight saving: Eastern is 1 hour ahead in December, not 2", async () => {
    await book(makeEnv(), { date: "2026-12-07", time: "10:00", timeZone: "America/New_York" });
    // New York is Robert's second clock already, so it is not repeated as the booker's.
    expect(google.inserted[0].description).toContain("When: 10:00 AM CDMX · 11:00 AM EST\n");
  });

  it("does not repeat Mexico City as the booker's clock", async () => {
    await book(makeEnv(), { date: "2026-10-05", time: "10:00", timeZone: "America/Mexico_City" });
    expect(google.inserted[0].description).toContain("When: 10:00 AM CDMX · 12:00 PM EDT\n");
  });

  it("drops a time zone it does not recognise instead of storing it", async () => {
    const env = makeEnv();
    await book(env, { date: "2026-10-05", time: "10:00", timeZone: "<script>alert(1)</script>" });
    expect(google.inserted[0].description).not.toContain("booker:");
    const row = await env.DB.prepare("SELECT booker_tz FROM bookings").first();
    expect(row).toEqual({ booker_tz: null });
  });

  it("refuses a slot someone else already took, without touching the calendar", async () => {
    google.busy.push({ start: mx("2026-10-05", "10:00"), end: mx("2026-10-05", "10:30") });
    const { status, data } = await book(makeEnv(), { date: "2026-10-05", time: "10:00" });
    expect(status).toBe(409);
    expect(data).toMatchObject({ ok: false, code: "slot_taken" });
    expect(google.inserted).toHaveLength(0);
  });

  it("refuses a slot inside the notice window even if the page offered it earlier", async () => {
    const { status, data } = await book(makeEnv(), { date: "2026-10-02", time: "19:30" });
    expect(status).toBe(409);
    expect(data.code).toBe("slot_taken");
  });

  it("stops the second of two visitors who were shown the same cached slot", async () => {
    const env = makeEnv();
    expect(await slots(env, "2026-10-05")).toContain("10:00"); // both visitors see it (cached)
    expect((await book(env, { date: "2026-10-05", time: "10:00" })).status).toBe(200);
    const second = await book(env, { date: "2026-10-05", time: "10:00" });
    expect(second.status).toBe(409);
    expect(google.inserted).toHaveLength(1);
    // And the slot list no longer offers it.
    expect(await slots(env, "2026-10-05")).not.toContain("10:00");
  });

  it("still rejects a booking from an origin that is not the site", async () => {
    const res = await worker.fetch(
      new Request("https://booking.test/book", {
        method: "POST",
        headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
        body: JSON.stringify({ name: "x", email: "x@example.com", date: "2026-10-05", time: "10:00", turnstileToken: "t" }),
      }),
      makeEnv(),
    );
    expect(res.status).toBe(403);
    expect(google.inserted).toHaveLength(0);
  });
});
