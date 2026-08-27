/**
 * Centralized API endpoint configuration for the booking system.
 *
 * Set PUBLIC_BOOKING_API_URL in your .env to point to your deployed
 * Cloudflare Worker (e.g., https://cushlabs-booking.your-subdomain.workers.dev).
 */
export const API_BASE = (import.meta.env.PUBLIC_BOOKING_API_URL ?? "").trim();

/**
 * Cloudflare Turnstile site key for the booking form's bot gate.
 *
 * Public by design — it ships in the page and is useless without the secret
 * half, which lives only as a Worker secret. When unset the booking form
 * renders no widget, the Worker receives no token, and POST /book is rejected:
 * booking fails CLOSED rather than reopening the hole. The form says so out
 * loud instead of failing the way technical debt #19 did.
 */
export const TURNSTILE_SITE_KEY = (
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? ""
).trim();
