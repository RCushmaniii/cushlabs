import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { postsForLocale, postSlug, postUrl } from "../../../lib/blog";

export async function GET(context) {
  const all = await getCollection("blog");
  const posts = postsForLocale(all, "es");
  return rss({
    title: "Blog de CushLabs",
    description:
      "IA, automatización y crecimiento local para negocios pequeños — en palabras simples.",
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.publishDate,
      link: postUrl("es", postSlug(p)),
      categories: p.data.categories,
    })),
    customData: "<language>es-MX</language>",
  });
}
