import { getOgImage } from "@/components/OgImage";
import { getPosts } from "@/lib/getPosts";
import type { APIContext } from "astro";

export const getStaticPaths = async () => {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      post,
    },
  }));
};

export async function GET({ params }: APIContext) {
  const { slug } = params;
  if (!slug) return { status: 404 };

  const posts = await getPosts();

  const post = posts.find((post) => post.slug === slug);
  if (!post) return { status: 404 };

  const body = await getOgImage(post.data.title ?? "無題");

  return new Response(body, {
    headers: {
      "content-type": "image/png",
    },
  });
}
