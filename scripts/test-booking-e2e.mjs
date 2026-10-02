#!/usr/bin/env node
/**
 * Booking form, end to end in a real browser — against a FAKE booking API.
 *
 *   npm run test:booking-e2e              # builds a test copy of the site, then runs
 *   npm run test:booking-e2e -- --no-build  # reuse the last test build (.e2e-dist/)
 *
 * Why it exists (2026-10-02): a booking read as the wrong time, the form had a
 * day-off-by-one bug east of UTC, and the page was rebuilt (calendar first, step-2
 * summary, slot_taken handling). None of that was covered by anything but eyes.
 *
 * What is real: the built pages, the form's JavaScript, Chromium, and the visitor's
 * time zone and language (each scenario runs in its own emulated zone).
 * What is fake: the booking Worker (/slots, /book) and the Turnstile widget. The
 * Worker itself is covered separately in tests/booking-worker.test.ts. No request
 * leaves this machine, so nothing reaches Robert's calendar.
 *
 * The site is built with PUBLIC_BOOKING_API_URL pointing at a host that only exists
 * inside this script, so a missed interception fails loudly instead of booking.
 */
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, ".e2e-dist");
const API = "https://booking-api.e2e.invalid";
// Fixed "now": Friday 2 Oct 2026, 1:00 PM Mexico City.
const NOW = new Date("2026-10-02T19:00:00Z");

/* ---------------------------------- build ---------------------------------- */

if (!process.argv.includes("--no-build")) {
  console.log("Building a test copy of the site into .e2e-dist/ …");
  const r = spawnSync("npx", ["astro", "build", "--outDir", OUT], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
    shell: true,
    env: { ...process.env, PUBLIC_BOOKING_API_URL: API, PUBLIC_TURNSTILE_SITE_KEY: "e2e-site-key" },
  });
  if (r.status !== 0) {
    console.error("Build failed.");
    process.exit(1);
  }
}

