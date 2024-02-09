import type { CollectionEntry } from "astro:content";
import { getSortedPosts } from "./getSortedPosts";

export const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  getSortedPosts(posts.filter(({ data }) => data.tags.includes(tag)));
