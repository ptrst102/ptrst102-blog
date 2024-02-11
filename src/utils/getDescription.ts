import type { CollectionEntry } from "astro:content";

export const getDescription = (post: CollectionEntry<"blog">) => {
  const body = post.body.replace(/^#+\s/gm, "").replace(/\n/g, "");

  const MAX_LENGTH = 100;
  return body.length > MAX_LENGTH
    ? body.substring(0, MAX_LENGTH - 1) + "…"
    : body;
};
