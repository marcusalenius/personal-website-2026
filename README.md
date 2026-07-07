# alenius.io

Personal website for Marcus Alenius. Statically exported Next.js 15 site driven
by typed [Velite](https://velite.js.org) content collections, deployed to GitHub
Pages at the apex domain `alenius.io`.

## Develop

```bash
npm install
npm run dev      # Velite (watch) + Next dev, concurrently
```

- `npm run velite` — build content collections into `.velite/`
- `npm run build` — `velite build && next build` → static export to `out/`
- `npm run lint` — Next/ESLint

Content lives in `content/` (`pages/`, `posts/*.mdx`, `work/*.yml`). Adding a post
is one `.mdx` file with `title`, `lede`, `date` frontmatter.

## Deploy

Pushing to `main` runs `.github/workflows/nextjs.yml`, which builds the static
export and publishes `out/` to GitHub Pages via `actions/deploy-pages`.