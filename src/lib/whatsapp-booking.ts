/**
 * The "book a consultation on WhatsApp" deep link, shared by the booking pages'
 * WhatsAppBookingCta card and the Spanish homepage hero.
 *
 * Sending the pre-typed message opens the booking Flow (day → time → details)
 * served by cushlabs-whatsapp. The text must keep matching bookingIntent() in
 * cushlabs-whatsapp src/flows/booking.ts ("agendar … consulta" /
 * "book … consultation"), or the message falls through instead of opening the Flow.
 *
 * This is Robert's OWN consultation booking, not a WhatsApp product claim.
 */
export const CUSHLABS_WA = "13072842785"; // +1 307 284 2785 — CushLabs sender number

export const WHATSAPP_BOOKING_MESSAGE = {
  es: "Quiero agendar una consulta",
  en: "I'd like to book a consultation",
} as const;

export function whatsappBookingHref(locale: "en" | "es"): string {
  return `https://wa.me/${CUSHLABS_WA}?text=${encodeURIComponent(WHATSAPP_BOOKING_MESSAGE[locale])}`;
}
