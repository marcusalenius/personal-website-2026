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

The version tag on the home page is fed by env vars set in CI at build time:
`NEXT_PUBLIC_COMMIT_SHA` (`git rev-parse --short HEAD`) and
`NEXT_PUBLIC_COMMIT_DATE` (`git log -1 --date=format:%Y.%m.%d`). Locally (no env
vars) it falls back to `DEV (<date>)`.

### One-time GitHub setup (manual)

1. **Pages source**: repo **Settings → Pages → Build and deployment → Source =
   GitHub Actions**.
2. **Custom domain**: `public/CNAME` already contains `alenius.io`, which sets the
   Pages custom domain on first deploy. In **Settings → Pages**, confirm the
   domain and enable **Enforce HTTPS** once the certificate is issued.
3. **DNS** for the apex domain (`alenius.io`) — add `A` records pointing at
   GitHub Pages, per
   [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain):

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   (Optionally add the matching `AAAA` records for IPv6.) Verify the apex domain
   in **Settings → Pages → Verified domains** before pointing DNS in production.
