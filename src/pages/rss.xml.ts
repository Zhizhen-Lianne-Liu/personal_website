import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: { site?: URL }) {
  const posts = (
    await getCollection("writing", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: "Lianne Liu — Writing",
    description: "Notes about design, technology, and process.",
    site: context.site ?? new URL("https://lianneliu.user.srcf.net"),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `writing/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
