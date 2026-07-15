import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  // Errors thrown by scripts the browser injects into our pages — not reachable
  // from our bundle and nothing user-facing breaks. Unactionable alert noise
  // that masks real errors.
  ignoreErrors: [
    // DuckDuckGo mobile injects user scripts that call its native message
    // broker; a page origin not allowlisted for the invoked feature rejects
    // with BrokerError.policyRestriction, whose message is "invalid origin".
    // See duckduckgo/apple-browsers UserScriptMessaging.swift.
    "invalid origin",
    // Benign layout notification the spec requires browsers to fire.
    "ResizeObserver loop",
  ],
});
