import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repo: z.string(),
    demo: z.string().optional(),
    stack: z.array(z.string()),
    featured: z.boolean().default(false),
    pubDate: z.date(),
  }),
});

export const collections = {
  'case-studies': caseStudies,
};
