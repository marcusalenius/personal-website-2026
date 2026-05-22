import type { Metadata } from "next";
import { pages } from "#site/content";
import { Layout } from "@/components/Layout";
import { Title } from "@/components/Title";
import { MDXContent } from "@/components/MDXContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ path: "/" });

export default function HomePage() {
  const home = pages.find((p) => p.slug === "home");
  if (!home) throw new Error("content/pages/home.mdx not found");

  return (
    <Layout>
      <div className="mt-[64px] sm:mt-[95px]">
        <Title />
      </div>
      <div className="mt-[48px] type-body text-body space-y-[22px] sm:mt-[62px]">
        <MDXContent code={home.body} />
      </div>
    </Layout>
  );
}
