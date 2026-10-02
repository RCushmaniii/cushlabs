import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
// Plain JS Worker module with no types alongside it; resolves as implicit `any`.
import {
  recordBooking,
  sendDueConfirmations,
  handleConfirmationRoutes,
  buildConfirmationEmail,
  missingVars,
  sendDailySummary,
  formatWhen,
  validTimeZone,
} from "../workers/lib/booking-confirm.js";

/** Minimal D1 stand-in over node:sqlite — same prepare/bind/run/all/first shape. */
function fakeD1() {
  const db = new DatabaseSync(":memory:");
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...a: unknown[]) {
          args = a;
          return stmt;
        },
        async run() {
          db.prepare(sql).run(...(args as never[]));
          return { success: true };
        },
        async all() {
          return { results: db.prepare(sql).all(...(args as never[])) };
        },
        async first() {
          return db.prepare(sql).get(...(args as never[])) ?? null;
        },
      };
      return stmt;
    },
  };
}

const HOUR = 3600e3;

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    DB: fakeD1(),
    BREVO_API_KEY: "xkeysib-test",
    CONFIRM_FROM_EMAIL: "NY English Teacher <robert@nyenglishteacher.com>",
    CONFIRM_BRAND: "NY English Teacher",
    PUBLIC_WORKER_URL: "https://booking.example.dev",
    REBOOK_URL: "https://www.nyenglishteacher.com/en/book",
    TIMEZONE: "America/Mexico_City",
    ...overrides,
  };
}

const deps = {
  getAccessToken: async () => "google-token",
  calendarId: "rcushmaniii@gmail.com",
};

async function tokenFor(env: ReturnType<typeof makeEnv>) {
  const row = await env.DB.prepare("SELECT token FROM bookings").first();
  return (row as { token: string }).token;
}

function req(method: string, path: string, token?: string) {
  const url = new URL(`https://booking.example.dev${path}`);
  if (method === "GET" && token) url.searchParams.set("t", token);
  const init: RequestInit = { method };
  if (method === "POST") {
    const body = new FormData();
    if (token) body.set("t", token);
    init.body = body;
  }
  return { request: new Request(url, init), url, path };
}

