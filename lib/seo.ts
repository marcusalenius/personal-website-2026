import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

const siteName = `${siteConfig.name.first} ${siteConfig.name.last}`;

type BuildMetadata = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

// Match `trailingSlash: true` so canonical URLs point at the exported path.
function withTrailingSlash(path: string): string {
  if (path === "/") return path;
  return path.endsWith("/") ? path : `${path}/`;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
}: BuildMetadata): Metadata {
  const fullTitle = title ?? siteName;
  const canonical = withTrailingSlash(path);

  return {
    // Omit `title` entirely when not provided so the layout's default applies;
    // setting `title: undefined` would suppress the default instead.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      url: canonical,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
