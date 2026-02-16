/**
 * Centralized API endpoint configuration for the booking system.
 *
 * Set PUBLIC_BOOKING_API_URL in your .env to point to your deployed
 * Cloudflare Worker (e.g., https://cushlabs-booking.your-subdomain.workers.dev).
 */
export const API_BASE = (import.meta.env.PUBLIC_BOOKING_API_URL ?? '').trim();
