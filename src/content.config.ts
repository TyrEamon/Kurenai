import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 沿用旧站 Fuwari 字段名（迁移近 1:1），新增可选 project（项目复盘）。
// canonical schema 见 codex-think/research/search-paging-i18n.md §2
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().default(''),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    lang: z.enum(['zh', 'en']).default('zh'),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
    project: z
      .object({
        role: z.string().optional(),
        stack: z.array(z.string()).default([]),
        links: z
          .object({ live: z.string().optional(), repo: z.string().optional() })
          .partial()
          .optional(),
      })
      .optional(),
  }),
});

export const collections = { posts };