/* ------------------------------- static server ------------------------------ */

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  let p = join(OUT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  try {
    if ((await stat(p)).isDirectory()) p = join(p, "index.html");
    res.writeHead(200, { "Content-Type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const SITE = `http://127.0.0.1:${server.address().port}`;

/* ---------------------------------- browser --------------------------------- */

let browser;
try {
  browser = await chromium.launch();
} catch {
  browser = await chromium.launch({ channel: "chrome" }); // fall back to installed Chrome
}

// What the stub widget hands the form; the fake /book checks it arrives.
const FAKE_WIDGET_RESPONSE = "e2e-widget-response";
const TURNSTILE_STUB = `window.turnstile = {
  render: () => "e2e-widget",
  getResponse: () => "${FAKE_WIDGET_RESPONSE}",
  reset: () => {},
};`;

/** Default fake calendar: today is past notice, Sunday closed, Saturday and Monday open. */
const DEFAULT_SLOTS = {
  "2026-10-02": [],
  "2026-10-03": ["09:00", "09:30", "12:30"],
  "2026-10-04": [],
  "2026-10-05": ["09:00", "10:00", "16:00"],
};

async function open(path, { timezoneId, locale, viewport = { width: 1280, height: 900 }, bookReply }) {
  const context = await browser.newContext({ timezoneId, locale, viewport });
  await context.clock.setFixedTime(NOW);
  const page = await context.newPage();
  const api = { slotsRequests: [], bookings: [] };
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith(SITE)) return route.continue();
    if (url.startsWith("https://challenges.cloudflare.com/")) {
      return route.fulfill({ contentType: "text/javascript", body: TURNSTILE_STUB });
    }
    if (url.startsWith(`${API}/slots/`)) {
      const date = new URL(url).pathname.split("/").pop();
      api.slotsRequests.push(date);
      return route.fulfill({ json: { ok: true, slots: DEFAULT_SLOTS[date] ?? ["09:00"] } });
    }
    if (url.startsWith(`${API}/book`)) {
      const body = route.request().postDataJSON();
      api.bookings.push(body);
      const reply = bookReply?.(body) ?? {
        status: 200,
        json: { ok: true, eventId: "e2e-event-1", meetLink: "https://meet.google.com/e2e-test-abc" },
      };
      return route.fulfill(reply);
    }
    return route.abort(); // fonts, analytics, Sentry: never leave the machine
  });

  await page.goto(`${SITE}${path}`);
  await page.waitForSelector(".time-slot-btn");
  return { page, context, api, errors };
}

/* ---------------------------------- checks ---------------------------------- */

const results = [];
async function scenario(name, fn) {
  try {
    await fn();
    results.push([true, name]);
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push([false, name]);
    console.log(`  ✗ ${name}\n      ${String(err?.message || err).split("\n").join("\n      ")}`);
  }
}
function expect(actual, expected, what) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${what}: expected ${e}, got ${a}`);
}
function expectContains(text, part, what) {
  if (!String(text).includes(part)) throw new Error(`${what}: expected to contain "${part}", got "${text}"`);
}
const text = (page, sel) => page.locator(sel).first().innerText();
const step = (page) => page.locator(".step-content.active").getAttribute("data-step");

async function fillAndConfirm(page, { phone = "", optIn = false } = {}) {
  await page.fill("#booking-full-name", "E2E Tester");
  await page.fill("#booking-email", "e2e@example.com");
  if (phone) await page.fill("#booking-phone", phone);
  if (optIn) await page.check("#booking-whatsapp-optin");
  await page.click("#confirm-booking");
}

console.log("\nBooking form — browser checks");

await scenario("Mexico City visitor (EN): opens on first open day, books, sees confirmation", async () => {
  const { page, context, api, errors } = await open("/consultation/", { timezoneId: "America/Mexico_City", locale: "en-US" });

  expect(await text(page, "#selected-date-display-top"), "Saturday, October 3", "opens on the first day with free times");
  expectContains(await text(page, "#timezone-info-text"), "Mexico City time", "time zone note");
  const sunday = page.locator('#calendar-days button[aria-label="Sunday, October 4, 2026"]');
  expect(await sunday.isDisabled(), true, "Sunday is disabled");
  expect(await page.locator(".time-slot-btn").allInnerTexts(), ["9:00 AM", "9:30 AM", "12:30 PM"], "12-hour slot labels");

  await page.click('.time-slot-btn[data-time="09:00"]');
  await page.waitForSelector('.step-content[data-step="2"].active');
  expect(await text(page, "#step2-when"), "Sat, Oct 3 · 9:00 AM", "step 2 shows the chosen slot");

  // WhatsApp opt-in only once there is a phone number.
  expect(await page.locator("#booking-whatsapp-optin-row").isVisible(), false, "opt-in hidden without phone");
  await page.fill("#booking-phone", "+52 33 1234 5678");
  expect(await page.locator("#booking-whatsapp-optin-row").isVisible(), true, "opt-in shown with phone");

  // Change goes back and a new pick replaces the old one.
  await page.click("#step2-change");
  expect(await step(page), "1", "Change returns to step 1");
  await page.click('.time-slot-btn[data-time="12:30"]');
  await page.waitForSelector('.step-content[data-step="2"].active');
  expect(await text(page, "#step2-when"), "Sat, Oct 3 · 12:30 PM", "step 2 follows the new pick");

  await page.check("#booking-whatsapp-optin");
  await fillAndConfirm(page);
  await page.waitForSelector('.step-content[data-step="3"].active');

  expect(api.bookings.length, 1, "one booking sent");
  const b = api.bookings[0];
  expect(
    { date: b.date, time: b.time, timeZone: b.timeZone, phone: b.phone, whatsappOptIn: b.whatsappOptIn, turnstileToken: b.turnstileToken },
    { date: "2026-10-03", time: "12:30", timeZone: "America/Mexico_City", phone: "+52 33 1234 5678", whatsappOptIn: true, turnstileToken: FAKE_WIDGET_RESPONSE },
    "booking payload",
  );
  expectContains(await text(page, "#summary-datetime"), "12:30 PM", "confirmation shows the time");
  expect(await page.locator("#summary-meet-wrap a").getAttribute("href"), "https://meet.google.com/e2e-test-abc", "Meet link shown");
  expect(errors, [], "no page errors");
  await context.close();
});

await scenario("New York visitor (EN): sees and confirms in their own time, books the right Mexico City slot", async () => {
  const { page, context, api } = await open("/consultation/", { timezoneId: "America/New_York", locale: "en-US" });

  expectContains(await text(page, "#timezone-info-text"), "your local time (EDT)", "time zone note");
  const first = page.locator('.time-slot-btn[data-time="09:00"]');
  expectContains(await first.innerText(), "11:00 AM", "local time is the big number");
  expectContains(await first.innerText(), "9:00 AM Mexico City", "Mexico City time underneath");

  await first.click();
  await page.waitForSelector('.step-content[data-step="2"].active');
  expect(await text(page, "#step2-when"), "Sat, Oct 3 · 11:00 AM (EDT)", "step 2 in the visitor's clock");

  await fillAndConfirm(page);
  await page.waitForSelector('.step-content[data-step="3"].active');
  expect(
    { date: api.bookings[0].date, time: api.bookings[0].time, timeZone: api.bookings[0].timeZone },
    { date: "2026-10-03", time: "09:00", timeZone: "America/New_York" },
    "payload keeps the Mexico City slot and sends the visitor's zone",
  );
  expectContains(await text(page, "#summary-datetime"), "11:00 AM (EDT)", "confirmation in the visitor's clock");
  await context.close();
});

await scenario("Madrid visitor (ES): clicking Monday 5 asks for and books Monday 5 (was off by one day)", async () => {
  const { page, context, api } = await open("/es/reservar/", { timezoneId: "Europe/Madrid", locale: "es-ES" });

  await page.click('#calendar-days button[aria-label="lunes, 5 de octubre de 2026"]');
  await page.waitForFunction(() => document.querySelector("#selected-date-display-top")?.textContent?.includes("5 de octubre"));
  expect(api.slotsRequests.at(-1), "2026-10-05", "slots requested for the clicked day");

  const slot = page.locator('.time-slot-btn[data-time="09:00"]');
  await slot.waitFor();
  expectContains(await slot.innerText(), "09:00 CDMX", "Mexico City time underneath, 24-hour in Spanish");
  await slot.click();
  await page.waitForSelector('.step-content[data-step="2"].active');
  await fillAndConfirm(page);
  await page.waitForSelector('.step-content[data-step="3"].active');
  expect(api.bookings[0].date, "2026-10-05", "booked the day that was clicked");
  expect(api.bookings[0].timeZone, "Europe/Madrid", "visitor zone sent");
  await context.close();
});

await scenario("Slot taken by someone else: the form says so and refreshes the times", async () => {
  const { page, context, api } = await open("/consultation/", {
    timezoneId: "America/Mexico_City",
    locale: "en-US",
    bookReply: () => ({
      status: 409,
      json: { ok: false, code: "slot_taken", error: "Someone just booked that time. Please pick another." },
    }),
  });
  await page.click('.time-slot-btn[data-time="09:00"]');
  await page.waitForSelector('.step-content[data-step="2"].active');
  const before = api.slotsRequests.length;
  await fillAndConfirm(page);
  await page.waitForSelector("#form-error:not(.hidden)");
  expectContains(await text(page, "#form-error"), "Someone just booked that time", "explains what happened");
  for (let i = 0; i < 20 && api.slotsRequests.length <= before; i++) await page.waitForTimeout(100);
  if (api.slotsRequests.length <= before) throw new Error("slots were not refreshed after slot_taken");
  expect(await page.locator("#confirm-booking").isEnabled(), true, "confirm button usable again");
  await context.close();
});

await scenario("Phone (390px): calendar on the first screen, nothing wider than the screen", async () => {
  for (const path of ["/consultation/", "/es/reservar/"]) {
    const { page, context } = await open(path, {
      timezoneId: "America/Mexico_City",
      locale: path.startsWith("/es") ? "es-MX" : "en-US",
      viewport: { width: 390, height: 844 },
    });
    const top = await page.locator("#calendar-days").evaluate((el) => el.getBoundingClientRect().top);
    if (top > 844) throw new Error(`${path}: calendar starts at ${Math.round(top)}px, below the first screen`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, false, `${path}: horizontal overflow`);
    await context.close();
  }
});

await browser.close();
server.close();

const failed = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
