import { cdate } from "@/lib/cdate";
import { getCollection } from "astro:content";

export const getPosts = async () => {
  const entries = await getCollection("blog");

  return entries.sort(
    (a, b) =>
      cdate(b.data.publishDate).toDate().getTime() -
      cdate(a.data.publishDate).toDate().getTime(),
  );
};
