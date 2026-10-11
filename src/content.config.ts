import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blogSchema = z.object({
  title: z.string(),
  publishDate: z.coerce.date(),
  updateDate: z.coerce.date().optional(),
  tags: z.array(z.string()),
});

export type BlogSchema = z.infer<typeof blogSchema>;

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: blogSchema,
});

export const collections = {
  blog: blogCollection,
};
