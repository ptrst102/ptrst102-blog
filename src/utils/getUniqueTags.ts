import type { CollectionEntry } from "astro:content";

export const getUniqueTags = (posts: CollectionEntry<"blog">[]) =>
  Array.from(new Set(posts.flatMap(({ data }) => data.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
