import { defineCollection, z } from "astro:content";

const blogSchema = z.object({
  title: z.string(),
  publishDate: z.date(),
  updateDate: z.date().optional(),
  tags: z.array(z.string()),
});

export type BlogSchema = z.infer<typeof blogSchema>;

const blogCollection = defineCollection({
  schema: blogSchema,
});

export const collections = {
  blog: blogCollection,
};