describe("booking confirmation", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes("api.brevo.com")) return new Response('{"id":"x"}', { status: 200 });
      if (!init?.method || init.method === "GET")
        return new Response(JSON.stringify({ summary: "NY English Consultation: Diego" }), { status: 200 });
      return new Response(init.method === "DELETE" ? null : "{}", { status: init.method === "DELETE" ? 204 : 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("records a booking and emails it only once it is inside the 2-26h window", async () => {
    const env = makeEnv();
    const now = new Date("2026-10-01T12:00:00Z");
    await recordBooking(env, {
      eventId: "ev1",
      startsAt: new Date(now.getTime() + 30 * HOUR).toISOString(),
      name: "Diego Olivera",
      email: "diego@example.com",
      lang: "es",
      meetLink: "https://meet.google.com/abc",
    });

    // 30h out: too early.
    expect(await sendDueConfirmations(env, now)).toMatchObject({ sent: 0 });
    // 6h later the meeting is 24h out: send.
    const later = new Date(now.getTime() + 6 * HOUR);
    expect(await sendDueConfirmations(env, later)).toMatchObject({ sent: 1 });
    // Never twice.
    expect(await sendDueConfirmations(env, later)).toMatchObject({ sent: 0 });

    const emailCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("brevo"));
    expect(emailCalls).toHaveLength(1);
    const body = JSON.parse(String(emailCalls[0][1].body));
    expect(body.to).toEqual([{ email: "diego@example.com", name: "Diego Olivera" }]);
    expect(body.sender).toEqual({ name: "NY English Teacher", email: "robert@nyenglishteacher.com" });
    expect(body.subject).toContain("¿Confirmas");
    expect(body.htmlContent).toContain("/confirm?t=");
    expect(body.htmlContent).toContain("/cancel?t=");
  });

  it("retries a failed send on the next run", async () => {
    const env = makeEnv();
    const now = new Date("2026-10-01T12:00:00Z");
    await recordBooking(env, { eventId: "ev1", startsAt: new Date(now.getTime() + 20 * HOUR).toISOString(), name: "A", email: "a@example.com", lang: "en" });
    fetchMock.mockImplementationOnce(async () => new Response("boom", { status: 500 }));
    expect(await sendDueConfirmations(env, now)).toMatchObject({ sent: 0, failed: 1 });
    expect(await sendDueConfirmations(env, now)).toMatchObject({ sent: 1 });
  });

  it("does not send when configuration is missing, and says what is missing", async () => {
    const env = makeEnv({ CONFIRM_FROM_EMAIL: undefined });
    expect(missingVars(env)).toEqual(["CONFIRM_FROM_EMAIL"]);
    expect(await sendDueConfirmations(env)).toMatchObject({ sent: 0, disabled: ["CONFIRM_FROM_EMAIL"] });
  });

  it("GET /confirm only shows a button; POST /confirm confirms and marks the calendar", async () => {
    const env = makeEnv();
    await recordBooking(env, { eventId: "ev1", startsAt: new Date(Date.now() + 20 * HOUR).toISOString(), name: "Diego", email: "d@example.com", lang: "es" });
    const token = await tokenFor(env);

    const g = req("GET", "/confirm", token);
    const getRes = await handleConfirmationRoutes(g.request, env, g.url, g.path, deps);
    expect(await getRes!.text()).toContain('method="POST"');
    let row = (await env.DB.prepare("SELECT status FROM bookings").first()) as { status: string };
    expect(row.status).toBe("booked"); // a link scanner opening the URL changes nothing

    const p = req("POST", "/confirm", token);
    const postRes = await handleConfirmationRoutes(p.request, env, p.url, p.path, deps);
    expect(await postRes!.text()).toContain("¡Confirmado!");
    row = (await env.DB.prepare("SELECT status FROM bookings").first()) as { status: string };
    expect(row.status).toBe("confirmed");
    const patch = fetchMock.mock.calls.find(([, init]) => init?.method === "PATCH");
    expect(JSON.parse(String(patch![1].body)).summary).toBe("✅ NY English Consultation: Diego");
  });

  it("POST /cancel deletes the calendar event with attendee notification", async () => {
    const env = makeEnv();
    await recordBooking(env, { eventId: "ev9", startsAt: new Date(Date.now() + 20 * HOUR).toISOString(), name: "Ana", email: "a@example.com", lang: "en" });
    const token = await tokenFor(env);
    const p = req("POST", "/cancel", token);
    const res = await handleConfirmationRoutes(p.request, env, p.url, p.path, deps);
    expect(await res!.text()).toContain("Meeting cancelled");
    const del = fetchMock.mock.calls.find(([, init]) => init?.method === "DELETE");
    expect(String(del![0])).toContain("/events/ev9?sendUpdates=all");
    const row = (await env.DB.prepare("SELECT status FROM bookings").first()) as { status: string };
    expect(row.status).toBe("cancelled");
  });

  it("rejects malformed and unknown tokens without touching the calendar", async () => {
    const env = makeEnv();
    for (const t of ["", "nope", "f".repeat(32)]) {
      const g = req("GET", "/confirm", t);
      const res = await handleConfirmationRoutes(g.request, env, g.url, g.path, deps);
      expect(res!.status).toBe(200);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves other paths to the host Worker", async () => {
    const env = makeEnv();
    const g = req("GET", "/slots/2026-10-01");
    expect(await handleConfirmationRoutes(g.request, env, g.url, g.path, deps)).toBeNull();
  });

  it("escapes the booker's name in the email", () => {
    const env = makeEnv();
    const email = buildConfirmationEmail(
      { token: "a".repeat(32), name: "<script>x</script>", lang: "en", starts_at: new Date().toISOString(), meet_link: null },
      env,
    );
    expect(email.html).not.toContain("<script>");
  });
});

