import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "#site/content";
import { Layout } from "@/components/Layout";
import { Title } from "@/components/Title";
import { formatMonthDay } from "@/lib/date";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Marcus’s posts",
  description:
    "I love explaining what I’ve learned — and what I’m still figuring out. Essays on AI, computer systems, and teaching.",
  path: "/posts",
});

type Post = (typeof posts)[number];

function groupByYear(list: Post[]): Map<number, Post[]> {
  const groups = new Map<number, Post[]>();
  for (const post of list) {
    const year = new Date(post.date).getUTCFullYear();
    const bucket = groups.get(year) ?? [];
    bucket.push(post);
    groups.set(year, bucket);
  }
  return groups;
}

export default function PostsPage() {
  const visible = posts
    .filter((p) => p.unlisted === false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const groups = groupByYear(visible);

  return (
    <Layout>
      <div className="mt-[64px] sm:mt-[95px]">
        <Title subhead="/posts" />
      </div>
      <div className="mt-[56px] flex flex-col gap-[44px] sm:mt-[78px]">
        {Array.from(groups.entries()).map(([year, postsInYear]) => (
          <section key={year} className="flex flex-col gap-[24px]">
            <h2 className="type-heading text-muted">{year}</h2>
            {postsInYear.map((post) => (
              <article key={post.slug} className="flex gap-[28px]">
                <div className="w-[95px] shrink-0 type-meta text-accent">
                  {formatMonthDay(post.date)}
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="post-link group relative flex min-w-0 flex-1 flex-col gap-[5px]"
                >
                  <span className="type-title text-heading transition-colors ease-[ease] group-hover:text-accent">
                    {post.title}
                  </span>
                  <span className="type-excerpt text-body">{post.lede}</span>
                </Link>
              </article>
            ))}
          </section>
        ))}
      </div>
    </Layout>
  );
}
