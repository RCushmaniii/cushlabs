import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
// Plain JS Worker module with no types alongside it; resolves as implicit `any`.
import {
  recordBooking,
  sendDueConfirmations,
  handleConfirmationRoutes,
  buildConfirmationEmail,
  missingVars,
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
