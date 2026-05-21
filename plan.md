# Build plan — alenius.io (personal website 2026)

## Context

Greenfield repo (`personal-website-2026/` contains only `spec.md` and `plan.md`). The goal is a statically-exported Next.js 15 site at `alenius.io`, deployed to GitHub Pages, driven by typed Velite content collections. The spec (`spec.md`) is exhaustive — it dictates tech stack, design tokens, components, content model, routes, and deployment. The [Figma file](https://www.figma.com/design/OoNCGQ9ESmLNYua1obJVj5/New-Website) (`fileKey: OoNCGQ9ESmLNYua1obJVj5`) is authoritative for visuals; its variables and frame structure were spot-checked and match the spec.

User selections that scope this plan: **npm**, **chrome → pages → MDX pipeline → deploy** sequencing, **seed content** matching the Figma (2 posts, 6 work entries), **deploy last**.

Nothing about the design needs re-deciding — the work is to execute the spec in a sequence that produces visible progress and catches integration risks early.

## Milestones

Each milestone is a runnable artifact. Verify in the browser at the dev server before moving on.

### M1 — Bootstrap

Goal: `npm run dev` shows a blank styled page on `localhost:3000`.

- `package.json` with deps: `next@15`, `react@19`, `react-dom@19`, `typescript`, `tailwindcss@4`, `@tailwindcss/postcss`, `velite`, `concurrently`, `@phosphor-icons/react`, `remark-gfm`, `remark-smartypants`, `remark-math`, `remark-wiki-link`, `rehype-slug`, `rehype-katex`, `rehype-pretty-code`, `shiki`, `katex`. Dev: `eslint`, `eslint-config-next`, `prettier`, `@types/*`.
- `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `paths` for `@/*` and `#site/content` (Velite virtual module — alias `./.velite`).
- `next.config.mjs`: leave `output: "export"` etc. **for M11** — bare config in M1 so dev server runs.
- `app/layout.tsx`: `next/font/google` loading Nunito Sans variable (regular/italic/semibold/bold/bold-italic), `katex/dist/katex.min.css` import, `<html lang="en">` with body class `bg-bg text-body`.
- `app/page.tsx`: placeholder "hello".
- `app/globals.css`: Tailwind v4 directives (`@import "tailwindcss"`), `:root` token block (all 9 colors from §5.1), `@theme inline` block mapping tokens → Tailwind utilities (`--color-bg`, `--color-text-heading`, etc.) and registering all 16 type tokens as font utilities. No `tailwind.config.ts`.
- Scripts: `"dev": "next dev"`, `"build": "next build"`, `"lint": "next lint"`. Velite added in M4.

Critical files: `package.json`, `tsconfig.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.

### M2 — Chrome (Layout, Nav, Title, Footer, BackLink)

Goal: the persistent page furniture renders pixel-aligned with the Figma `Home` frame.

- `site.config.ts` — exact shape in spec §6.1 (name, url, nav, contacts with embedded Phosphor `icon` field, ogImage).
- `components/Layout.tsx` — 680px max column centered, fluid `min(680px, 100% - 32px)` under 640px breakpoint. Top spacing per Figma. Slot: `children`. Holds `<Nav>`, content slot, `<Footer>`.
- `components/Nav.tsx` — reads `siteConfig.nav`, uses `usePathname()`, active link gets `nav-active` + `text-accent`. Slash separators in `text-line-nav-slash`. `justify-self: end` inside the column wrapper (per spec §5.3, not viewport-relative).
- `components/Title.tsx` — stacked first (display, accent) + last (display-italic, heading). Optional `subhead` prop (`/work`, `/posts`) in `section` token + muted.
- `components/Footer.tsx` — 1px `border-divider` top, 26px gap, centered flex row of `contact.icon` (size 15) + label (`caption`/muted), 28px inter-item / 7px icon-to-label gap, `flex-wrap` under 640px. Plus the version-tag *paragraph* is NOT in the footer — it lives in home body content (see M5).
- `components/BackLink.tsx` — Phosphor `ArrowLeft` size 12, `caption`/muted, 8px gap.

Verify against `Home` (2:2), `Work` (2:18), `Posts` (2:68) and the Phone variants for mobile spacing.

### M3 — Content pipeline (Velite)

Goal: `npm run velite` produces `.velite/` with typed collections, and `#site/content` resolves in TS.

- `velite.config.ts` — exact shape in spec §6.2 (three collections: `posts`, `work`, `pages`; remark + rehype plugin stack from §7.2; rehype-pretty-code theme as `{ light: "github-light", dark: "github-light" }`; output `data: ".velite"`, `assets: "public/static"`, `base: "/static/"`).
- `content/` skeleton: `pages/home.mdx` (frontmatter `slug` only + body), `posts/.gitkeep`, `work/.gitkeep`.
- `npm` scripts: replace `"dev"` with `"dev": "concurrently -k \"velite --watch\" \"next dev\""`, add `"build": "velite build && next build"`.
- `next.config.mjs` additions: nothing yet, but Velite docs recommend a small webpack hook to ignore `.velite` from RSC dir traversal — add only if Next complains.
- `tsconfig.json`: confirm `#site/content` path alias points to `./.velite` so `import { posts, work, pages } from "#site/content"` types correctly.

Risk: Velite + Next 15 App Router integration. If the virtual module export style doesn't satisfy `noUncheckedIndexedAccess`, add a thin re-export `lib/content.ts` that narrows types.

### M4 — MDX render plumbing

Goal: a page can render compiled MDX with custom component overrides.

- `components/mdx/index.ts` — `mdxComponents` map exactly as spec §7.1 (`a`, `blockquote`, `Caption`, `Figure`).
- `components/MDXContent.tsx` — wraps a tiny `useMDXComponent(code: string)` helper that `new Function("return " + code)()` on Velite's emitted module and yields the default export component. Calls it with `components={mdxComponents}`.
- Stub the four MDX components so MDXContent compiles: `Blockquote.tsx`, `MDLink.tsx`, `Figure.tsx`, `Caption.tsx` (full implementations in M5/M8).

### M5 — Home page

Goal: `/` matches Figma frame `Home` (2:2) including the version tag.

- `content/pages/home.mdx` — three body paragraphs (placeholder copy in Figma's voice) + the version-tag paragraph rendered via a custom link at the end. The version tag is **content**, not chrome — it's the last `<p>` of `home.mdx`, using `<MDLink>` rules.
- `app/page.tsx` — loads `pages.home` via `#site/content`, renders `<Layout><Title /> <MDXContent code={home.body} /></Layout>`.
- Version-tag rendering: a small server component reads `process.env.NEXT_PUBLIC_COMMIT_SHA` and `NEXT_PUBLIC_COMMIT_DATE`, formats as `<sha> (<YYYY.MM.DD>)` and emits an `<MDLink>` to `https://github.com/<repo>/commit/<sha>`. Dev fallback: plain `DEV (<server start date>)` text. Author this as an MDX component (e.g. `<VersionTag />`) referenced inside `home.mdx` so it lives in the prose flow.
- Add `<VersionTag>` to the `mdxComponents` map.

Verify: dev server, /, against Figma. Paragraph spacing 22px, version tag left-aligned with prose.

### M6 — `/work`

Goal: `/work` matches Figma frame `Work` (2:18) with all six entries.

- `content/work/*.yml` — six files: `sutter-hill.yml`, `aws-2025.yml`, `15112-head-ta.yml`, `lti-research.yml`, `15112-ta.yml`, `hcii-research.yml`. Each has `organization`, `role`, `start`, optional `end`. Dates pulled from the Figma date ranges.
- `app/work/page.tsx` — sort by `start` desc, render two-column rows (100px date col, 28px gap, flex-grow detail col). Date col is **two explicitly stacked `<div>`s** in `meta`/accent: `MMM YYYY –` then `Present` or `MMM YYYY`. Detail: `title`/heading org + 5px gap + `role` italic body. Inter-entry 30px.
- `Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })` for formatting — extract to `lib/date.ts` so posts page can reuse.

### M7 — `/posts` index

Goal: `/posts` matches Figma frame `Posts` (2:68).

- Two seed posts in `content/posts/`:
  - `lorem-ipsum.mdx` — title + lorem body, dated 2026 to match Figma "Year 2026".
  - `attention.mdx` — "Attention From Scratch: Developing Intuitions for Transformers" + body exercising every MDX feature (footnotes, math, code fence with language, wiki-link `[[lorem-ipsum]]`, blockquote, `<Figure>` w/ `<Caption>`). Dated 2025. Sets `maxTocLevel: 2` to exercise the TOC code path.
- `app/posts/page.tsx` — filter `unlisted === false`, sort by `date` desc, group by `getUTCFullYear()`. Year header `heading`/muted, 44px above (except first) / 18px below. Each row: 95px date col (`MMM D` in meta/accent, no year), 28px gap, detail col with `title`/heading + 9px gap + `excerpt` token (15/1.55) /body using the post's `lede`.

### M8 — Article page + MDX components

Goal: `/posts/[slug]` matches Figma frame `Post` (25:7), with every MDX feature working.

- `app/posts/[slug]/page.tsx` with `generateStaticParams` over all posts (including unlisted). Layout: `<Nav>` → `<BackLink href="/posts" />` → `<ArticleHeader>` → `<MDXContent>` → footer.
- `components/ArticleHeader.tsx` — eyebrow `meta`/accent (`MMM D, YYYY · X min read`), 16px gap, `article-title`/heading from `title`, 16px gap, `lede`/body from `lede`.
- `components/MDLink.tsx` — full implementation per spec §5.4. SemiBold heading-color text at `line-height: 1`, faded-blue highlight bar (6px tall, sits y=9 in the 16px tight box) implemented as a CSS `linear-gradient` background-image with the bar geometry. Internal vs external detection: same origin or `/`-prefixed → `next/link`; else `<a target="_blank" rel="noopener noreferrer">` + trailing `ArrowUpRight` (weight `bold`, size 10, 5px gap). Highlight overhangs 1px each side (and 1px past the `↗` for external).
- `components/Blockquote.tsx` — 3px accent left bar, `blockquote` token italic in heading color, 24px bar-to-text gap.
- `components/Figure.tsx`, `components/Caption.tsx` — full-width image (Next `<Image unoptimized />` since `images.unoptimized` for export), borderless on page bg, optional `<Caption>` as `<figcaption>` (caption token, muted, centered, 14px below).
- Reading-time util: `lib/reading-time.ts` — 225 wpm, ceil. Used in `<ArticleHeader>` when `post.readingTime` is unset.
- Footnotes are produced by `remark-gfm` and styled via the `<MDLink>` override + CSS in `globals.css` (no custom Footnote component).

### M9 — TOC + footnote scroll-spy

Goal: posts with `maxTocLevel` get a sticky right-side TOC; footnote-anchor jumps smooth-scroll and flash.

- `components/TableOfContents.tsx` — client component, walks `document.querySelectorAll("h2, h3, ...")` filtered by `maxLevel`, `IntersectionObserver` sets active id. Sticky on the right, hidden under 640px (or below a wider breakpoint if 680px column + TOC overflows — verify against Figma's `Post` frame; spec only mandates "right-side, sticky").
- Footnote scroll: tiny client island attached to `a[href^="#fn"]` / `a[href^="#fnref"]` — `e.preventDefault(); scrollIntoView({ behavior: "smooth" })` and a transient CSS `:target`-driven highlight class.

### M10 — Metadata, sitemap, 404

- Each route exports `generateMetadata` returning title/description/OG image/canonical from `siteConfig` + frontmatter. Per-post `image` falls back to `siteConfig.ogImage`.
- `app/sitemap.ts` returns `MetadataRoute.Sitemap` over `/`, `/work`, `/posts`, and each `unlisted === false` post (lastModified = post.date).
- `app/not-found.tsx` — wrapped in `<Layout>`, `article-title` "Page not found", `<BackLink href="/">back to home</BackLink>`.
- Add `public/og/default.png` (placeholder OK for v1).

### M11 — Static export + GitHub Pages deploy

- `next.config.mjs`: `output: "export"`, `images: { unoptimized: true }`, `trailingSlash: true`.
- `public/CNAME` containing `alenius.io`.
- `.github/workflows/nextjs.yml`:
  - Triggers: push to `main`, manual.
  - Steps: setup Node 20, `npm ci`, set env `NEXT_PUBLIC_COMMIT_SHA=$(git rev-parse --short HEAD)` and `NEXT_PUBLIC_COMMIT_DATE=$(git log -1 --format=%cd --date=format:%Y.%m.%d)` **before** `npm run build`, upload `./out` via `actions/upload-pages-artifact@v3`, deploy via `actions/deploy-pages@v4`.
  - Permissions: `pages: write`, `id-token: write`.
- Repo settings (manual, document in README): GitHub Pages source = GitHub Actions; DNS records for apex `alenius.io` per GitHub docs (`A` records to GH IPs).

### M12 — Mobile pass

Goal: viewport ≤640 matches Figma `Home / Phone`, `Work / Phone`, `Posts / Phone`, `Post / Phone`.

- Confirm: column becomes `min(680px, 100% - 32px)`, nav still right-aligned via `justify-self: end`, footer items wrap, TOC hidden, image figures fill column. No new components — just verify CSS in M2/M6/M7/M8 already covers it; tweak only where the phone frames disagree.

## Critical files (consolidated)

- `package.json`, `tsconfig.json`, `next.config.mjs`, `velite.config.ts` — config
- `site.config.ts` — single source of truth for nav/contacts/url
- `app/globals.css` — color tokens + `@theme inline` + base styles
- `app/layout.tsx`, `app/page.tsx`, `app/work/page.tsx`, `app/posts/page.tsx`, `app/posts/[slug]/page.tsx`, `app/sitemap.ts`, `app/not-found.tsx`
- `components/`: `Layout.tsx`, `Nav.tsx`, `Title.tsx`, `Footer.tsx`, `BackLink.tsx`, `ArticleHeader.tsx`, `Blockquote.tsx`, `MDLink.tsx`, `Figure.tsx`, `Caption.tsx`, `TableOfContents.tsx`, `MDXContent.tsx`, `VersionTag.tsx`, `mdx/index.ts`
- `lib/date.ts`, `lib/reading-time.ts`
- `content/pages/home.mdx`, `content/work/*.yml` (6 files), `content/posts/*.mdx` (2 seeds)
- `public/CNAME`, `public/og/default.png`, `.github/workflows/nextjs.yml`

## Risks / things to watch

- **Velite ↔ Next 15 App Router types**: the `#site/content` virtual module must satisfy `strict` + `noUncheckedIndexedAccess`. Add a re-export shim if needed.
- **`useMDXComponent` helper**: Velite emits a runnable JS string; the eval pattern is well-known but must be a *client*-safe Function call (no `eval()`-flagged CSP issues) — we don't ship CSP in v1, so `new Function(...)` is fine.
- **`<MDLink>` highlight geometry**: 1px overhang + bar at y=9 within a 16px tight box is exacting. Implement as `background-image: linear-gradient(...)` with `background-size`/`background-position` rather than `box-shadow` so external-link overhang past the `↗` glyph is straightforward.
- **Tailwind v4 + Next 15**: v4 uses the `@tailwindcss/postcss` plugin and `@theme inline` in CSS — no `tailwind.config.ts`. Confirm `postcss.config.mjs` exists with the right plugin.
- **Concurrent `velite --watch` + `next dev`**: `concurrently -k` kills both on Ctrl-C. Velite must complete its initial build before Next starts importing — `concurrently` runs them in parallel; if Next races Velite on first boot, add `"prebuild"`-style ordering or use `concurrently --kill-others --raw` and accept a brief restart.
- **Static export route generation**: every dynamic route needs `generateStaticParams`. The post route does — confirm nothing else is dynamic.
- **CI env vars**: `NEXT_PUBLIC_*` must be set **at build time**, not runtime. The workflow's `env:` block on the build step is the only correct place.

## Verification

After each milestone, run `npm run dev`, open the relevant route, and compare against the corresponding Figma frame side-by-side.

End-to-end before declaring done:

1. `npm run build` — completes with no Velite or TS errors.
2. `npm run start` — serves `/out/` correctly (or `npx serve out`).
3. Walk `/`, `/work`, `/posts`, `/posts/attention`, `/posts/lorem-ipsum`, a `/posts/<missing>` (→ 404) — all match Figma.
4. View source on each page: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">` all present.
5. `curl localhost:3000/sitemap.xml` — `/`, `/work`, `/posts`, and the 2 listed post URLs present; unlisted excluded.
6. Resize to ≤640px — column goes fluid, footer wraps, nav stays right.
7. On `/posts/attention`: footnote click smooth-scrolls and highlights; TOC scroll-spy updates active item; KaTeX renders; `[[lorem-ipsum]]` resolves to `/lorem-ipsum`; code fence has Shiki highlighting.
8. Push to a test branch → confirm Actions builds `./out` and the deploy step succeeds (CNAME + DNS verified separately before pointing apex).
