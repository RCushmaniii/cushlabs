import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// One flat `blog` collection. Language is derived from the folder prefix in the
// post id: "en/<slug>" or "es/<slug>". A post is BILINGUAL (a cornerstone) when
// it sets a reciprocal `translations` entry; otherwise it is single-language by
// design (the hybrid model — see docs/strategy/BLOG-HYBRID-ARCHITECTURE-PROPOSAL.md).
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      publishDate: z.string().transform((s) => new Date(s)),
      lastmod: z
        .string()
        .transform((s) => new Date(s))
        .optional(),
      publish: z.boolean().optional().default(true),
      categories: z.array(z.string()).optional().default([]),
      featuredImage: image().optional(),
      imageAlt: z.string().optional(),
      readingTime: z.string().optional(),
      // Cornerstone cross-link: EN post sets `translations.es`, ES post sets
      // `translations.en`. Value is the OTHER language's slug (bare or full path).
      // Presence of a reciprocal entry === bilingual mode.
      translations: z
        .object({ en: z.string().optional(), es: z.string().optional() })
        .optional(),
      // Optional SEO overrides — enforced by the build gate (title <=60, desc 120-160).
      seo: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .optional(),
      // When present -> post emits FAQPage JSON-LD (rich result).
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .optional(),
    }),
});

export const collections = { blog };
