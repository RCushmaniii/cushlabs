import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { postsForLocale, postSlug, postUrl } from "../../lib/blog";

export async function GET(context) {
  const all = await getCollection("blog");
  const posts = postsForLocale(all, "en");
  return rss({
    title: "The CushLabs Blog",
    description:
      "AI, automation, and local growth for small businesses — in plain language.",
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.publishDate,
      link: postUrl("en", postSlug(p)),
      categories: p.data.categories,
    })),
    customData: "<language>en-US</language>",
  });
}
