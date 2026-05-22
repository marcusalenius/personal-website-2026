# Personal Website 2026 — Spec

A statically exported Next.js 15 site for Marcus Alenius at `alenius.io`, deployed to GitHub Pages via a `CNAME` file. Three primary pages (Home, Work, Posts) plus per-post article pages, driven by typed content collections so adding a post or a job is one file edit.

This document is the contract between design, content, and code. If something here disagrees with the Figma, the Figma wins for visual decisions and this doc wins for content model and build behavior.

**Design source:** [Figma — New Website](https://www.figma.com/design/OoNCGQ9ESmLNYua1obJVj5/New-Website) (`fileKey: OoNCGQ9ESmLNYua1obJVj5`).

## 1. Goals

- **Author-friendly publishing.** Drop a `.mdx` file in `content/posts/`, push to `main`, get a built post with title, lede, OG image, sitemap entry, syntax highlighting, footnotes, optional TOC, and KaTeX math. No bookkeeping outside the file.
- **Type-safe content.** Frontmatter and YAML are validated at build time. Bad metadata fails the build with a useful error.
- **Designed-from-tokens.** Colors, typography, and spacing live as CSS variables / Tailwind theme entries derived from the Figma design system. A light-only palette today; adding dark mode later means defining a second token set, not rewriting components.
- **Static, cheap, fast.** `output: 'export'` to GitHub Pages. No server runtime. Each post page ships as static HTML with the minimum JS needed for footnotes/TOC.

## 2. Non-goals

- No dark-mode in v1.
- No tags, categories, or per-post custom CSS files.
- No Substack / newsletter signup.
- No CMS or draft workflow — authoring is git commits.
- No comments, analytics dashboards, search.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript `"strict": true` + `"noUncheckedIndexedAccess": true` |
| Styling | Tailwind CSS v4, theme defined in CSS via `@theme` (no `tailwind.config.ts`) |
| Content layer | [Velite](https://velite.js.org) — zod-typed collections, MDX compilation, watch mode |
| MDX runtime | Velite compiles MDX to JS at build time; a small `<MDXContent />` wrapper hydrates the result with component overrides |
| Markdown plugins | See §7.2 — all configured in `velite.config.ts` |
| Fonts | `next/font` loading **Nunito Sans** (variable) — regular, italic, semibold, bold, bold-italic |
| Icons | Phosphor Icons (React) — `PaperPlaneTilt`, `GithubLogo`, `LinkedinLogo`, `ArrowLeft` (all regular weight); `ArrowUpRight` (**bold** weight — heavier strokes hold up better at the size used for inline link glyphs) |
| Deployment | GitHub Pages via `actions/deploy-pages`, `output: 'export'`, custom apex domain via `CNAME` |

**MDX ownership.** Velite is the single MDX compiler in this stack. There is no `mdx-components.tsx` and no `@next/mdx` integration. Plugins, components, and the resulting render function all flow through Velite.

## 4. Routes

| Path | Source | Notes |
|---|---|---|
| `/` | `content/pages/home.mdx` + `site.config.ts` | Hero name + bio paragraphs. |
| `/work` | `content/work/*.yml` | Date-range / org / role rows, sorted by `start` desc, "Present" when `end` missing. |
| `/posts` | `content/posts/*.mdx` filtered by `unlisted === false` | Grouped by year, sorted by `date` desc. |
| `/posts/[slug]` | `content/posts/<slug>.mdx` | Built for **every** post including unlisted; unlisted posts are merely excluded from the index and sitemap. |
| `/sitemap.xml` | `app/sitemap.ts` | `/`, `/work`, `/posts`, plus each post where `unlisted === false`. `lastModified` from the post's `date`. |
| `/404` | `app/not-found.tsx` | Wrapped in the standard `<Layout>` (nav + footer + column). Body: an `article-title` "Page not found" plus a `<BackLink>` to `/`. |

Throughout this doc the canonical predicate for "show this post in indexes" is `unlisted === false`. Use the schema field, not paraphrases.

## 5. Design system

### 5.1 Color tokens

CSS variables on `:root`, surfaced to Tailwind via `@theme inline` in `globals.css`. Adding dark mode means a second token set under `[data-theme="dark"]` plus a `next-themes` switcher; the tokens below are the only colors any component should reference.

```css
:root {
  --color-bg:              #F8F7F4;
  --color-text-heading:    #1F232A;
  --color-text-body:       #4A4F57;
  --color-text-muted:      #8E939B;
  --color-text-nav:        #6E737B;
  --color-line-divider:    #DFDDD6;
  --color-line-nav-slash:  #B4B8BE;
  --color-accent:          #2F5A82;
  --color-link-highlight:  #C3CFDE;  /* faded-blue bar behind inline body links — see §5.4 <MDLink> */
}
```

Tailwind utility names: `bg-bg`, `text-heading`, `text-body`, `text-muted`, `text-nav`, `border-divider`, `text-accent`, etc.

**Honest note on dark mode.** A neutral-ratio token like `--color-line-divider` will port directly. `--color-accent: #2F5A82` is tuned for a warm cream background and will need a different value (higher chroma, lower lightness contrast) on a dark background. Dark mode is therefore "redefine the eight tokens, do not touch components" — not "literally the same values flipped."

### 5.2 Typography

Single typeface: **Nunito Sans** (variable). All sizes/weights are tokens; never use raw `text-[18px]`. Tokens are applied via Tailwind `@theme`.

| Token | Size | Weight | Line-height | Style | Used for |
|---|---|---|---|---|---|
| `display`         | 52 | 700 | 1.18 | Roman    | First name |
| `display-italic`  | 52 | 700 | 1.18 | Italic   | Last name |
| `section`         | 52 | 400 | 1.18 | Roman    | `/work`, `/posts` page-section subheads |
| `heading`         | 34 | 400 | 1.20 | Roman    | Year group headers on `/posts` (2026, 2025) |
| `article-title`   | 36 | 600 | 1.25 | Roman    | Post page H1 |
| `h2`              | 24 | 600 | 1.30 | Roman    | In-article H2 |
| `title`           | 20 | 600 | 1.35 | Roman    | Work entry org; posts-list post title |
| `lede`            | 19 | 400 | 1.60 | Roman    | Post lede paragraph |
| `blockquote`      | 18 | 400 | 1.65 | Italic   | Blockquotes |
| `body`            | 16 | 400 | 1.65 | Roman    | Body copy |
| `nav`             | 16 | 400 | 1.20 | Roman    | Nav links |
| `nav-active`      | 16 | 600 | 1.20 | Roman    | Active nav link (also colored accent) |
| `caption`         | 15 | 400 | 1.40 | Roman    | Figure captions, footer contact labels, back-link text |
| `excerpt`         | 15 | 400 | 1.55 | Roman    | Posts-list excerpt body (the post's `lede` rendered on `/posts`) |
| `role`            | 15 | 400 | 1.40 | Italic   | Work entry role line |
| `meta`            | 14 | 400 | 1.50 | Italic   | Dates and eyebrows (article header, posts-list dates, work date ranges). Default color is `--color-accent` — every Meta usage in the Figma is italic accent blue. |

### 5.3 Layout

- **Column**: 680px max content width, centered horizontally. Hero sits a fixed distance from the top of the layout — value comes from Figma; if the spec and Figma disagree, Figma wins.
- **Nav (desktop)**: lives inside the same 680px column wrapper, anchored to the right edge of the column via flex/grid (`justify-self: end`). It does **not** use a viewport-relative `right: Npx` offset. Items: `home / work / posts`. Slash separators use `--color-line-nav-slash`. Active link is `nav-active` weight + `--color-accent` color.
- **Hero name**: stacked "Marcus" (display, accent) + "*Alenius*" (display-italic, heading color). On `/work` and `/posts`, a third line `/work` or `/posts` appears beneath in `section` size, muted color.
- **Footer**: 1px divider in `--color-line-divider`, then 26px gap, then a centered flex row of contact items (icon + label) — email, GitHub, LinkedIn — sourced from `siteConfig.contacts`. On desktop the row fits on one line; on narrow viewports it **wraps** (one item per line or two-up depending on width) rather than stacking unconditionally. Inter-item gap: 28px. Icon-to-label gap: 7px. Contact labels use the `caption` token in `--color-text-muted`; icons render at `size={15}`. The footer is identical across every page.
- **Version tag**: rendered on the **home page only** (not in the shared `<Footer>`). Sits as the **last paragraph** of the home body content — directly after the final body paragraph, inheriting the same 22px paragraph gap, left-aligned with the prose (see §8 for exact styling).
- **Mobile**: single breakpoint at 640px. Below it, the column becomes fluid (`min(680px, 100% - 32px)` of viewport). Above 640px the column is exactly 680px (the design has no intermediate width). Nav stays right-aligned at the top of the column (same `justify-self: end` rule as desktop — the Figma `Home / Phone` frame uses `flex justify-end` on the nav). Footer items wrap as needed (see above). The Figma `Home / Phone`, `Work / Phone`, `Posts / Phone`, `Post / Phone` frames are authoritative for the mobile layout.

### 5.4 Components

- **`<Nav />`** — reads `siteConfig.nav`, highlights active route via `usePathname()`.
- **`<Title />`** — renders first/last name from `siteConfig.name`; optional `subhead` prop for `/work` etc.
- **`<Footer />`** — renders contact icon rows from `siteConfig.contacts` plus the version tag. The `kind` field on each contact is a discriminated union (see §6.1) so the component imports its icon directly from the config entry, with no internal switch statement. Phosphor icons render at `size={15}`.
- **`<Layout />`** — wraps every page; holds the column, top spacing, nav, and footer.
- **`<BackLink />`** — `← back to posts` link at the top of an article. Uses Phosphor `ArrowLeft` at `size={12}` + `caption`-sized text in `--color-text-muted`. Icon-to-label gap is 8px.
- **`<ArticleHeader />`** — renders, top-to-bottom with 16px gap between each: a `meta`-token eyebrow line in `--color-accent` formatted as `MMM D, YYYY · X min read`, then `article-title` from `title` in `--color-text-heading`, then `lede` from `lede` in `--color-text-body`. Used at the top of every article page.
- **`<Blockquote />`** — left **3px** bar in `--color-accent`, full-height of the quote; text in `blockquote` token (18/1.65 italic) and `--color-text-heading` (not body). Bar-to-text gap 24px. Overrides default `blockquote` in MDX.
- **`<Figure />`** — wraps a full-column image in a semantic `<figure>` element: image at 100% column width, no border, square corners, no shadow; optional `<Caption>` rendered as `<figcaption>` below in `caption` token, color `--color-text-muted`, **center-aligned**, 14px below the image. Used as `<Figure src="..." alt="..."><Caption>...</Caption></Figure>` inside MDX. *(The Figma shows the placeholder rectangle with a `#EDEAE3` fill + `#DFDDD6` border — that styling is mock-only; real images render borderless on the page background.)*
- **`<Caption />`** — small muted figure caption (`caption` token, `--color-text-muted`, centered when inside a `<Figure>`). Auto-injected into MDX.
- **`<TableOfContents />`** — scroll-spy sidebar. Only rendered when frontmatter sets `maxTocLevel` (the same value is passed to the component as the `maxLevel` prop internally; authors only see `maxTocLevel`). Active item driven by `IntersectionObserver` on headings. Heading IDs are added by `rehype-slug` (§7.2).
- **`<MDLink />`** — overrides `<a>` in MDX. Rendered as **SemiBold text in `--color-text-heading`** (not body, not accent — the link is *darker* than surrounding prose, plus heavier weight) with a faded-blue **highlighter bar** in `--color-link-highlight` (6 px tall, behind the text). The link text is rendered at **tight line-height (`line-height: 1`)** so the text's bounding box matches the visible glyph height — the bar geometry below is described against that tight box. **Highlight geometry:**
  - **Left edge:** 1 px to the left of the text.
  - **Right edge:** 1 px to the right of the text (internal) or 1 px to the right of the trailing `↗` glyph (external).
  - **Vertical position:** within the 16-px tight text box, the bar sits at **`y=12, height=6`** (so the bar occupies the rows `y=12` through `y=17`, with its bottom ~2 px below the box bottom). The bar sits low under the text, reading as an underline bar rather than a highlighter swipe across the glyphs.

  Implementable as a single `background: linear-gradient` or a multi-shadow `box-shadow` recipe on the link element with negative inline padding for the overhang, or by absolutely-positioning a `::before` pseudo-element behind the text.

  **Routing:** Internal links (same origin or `/`-prefixed) → `next/link`. External links → new tab, `rel="noopener noreferrer"`, plus a trailing `↗` glyph (Phosphor `ArrowUpRight` **bold** path, inlined as an SVG with the viewBox cropped to the path bounds so visible size maps 1:1 — rendered at **11×11 px**), **3 px gap** between text and glyph, vertically centered with the text. No hover state is specified in the Figma — leave defaults until designed.
- **`<MDXContent />`** — renders Velite's compiled MDX. Signature: `<MDXContent code={post.body} />`. The component imports the `mdxComponents` map from `@/components/mdx` (§7.1) — callers never pass it themselves.

Footnotes use GFM syntax (`[^1]` in the markdown, `[^1]: ...` for the reference) via `remark-gfm`. Rendering is styled via the `<MDLink>` override and CSS — there are no `<Footnote>` / `<FootnoteRef>` custom components. Smooth-scroll on click and a brief highlight animation on landing are implemented as a small client island attached to the footnote anchor elements.

## 6. Content model

### 6.1 Site config — `site.config.ts`

```ts
import { PaperPlaneTilt, GithubLogo, LinkedinLogo, type Icon } from "@phosphor-icons/react";

type Contact = {
  kind: "email" | "github" | "linkedin";
  label: string;
  href: string;
  icon: Icon;
};

export const siteConfig = {
  name: { first: "Marcus", last: "Alenius" },
  url: "https://alenius.io",
  description: "Personal site of Marcus Alenius.",
  nav: [
    { label: "home",  href: "/" },
    { label: "work",  href: "/work" },
    { label: "posts", href: "/posts" },
  ],
  contacts: [
    { kind: "email",    label: "marcus.alenius@gmail.com", href: "mailto:marcus.alenius@gmail.com",          icon: PaperPlaneTilt },
    { kind: "github",   label: "marcusalenius",            href: "https://github.com/marcusalenius",         icon: GithubLogo     },
    { kind: "linkedin", label: "marcusalenius",            href: "https://linkedin.com/in/marcusalenius",    icon: LinkedinLogo   },
  ] satisfies Contact[],
  ogImage: "/og/default.png",
} as const;
```

The icon component travels with the contact entry, so `<Footer>` just renders `<contact.icon />` without a mapping table.

### 6.2 Velite collections — `velite.config.ts`

```ts
import { defineCollection, defineConfig, s } from "velite";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkMath from "remark-math";
import remarkWikiLink from "remark-wiki-link";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title:        s.string(),
    lede:         s.string(),
    date:         s.isodate(),                            // date-only, no time component
    readingTime:  s.number().int().positive().optional(), // minutes; computed from body if omitted (see §7.3)
    image:        s.image().optional(),                   // OG image override — validated to exist on disk
    unlisted:     s.boolean().default(false),
    maxTocLevel:  s.number().int().min(1).max(6).optional(),
    slug:         s.slug("posts"),                        // filename without extension
    body:         s.mdx(),
  }),
});

const work = defineCollection({
  name: "Work",
  pattern: "work/*.yml",
  schema: s.object({
    organization: s.string(),
    role:         s.string(),
    start:        s.isodate(),
    end:          s.isodate().optional(),                 // omitted → "Present"
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
  output: { data: ".velite", assets: "public/static", base: "/static/", clean: true },
  collections: { posts, work, pages },
  mdx: {
    remarkPlugins: [
      remarkGfm,
      remarkSmartypants,
      remarkMath,
      [remarkWikiLink, { hrefTemplate: (l: string) => `/${l}`, aliasDivider: "|" }],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypePrettyCode, { theme: { light: "github-light", dark: "github-light" } }],
    ],
  },
});
```

`s.slug("posts")` derives the slug from the filename (`my-post.mdx` → `my-post`). `s.image()` validates the path resolves to an asset Velite can ingest; broken OG image references fail the build, not the live site. The rehype-pretty-code theme uses the object form (light+dark both set to `github-light`) so adding a dark theme later is a one-line change instead of a plugin reconfiguration.

Exported names (Velite convention): `posts`, `work`, `pages`. Import sites use `import { posts } from "#site/content"` (Velite's default virtual module alias).

**Schema-change policy.** Adding a required field to an existing collection is intentional and will fail the build until every record is updated. This is fine for a personal site — schema-driven authoring is the point. There is no migration framework.

### 6.3 Directory layout

```
content/
├── posts/
│   ├── attention.mdx
│   └── lorem-ipsum.mdx
├── work/
│   ├── sutter-hill.yml
│   ├── aws-2025.yml
│   ├── 15112-head-ta.yml
│   ├── lti-research.yml
│   ├── 15112-ta.yml
│   └── hcii-research.yml
└── pages/
    └── home.mdx

public/
├── images/         # MDX-referenced images
├── og/             # OG images (default + per-post)
└── CNAME           # apex-domain pointer for GitHub Pages
```

### 6.4 Sort & group rules

All date math uses UTC to avoid timezone-dependent sorting:

- **Posts index**: filter `unlisted === false`, sort by `new Date(date).getTime()` desc, group by `new Date(date).getUTCFullYear()`. Year header uses the `heading` token (34/400) in `--color-text-muted`, 18px above its first post row, 44px below the previous year's last row. Each post row is a two-column layout: left column (`width: 95px`, gap 28px) is a `meta`-token date in `--color-accent` formatted as `MMM D` (no year — the year comes from the group header); right column is a `title`-token post title in `--color-text-heading`, then a 9px gap, then the post's `lede` rendered in the `excerpt` token (15/1.55) in `--color-text-body`.
- **Work index**: sort by `new Date(start).getTime()` desc. Each row is a two-column layout (`width: 100px` for the date column, 28px gap, flex-grow for the detail column). Date column renders the range as **two explicitly stacked lines** in the `meta` token + `--color-accent`: line 1 is `MMM YYYY –`, line 2 is `Present` (when `end` is missing) or `MMM YYYY` (when `end` is set). The stacking is rendered as two separate text nodes / `<div>`s — do **not** rely on column-width word-wrap, which would visually approximate the same layout but break if the column ever resizes. Detail column renders the organization in the `title` token + `--color-text-heading` on line 1 and the role in the `role` token (15/1.4 italic) + `--color-text-body` on line 2, with a 5px gap between them. Inter-entry gap: 30px. Month/year formatted via `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })`.

## 7. Publishing pipeline

### 7.1 MDX components

Velite compiles MDX to a JS render function. The page passes component overrides at render time:

```tsx
// components/mdx/index.ts
import { Blockquote } from "@/components/Blockquote";
import { MDLink }     from "@/components/MDLink";
import { Caption }    from "@/components/Caption";
import { Figure }     from "@/components/Figure";

export const mdxComponents = {
  a:          MDLink,
  blockquote: Blockquote,
  Caption,
  Figure,
} as const;
```

```tsx
// components/MDXContent.tsx
import { mdxComponents } from "@/components/mdx";

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code); // tiny helper that evals Velite's emitted module
  return <Component components={mdxComponents} />;
}
```

`<Figure>` and `<Caption>` are the authored MDX components — used as `<Figure src="..." alt="..."><Caption>Figure 1: …</Caption></Figure>` inside posts. Footnotes, links, blockquotes, and code blocks all flow through plugin output and the override map; authors don't import anything else.

### 7.2 Plugin stack (all in `velite.config.ts`)

| Phase | Plugin | Purpose |
|---|---|---|
| remark | `remark-gfm`                | GFM tables, task lists, **footnotes** (`[^1]` syntax) |
| remark | `remark-smartypants`        | Smart quotes, em-dashes |
| remark | `remark-math`               | Parse `$...$` and `$$...$$` |
| remark | `remark-wiki-link`          | `[[Other Post]]` → `/other-post` |
| rehype | `rehype-slug`               | Stable IDs on headings (needed for TOC + footnote anchors) |
| rehype | `rehype-katex`              | Render math from `remark-math` output |
| rehype | `rehype-pretty-code` (Shiki) | Syntax highlighting; theme object `{ light: "github-light", dark: "github-light" }` |

KaTeX CSS is imported once in `app/layout.tsx`.

### 7.3 Frontmatter knobs (per post)

| Field | Effect |
|---|---|
| `title`, `lede`, `date` | Required. Drive page header + OG metadata. Empty `title` is a schema error. |
| `image` | Overrides default OG image. Path under `/public/og/`. Validated to exist. |
| `unlisted: true` | Build the page, exclude from index and sitemap. |
| `maxTocLevel: n` | Render the right-side TOC, showing headings up to depth `n` (1–6). Default: no TOC. |
| `readingTime` | Override the computed minutes. Otherwise estimated from body word count at build time at **225 wpm**, rounded up to the nearest minute. The same constant is used in dev and CI. |

The `hideTitle` knob from the previous draft is removed. The `<h1>` is always rendered from `title`; if a post needs a custom hero, it uses a dedicated `<Hero>` MDX component (added later, out of scope for v1) so styling stays centralized. `title` cannot be empty.

### 7.4 Article page anatomy

Top to bottom:

1. Nav.
2. `<BackLink>` — `← back to posts`.
3. `<ArticleHeader>` — eyebrow `MMM D, YYYY · X min read` in `meta` token + `--color-accent`, then `title` rendered in `article-title`, then `lede` rendered in `lede`.
4. Body (rendered MDX).
5. Footnotes (rendered inline at the bottom by `remark-gfm`).
6. Optional TOC sidebar (right-side, sticky, `IntersectionObserver` active highlight).
7. Footer.

The posts-list date format is `MMM D` (no year — year comes from the group header). The article-header date format is `MMM D, YYYY`. Both via `Intl.DateTimeFormat("en-US", { ... , timeZone: "UTC" })`.

## 8. SEO, OG, sitemap, footer version

- **Metadata**: each page exports `generateMetadata` using `siteConfig` + frontmatter (title, description = lede, OG image, canonical URL built from `siteConfig.url`).
- **OG images**: per-post `image` from frontmatter (path under `/public/og/`), fallback to `siteConfig.ogImage`. Dynamic OG via `ImageResponse` is **deferred** — under `output: 'export'` it requires build-time pre-generation rather than the edge-runtime pattern most docs show. Treated as a future addition with its own design.
- **Sitemap** — `app/sitemap.ts` returns `MetadataRoute.Sitemap` over `/`, `/work`, `/posts`, and each post where `unlisted === false`. `lastModified` is the post's `date` field.
- **Version tag** — `process.env.NEXT_PUBLIC_COMMIT_SHA` and `NEXT_PUBLIC_COMMIT_DATE` injected by CI; rendered as `<sha> (<YYYY.MM.DD>)` (e.g. `a3f1c2d (2026.01.15)`) as a **standard external link** to the GitHub commit (`https://github.com/<repo>/commit/<sha>`) — same `<MDLink>` rules as §5.4, with no overrides (16px SemiBold heading-color text, 6px faded-blue highlight bar at y=12, 11×11px trailing `ArrowUpRight` bold-weight glyph (inlined, viewBox cropped to path bounds)). **Placement**: appears on the **home page only**, rendered as the last paragraph of the home body content (sibling of the body paragraphs, sharing their 22px paragraph gap), **left-aligned** with the prose. Not rendered on `/work`, `/posts`, or `/posts/[slug]`. Dev fallback: `DEV (<date the dev server started>)`, rendered as plain text (not a link).

## 9. Static export + deployment

- `next.config.mjs` sets `output: "export"`, `images: { unoptimized: true }`, and `trailingSlash: true` (required for clean GitHub Pages routing under static export).
- No `basePath`. The site lives at the apex `alenius.io`, configured via the `CNAME` file in `public/`.
- GitHub Actions workflow (`.github/workflows/nextjs.yml`):
  - `npm ci`, then `npm run build` (which chains `velite build && next build`).
  - Set `NEXT_PUBLIC_COMMIT_SHA=$(git rev-parse --short HEAD)` and `NEXT_PUBLIC_COMMIT_DATE=$(git log -1 --format=%cd --date=format:%Y.%m.%d)` into env **before** `next build`.
  - Upload `/out` as a Pages artifact; deploy via `actions/deploy-pages@v4`.
- Dev script runs Velite in watch mode alongside Next: `"dev": "concurrently -k \"velite --watch\" \"next dev\""`. The `#site/content` virtual module re-emits on content change and Next picks it up via fast refresh.

## 10. Repository structure

```
personal-website-2026/
├── app/
│   ├── layout.tsx              # global <Layout/>, font, KaTeX CSS
│   ├── page.tsx                # Home — renders content/pages/home.mdx
│   ├── work/page.tsx
│   ├── posts/
│   │   ├── page.tsx            # index, grouped by year
│   │   └── [slug]/page.tsx     # article; generateStaticParams from posts collection
│   ├── not-found.tsx           # styled 404
│   ├── sitemap.ts
│   └── globals.css             # token CSS variables + @theme + base styles
├── components/
│   ├── Nav.tsx
│   ├── Title.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── BackLink.tsx
│   ├── ArticleHeader.tsx
│   ├── Blockquote.tsx
│   ├── MDLink.tsx
│   ├── Figure.tsx
│   ├── Caption.tsx
│   ├── TableOfContents.tsx
│   ├── MDXContent.tsx          # renders Velite-compiled MDX
│   └── mdx/
│       └── index.ts            # exports the mdxComponents map
├── content/
│   ├── posts/*.mdx
│   ├── work/*.yml
│   └── pages/home.mdx
├── public/
│   ├── images/
│   ├── og/
│   └── CNAME
├── site.config.ts
├── velite.config.ts
├── next.config.mjs
├── tsconfig.json
└── .github/workflows/nextjs.yml
```

No `tailwind.config.ts` — Tailwind v4 reads its theme from `@theme` in `globals.css`. No `mdx-components.tsx` — MDX is owned by Velite (§3).

## 11. Out of scope (deferred)

- Dark mode visual styling + toggle (token set is structured for this; components are not).
- Tags / categories / search.
- Newsletter, comments, analytics.
- Per-post custom CSS (`customStyles`).
- Auto-generated OG images via `ImageResponse` — viable under static export with build-time pre-generation; lands later without schema changes.
- A separate `/colophon` or design-system page on the live site.
- `<Hero>` MDX component for posts that want a custom title treatment.

## 12. Authoring loop (what publishing feels like)

1. Create `content/posts/my-new-post.mdx` with frontmatter (`title`, `lede`, `date`).
2. Write prose; use `[^1]` for footnotes, `<Caption>` for figures, `$...$` or `$$...$$` for math, code fences for highlighted code, `[[Other Post]]` for wiki-links.
3. `npm run dev` — Velite watches `content/`, recompiles on save, Next hot-reloads.
4. `git push origin main` — Actions builds and deploys.
5. The post appears on `/posts` (under its year), in `/sitemap.xml`, and at `/posts/my-new-post`. Set `unlisted: true` to ship the URL without listing it.