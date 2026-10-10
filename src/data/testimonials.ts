/**
 * Real, published testimonials — the ONLY source for quotes anywhere on the site.
 *
 * Rules (do not relax them):
 * - Every entry is a real person who actually said this and agreed to be named.
 *   No placeholders, no "sample" quotes, no invented clients. An empty list is fine:
 *   every section that reads this file renders nothing when it has nothing real.
 * - Quote verbatim. Where `original` is set it is the language the person wrote in;
 *   the other locale is a translation and must not drift in meaning.
 * - Never attach a price, plan or result to a quote that the person did not state.
 *
 * Read by: src/components/home2/SocialProof.astro (homepage) and
 * src/components/about/AboutPage.astro (/about/, /es/about/).
 */

export type Locale = "en" | "es";

export interface Testimonial {
  id: string;
  name: string;
  initials: string;
  /** Business or role line, shown under the name. Omit for a personal recommendation. */
  org?: string;
  orgUrl?: string;
  /** Language the person originally wrote the quote in, when known. */
  original?: Locale;
  quote: Record<Locale, string>;
  source: Record<Locale, string>;
}

export const testimonials: Testimonial[] = [
  // Small-business client. Given in English (her preference with Robert); approved
  // with this name 2026-09-30.
  {
    id: "azucena-carrillo",
    name: "Azucena Carrillo",
    initials: "AC",
    org: "Azúcar Trajes de Baño",
    orgUrl: "https://www.facebook.com/azucarenguadalajara/",
    original: "en",
    quote: {
      en: "We've given Robert the opportunity to work with our business to develop and adapt an automated AI system to the real needs of our stores and customers. It has been a collaborative process of testing, feedback, and continuous improvement, and we're excited to see how the system continues to evolve.",
      es: "Le dimos a Robert la oportunidad de trabajar con nuestro negocio para desarrollar y adaptar un sistema automatizado de IA a las necesidades reales de nuestras tiendas y clientes. Ha sido un proceso colaborativo de pruebas, retroalimentación y mejora continua, y nos entusiasma ver cómo el sistema sigue evolucionando.",
    },
    source: { en: "Client", es: "Cliente" },
  },
  // Public LinkedIn recommendation.
  {
    id: "julio-cesar-aldana-gomez",
    name: "Julio Cesar Aldana Gomez",
    initials: "JA",
    quote: {
      en: "Robert is one of the few people who can truly bridge the gap between 'this sounds promising' and 'this is already creating value'.",
      es: "Robert es una de las pocas personas que puede cerrar la brecha entre 'esto suena prometedor' y 'esto ya está generando valor'.",
    },
    source: { en: "LinkedIn Recommendation", es: "Recomendación en LinkedIn" },
  },
];

export function getTestimonial(id: string): Testimonial {
  const found = testimonials.find((t) => t.id === id);
  if (!found) throw new Error(`testimonials.ts: no testimonial with id "${id}"`);
  return found;
}
