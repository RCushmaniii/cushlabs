import { inject, track } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    cushlabsTrack?: (name: string, properties?: AnalyticsProperties) => void;
    cushlabsAttribution?: () => Record<string, string>;
  }
}

const STORAGE_KEY = "cushlabsAttribution";
const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function clean(value: string | null | undefined, maxLength = 100): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function readStoredAttribution(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .map(([key, value]) => [key, value.slice(0, 100)]),
    );
  } catch {
    return {};
  }
}

function captureAttribution(): Record<string, string> {
  const stored = readStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  const current: Record<string, string> = {};

  for (const key of CAMPAIGN_KEYS) {
    const value = clean(params.get(key));
    if (value) current[key] = value;
  }

  const campaignAttribution = Object.keys(current).length > 0 ? current : stored;
  const referrer = clean(document.referrer, 200);
  const attribution = {
    ...campaignAttribution,
    landing_page:
      clean(params.get("landing_page"), 200) ??
      clean(stored.landing_page, 200) ??
      window.location.pathname,
    ...(stored.referrer ? { referrer: stored.referrer } : referrer ? { referrer } : {}),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Analytics must never interfere with the conversion path.
  }

  return attribution;
}

function pageContext(attribution: Record<string, string>): AnalyticsProperties {
  const params = new URLSearchParams(window.location.search);
  const locale = document.documentElement.lang.startsWith("es") ? "es" : "en";

  return {
    ...attribution,
    page: window.location.pathname,
    locale,
    plan: clean(params.get("plan")),
    service: clean(params.get("service")),
    intent_source: clean(params.get("intent_source")),
    // Set by /demos/ industry links and its CTA, so booking events can be split by industry.
    industry: clean(params.get("industry"), 40),
  };
}

function decorateBookingLinks(attribution: Record<string, string>) {
  document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (!["/consultation/", "/es/reservar/"].includes(url.pathname)) return;

    for (const key of CAMPAIGN_KEYS) {
      if (!url.searchParams.has(key) && attribution[key]) {
        url.searchParams.set(key, attribution[key]);
      }
    }
    if (!url.searchParams.has("landing_page") && attribution.landing_page) {
      url.searchParams.set("landing_page", attribution.landing_page);
    }
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

/** The Messenger Page username an m.me link opens, or undefined for any other link. */
export function messengerBotFor(element: Element): string | undefined {
  if (!(element instanceof HTMLAnchorElement)) return undefined;
  let url: URL;
  try {
    url = new URL(element.href, window.location.origin);
  } catch {
    return undefined;
  }
  if (url.hostname !== "m.me" && url.hostname !== "www.m.me") return undefined;
  return clean(url.pathname.split("/").filter(Boolean)[0]?.toLowerCase(), 60) ?? "unknown";
}

export function initConversionAnalytics() {
  inject();

  const attribution = captureAttribution();
  const context = () => pageContext(attribution);

  window.cushlabsAttribution = () =>
    Object.fromEntries(
      Object.entries(context()).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  window.cushlabsTrack = (name, properties = {}) => {
    track(name, { ...context(), ...properties });
  };

  decorateBookingLinks(attribution);

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-analytics-event], a[href]")
      : null;
    if (!target) return;

    // Every Messenger demo link (m.me/<page>) fires messenger_demo_opened, whatever
    // else the link is tagged with — the /demos/ strip also sends live_demo_opened,
    // and m.me links inside blog posts carry no tag at all. One event name across
    // every placement is what makes "how many people opened a Messenger demo"
    // answerable. `bot` is the Page username: cushlabs or nyenglishteacher today.
    const messengerBot = messengerBotFor(target);
    if (messengerBot) {
      window.cushlabsTrack?.("messenger_demo_opened", {
        bot: messengerBot,
        label: clean(target.dataset.analyticsLabel ?? target.textContent),
        placement: clean(target.dataset.analyticsPlacement),
      });
    }

    const explicitEvent = target.dataset.analyticsEvent;
    if (explicitEvent) {
      window.cushlabsTrack?.(explicitEvent, {
        label: clean(target.dataset.analyticsLabel ?? target.textContent),
        plan: clean(target.dataset.analyticsPlan),
        service: clean(target.dataset.analyticsService),
        placement: clean(target.dataset.analyticsPlacement),
      });
      return;
    }

    if (!(target instanceof HTMLAnchorElement)) return;
    const destination = new URL(target.href, window.location.origin);
    if (
      destination.origin === window.location.origin &&
      ["/consultation/", "/es/reservar/"].includes(destination.pathname)
    ) {
      window.cushlabsTrack?.("booking_cta_clicked", {
        label: clean(target.textContent),
        placement: clean(target.dataset.analyticsPlacement),
      });
      return;
    }
    if (destination.hostname === "wa.me" || destination.hostname === "api.whatsapp.com") {
      window.cushlabsTrack?.("whatsapp_clicked", {
        label: clean(target.textContent),
        placement: clean(target.dataset.analyticsPlacement),
      });
    }
  });
}
