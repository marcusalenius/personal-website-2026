import { pages } from "#site/content";
import { Layout } from "@/components/Layout";
import { Title } from "@/components/Title";
import { MDXContent } from "@/components/MDXContent";

export default function HomePage() {
  const home = pages.find((p) => p.slug === "home");
  if (!home) throw new Error("content/pages/home.mdx not found");

  return (
    <Layout>
      <div className="mt-[110px]">
        <Title />
      </div>
      <div className="mt-[62px] type-body text-body space-y-[22px]">
        <MDXContent code={home.body} />
      </div>
    </Layout>
  );
}
