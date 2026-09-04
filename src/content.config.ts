import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string({
      required_error: 'El campo "title" es obligatorio en el frontmatter del documento MDX.',
    }),
    description: z.string().optional(),
  }),
});

export const collections = {
  docs,
};