describe("WhatsApp reminder and morning summary", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const WA = {
    WA_GATEWAY_URL: "https://wa.example.dev/",
    WA_GATEWAY_SECRET: "s3cret",
    WA_SENDER: "nye",
    OPERATOR_WA: "+52 33 1559 0572",
  };
  const waCalls = () =>
    fetchMock.mock.calls
      .filter(([u]) => String(u).includes("wa.example.dev"))
      .map(([u, init]) => ({ url: String(u), headers: (init as RequestInit).headers as Record<string, string>, body: JSON.parse(String((init as RequestInit).body)) }));

  it("sends the WhatsApp template only to bookings that opted in with a phone", async () => {
    const env = makeEnv(WA);
    const now = new Date("2026-10-01T12:00:00Z");
    const startsAt = new Date(now.getTime() + 20 * HOUR).toISOString();
    await recordBooking(env, { eventId: "a", startsAt, name: "Diego Olivera", email: "d@example.com", lang: "es", phone: "33 1234 5678", whatsappOptIn: true });
    await recordBooking(env, { eventId: "b", startsAt, name: "No Phone", email: "n@example.com", lang: "es", whatsappOptIn: true });
    await recordBooking(env, { eventId: "c", startsAt, name: "No OptIn", email: "o@example.com", lang: "en", phone: "5551234567", whatsappOptIn: false });

    const r = await sendDueConfirmations(env, now);
    expect(r.whatsapp).toMatchObject({ sent: 1, failed: 0 });
    const calls = waCalls();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://wa.example.dev/api/test-send-template");
    expect(calls[0].headers["x-test-secret"]).toBe("s3cret");
    const token = ((await env.DB.prepare("SELECT token FROM bookings WHERE event_id = 'a'").first()) as { token: string }).token;
    expect(calls[0].body).toMatchObject({
      to: "33 1234 5678",
      template: "consultation_reminder",
      lang: "es_MX",
      sender: "nye",
      buttonParams: [token, token],
    });
    expect(calls[0].body.params[0]).toBe("Diego");

    // Never twice.
    await sendDueConfirmations(env, now);
    expect(waCalls()).toHaveLength(1);
  });

  it("uses the WA_GATEWAY service binding instead of a public fetch when bound", async () => {
    const bound = vi.fn(async () => new Response("{}", { status: 200 }));
    const env = makeEnv({ ...WA, WA_GATEWAY: { fetch: bound } });
    const now = new Date("2026-10-01T12:00:00Z");
    await recordBooking(env, { eventId: "a", startsAt: new Date(now.getTime() + 20 * HOUR).toISOString(), name: "A", email: "a@example.com", lang: "es", phone: "3312345678", whatsappOptIn: true });
    const r = await sendDueConfirmations(env, now);
    expect(r.whatsapp).toMatchObject({ sent: 1 });
    expect(bound).toHaveBeenCalledTimes(1);
    expect(waCalls()).toHaveLength(0);
  });

  it("skips WhatsApp entirely when the gateway is not configured", async () => {
    const env = makeEnv();
    const now = new Date("2026-10-01T12:00:00Z");
    await recordBooking(env, { eventId: "a", startsAt: new Date(now.getTime() + 20 * HOUR).toISOString(), name: "A", email: "a@example.com", lang: "es", phone: "3312345678", whatsappOptIn: true });
    const r = await sendDueConfirmations(env, now);
    expect(r.whatsapp).toEqual({ skipped: "not configured" });
  });

  it("sends Robert one summary of today's consultations at 08:00 local, once", async () => {
    const env = makeEnv(WA);
    // 2026-10-01 is CST (UTC-6, no DST): 13:30 local = 19:30Z, 17:00 local = 23:00Z.
    await recordBooking(env, { eventId: "a", startsAt: "2026-10-01T19:30:00Z", name: "Diego  Olivera", email: "d@example.com", lang: "es" });
    await recordBooking(env, { eventId: "b", startsAt: "2026-10-01T23:00:00Z", name: "Ana", email: "a@example.com", lang: "en" });
    await recordBooking(env, { eventId: "c", startsAt: "2026-10-02T19:30:00Z", name: "Tomorrow", email: "t@example.com", lang: "en" });
    await env.DB.prepare("UPDATE bookings SET status = 'confirmed' WHERE event_id = 'b'").run();

    expect(await sendDailySummary(env, new Date("2026-10-01T13:30:00Z"))).toEqual({ skipped: "too early" }); // 07:30 local
    const r = await sendDailySummary(env, new Date("2026-10-01T14:00:00Z")); // 08:00 local
    expect(r).toMatchObject({ sent: 1, count: 2 });
    const [call] = waCalls();
    expect(call.body).toMatchObject({ to: "+52 33 1559 0572", template: "consultation_daily_summary", lang: "en_US", sender: "cushlabs" });
    expect(call.body.params).toEqual(["2", "NY English Teacher", "1:30 PM CDMX / 3:30 PM EDT Diego Olivera ⏳ · 5:00 PM CDMX / 7:00 PM EDT Ana ✅"]);

    expect(await sendDailySummary(env, new Date("2026-10-01T14:30:00Z"))).toEqual({ skipped: "already sent" });
    expect(waCalls()).toHaveLength(1);
  });

  it("sends nothing on a day with no consultations", async () => {
    const env = makeEnv(WA);
    expect(await sendDailySummary(env, new Date("2026-10-01T14:00:00Z"))).toEqual({ sent: 0, count: 0 });
    expect(waCalls()).toHaveLength(0);
  });
});

