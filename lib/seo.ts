import type { Metadata } from "next";
import { siteConfig } from "@/site.config";

const siteName = `${siteConfig.name.first} ${siteConfig.name.last}`;

type BuildMetadata = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
}: BuildMetadata): Metadata {
  const fullTitle = title ? `${title} — ${siteName}` : siteName;

  return {
    // Omit `title` entirely when not provided so the layout's default applies;
    // setting `title: undefined` would suppress the default instead.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      url: path,
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
