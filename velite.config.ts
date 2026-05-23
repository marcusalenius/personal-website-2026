import { defineCollection, defineConfig, s } from "velite";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkMath from "remark-math";
import remarkWikiLink from "remark-wiki-link";
import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";

// Render container directives (`:::name … :::`) as `<div class="name">` so posts
// can mark up custom blocks (e.g. `:::tight` for compact lists) without raw HTML.
function remarkDirectiveToDiv() {
  return (tree: import("mdast").Root) => {
    visit(tree, "containerDirective", (node) => {
      const data = node.data ?? (node.data = {});
      data.hName = "div";
      data.hProperties = { className: [node.name] };
    });
  };
}

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title: s.string(),
    lede: s.string(),
    date: s.isodate(),
    readingTime: s.number().int().positive().optional(),
    image: s.image().optional(),
    unlisted: s.boolean().default(false),
    maxTocLevel: s.number().int().min(1).max(6).optional(),
    slug: s.slug("posts"),
    body: s.mdx(),
    // Derived (not authored): word count drives reading-time fallback (§7.3),
    // toc feeds the TableOfContents sidebar (M9).
    metadata: s.metadata(),
    toc: s.toc(),
  }),
});

const work = defineCollection({
  name: "Work",
  pattern: "work/*.yml",
  schema: s.object({
    organization: s.string(),
    role: s.string(),
    start: s.isodate(),
    end: s.isodate().optional(),
  }),
});

const pages = defineCollection({
  name: "Page",
  pattern: "pages/*.mdx",
  schema: s.object({
    slug: s.slug("pages"),
    body: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    clean: true,
  },
  collections: { posts, work, pages },
  mdx: {
    remarkPlugins: [
      remarkGfm,
      remarkSmartypants,
      remarkMath,
      remarkDirective,
      remarkDirectiveToDiv,
      [
        remarkWikiLink,
        {
          hrefTemplate: (l: string) => `/posts/${l}`,
          aliasDivider: "|",
          // Default pageResolver converts spaces to underscores; spec §7.2 promises
          // `[[Other Post]] -> /other-post` (kebab-case), so override.
          pageResolver: (name: string) => [
            name.replace(/ /g, "-").toLowerCase(),
          ],
        },
      ],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrettyCode, { theme: { light: "github-light", dark: "github-light" } }],
    ],
  },
});
