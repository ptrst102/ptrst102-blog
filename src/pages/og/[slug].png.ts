import type { APIContext } from "astro";

import { getOgImage } from "@/components/OgImage";
import { getPosts } from "@/utils/getPosts";

export const getStaticPaths = async () => {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      post,
    },
  }));
};

export async function GET({ params }: APIContext) {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 404 });

  const posts = await getPosts();

  const post = posts.find((post) => post.id === slug);
  if (!post) return new Response(null, { status: 404 });

  const body = await getOgImage(post.data.title ?? "無題");

  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": "image/png",
    },
  });
}
