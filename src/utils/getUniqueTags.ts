import type { CollectionEntry } from "astro:content";

export const getUniqueTags = (posts: CollectionEntry<"blog">[]) =>
  Array.from(new Set(posts.map(({ data }) => data.tags).flat())).sort((a, b) =>
    a.localeCompare(b),
  );
