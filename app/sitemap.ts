import type { MetadataRoute } from "next";
import { posts } from "#site/content";
import { siteConfig } from "@/site.config";

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/work/`, lastModified: now },
    { url: `${base}/posts/`, lastModified: now },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.unlisted === false)
    .map((post) => ({
      url: `${base}/posts/${post.slug}/`,
      lastModified: new Date(post.date),
    }));

  return [...staticRoutes, ...postRoutes];
}
