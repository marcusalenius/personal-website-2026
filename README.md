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

### Images

The site sets `images: { unoptimized: true }`, so the committed file is exactly
what visitors download — process photos before committing them, don't ship raws.

```bash
npm run image -- <input> [output] [--width 1600] [--quality 82]
```

`scripts/optimize-image.mjs` auto-orients, resizes to a max long edge (1600px,
2x the content column), converts to sRGB, strips all metadata (EXIF/GPS, XMP,
and the HDR gain map), and re-encodes as a progressive mozjpeg. It prints the
final dimensions and a ready-to-paste `<Image>` tag. Omit `output` and the
optimized image takes the original's name (so the `<Image src>` path doesn't
change) while the raw file is kept alongside it as `<name>-unoptimized.<ext>`.
This is a one-off authoring step, so it is not part of `npm run build`.

## Deploy

Pushing to `main` runs `.github/workflows/nextjs.yml`, which builds the static
export and publishes `out/` to GitHub Pages via `actions/deploy-pages`.