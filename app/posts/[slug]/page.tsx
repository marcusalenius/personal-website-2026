import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "#site/content";
import { Layout } from "@/components/Layout";
import { BackLink } from "@/components/BackLink";
import { ArticleHeader } from "@/components/ArticleHeader";
import { MDXContent } from "@/components/MDXContent";
import { TableOfContents } from "@/components/TableOfContents";
import { FootnoteScroll } from "@/components/FootnoteScroll";
import { Sidenotes } from "@/components/Sidenotes";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.lede,
    path: `/posts/${post.slug}`,
    image: post.image?.src,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <Layout width="narrow">
      <div className="mt-[72px]">
        <BackLink href="/posts">back to posts</BackLink>
      </div>
      <div className="mt-[28px]">
        <ArticleHeader
          title={post.title}
          lede={post.lede}
          date={post.date}
          readingTime={post.readingTime}
          wordCount={post.metadata.wordCount}
        />
      </div>
      <div className="article-body mt-[40px]">
        <MDXContent code={post.body} />
      </div>
      {post.maxTocLevel ? (
        <TableOfContents maxLevel={post.maxTocLevel} />
      ) : null}
      <FootnoteScroll />
      <Sidenotes />
    </Layout>
  );
}
