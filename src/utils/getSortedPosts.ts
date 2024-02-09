import { cdate } from "@/lib/cdate";
import type { CollectionEntry } from "astro:content";

export const getSortedPosts = (posts: CollectionEntry<"blog">[]) =>
  posts.sort(
    (a, b) =>
      cdate(b.data.publishDate).toDate().getTime() -
      cdate(a.data.publishDate).toDate().getTime(),
  );
