import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('CushLabs Team'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

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
  blog,
  'case-studies': caseStudies,
};
