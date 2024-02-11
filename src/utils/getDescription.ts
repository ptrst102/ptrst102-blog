import type { CollectionEntry } from "astro:content";

export const getDescription = (post: CollectionEntry<"blog">) => {
  const body = post.body
    .replace(/^#+\s/gm, "") // ヘッダーを削除
    .replace(/\n/g, "") // 改行を削除
    .replace(/!\[.*?\]\(.*?\)/g, "") // 画像を削除
    .replace(/\[(.*?)\]\(.*?\)/g, "$1"); // リンクのURLを除外し、テキストのみを残す

  const MAX_LENGTH = 100;
  return body.length > MAX_LENGTH
    ? body.substring(0, MAX_LENGTH - 1) + "…"
    : body;
};
