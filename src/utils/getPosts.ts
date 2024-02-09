import { getCollection } from "astro:content";

export const getPosts = async () => await getCollection("blog");