describe("combined morning summary (both sites in one message)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const WA = { WA_GATEWAY_URL: "https://wa.example.dev", WA_GATEWAY_SECRET: "s", WA_SENDER: "cushlabs", OPERATOR_WA: "+52 33 1559 0572" };
  const sentBodies = () =>
    fetchMock.mock.calls.filter(([u]) => String(u).includes("wa.example.dev")).map(([, init]) => JSON.parse(String((init as RequestInit).body)));

  async function peerWorker() {
    const peerEnv = makeEnv({ SUMMARY_SECRET: "peer-secret" });
    await recordBooking(peerEnv, { eventId: "p1", startsAt: "2026-10-01T16:00:00Z", name: "Diego", email: "d@example.com", lang: "es" }); // 10:00 local
    return {
      fetch: async (url: string, init?: RequestInit) => {
        const u = new URL(url);
        const request = new Request(u, init);
        return (await handleConfirmationRoutes(request, peerEnv, u, u.pathname, deps)) ?? new Response("nf", { status: 404 });
      },
    };
  }

  it("merges both sites' consultations into one message, sorted by time and tagged by site", async () => {
    const env = makeEnv({
      ...WA,
      CONFIRM_BRAND: "CushLabs.ai",
      SUMMARY_LABEL: "CushLabs",
      PEER_LABEL: "NYE",
      SUMMARY_SITES: "NY English Teacher + CushLabs.ai",
      SUMMARY_SECRET: "peer-secret",
      PEER_BOOKING: await peerWorker(),
    });
    await recordBooking(env, { eventId: "c1", startsAt: "2026-10-01T19:30:00Z", name: "Ana", email: "a@example.com", lang: "en" }); // 13:30 local
    const r = await sendDailySummary(env, new Date("2026-10-01T14:00:00Z"));
    expect(r).toMatchObject({ sent: 1, count: 2 });
    const [body] = sentBodies();
    expect(body.params).toEqual(["2", "NY English Teacher + CushLabs.ai", "10:00 AM CDMX / 12:00 PM EDT Diego (NYE) ⏳ · 1:30 PM CDMX / 3:30 PM EDT Ana (CushLabs) ⏳"]);
  });

  it("still sends, and says so, when the other site cannot be read", async () => {
    const env = makeEnv({ ...WA, SUMMARY_LABEL: "CushLabs", PEER_LABEL: "NYE", SUMMARY_SECRET: "wrong", PEER_BOOKING: await peerWorker() });
    await recordBooking(env, { eventId: "c1", startsAt: "2026-10-01T19:30:00Z", name: "Ana", email: "a@example.com", lang: "en" });
    await sendDailySummary(env, new Date("2026-10-01T14:00:00Z"));
    expect(sentBodies()[0].params[2]).toBe("1:30 PM CDMX / 3:30 PM EDT Ana (CushLabs) ⏳ · (NYE list unavailable)");
  });

  it("the peer that hands off the summary never sends one itself", async () => {
    const env = makeEnv({ ...WA, DAILY_SUMMARY: "off" });
    await recordBooking(env, { eventId: "x", startsAt: "2026-10-01T19:30:00Z", name: "A", email: "a@example.com", lang: "en" });
    expect(await sendDailySummary(env, new Date("2026-10-01T14:00:00Z"))).toEqual({ skipped: "sent by peer" });
    expect(sentBodies()).toHaveLength(0);
  });

  it("the internal list refuses callers without the secret", async () => {
    const env = makeEnv({ SUMMARY_SECRET: "peer-secret" });
    const u = new URL("https://x/internal/todays-bookings");
    const res = await handleConfirmationRoutes(new Request(u), env, u, u.pathname, deps);
    expect(res!.status).toBe(404);
  });
});

describe("time zones (2026-10-02: a booking showed the wrong time for someone not in Mexico City)", () => {
  const MX = "America/Mexico_City";
  // 10:00 AM Mexico City on Mon 5 Oct 2026 (US on daylight time) and Mon 7 Dec 2026 (US on standard time).
  const october = "2026-10-05T16:00:00.000Z";
  const december = "2026-12-07T16:00:00.000Z";

  it("keeps the old wording when the booker is on Mexico City time or gave no zone", () => {
    expect(formatWhen(october, "en", MX)).toBe("Monday, October 5 at 10:00 AM (Mexico City time)");
    expect(formatWhen(october, "en", MX, "America/Monterrey")).toBe("Monday, October 5 at 10:00 AM (Mexico City time)");
  });

  it("leads with the booker's own clock and follows US daylight saving", () => {
    expect(formatWhen(october, "en", MX, "America/New_York")).toBe(
      "Monday, October 5 at 12:00 PM (your time; 10:00 AM Mexico City time)",
    );
    expect(formatWhen(december, "en", MX, "America/New_York")).toBe(
      "Monday, December 7 at 11:00 AM (your time; 10:00 AM Mexico City time)",
    );
  });

  it("ignores a zone the runtime does not recognise", () => {
    expect(validTimeZone("Not/AZone")).toBeNull();
    expect(validTimeZone("<script>")).toBeNull();
    expect(formatWhen(october, "en", MX, "Not/AZone")).toBe("Monday, October 5 at 10:00 AM (Mexico City time)");
  });
});
