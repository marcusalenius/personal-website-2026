// Catch-all redirect map for paths that don't exist as real pages.
//
// Why not Next's built-in `redirects()` (next.config.mjs)?
//   `redirects()` is resolved by the Next server at request time — it emits a
//   real HTTP 308/307 response. This site is `output: "export"` (a static
//   bundle) hosted on GitHub Pages, where there is no Next server in the
//   request path. Static export silently ignores `redirects()` entirely, so it
//   would do nothing here. The same goes for `_redirects`/`netlify.toml`-style
//   rules: those are read by Netlify/Vercel/Cloudflare, not by GitHub Pages.
//
// What GitHub Pages *does* give us: it serves 404.html for any path it can't
// find on disk. So we do the redirect client-side — the script embedded on the
// 404 page (see app/not-found.tsx) looks the attempted path up in this map and,
// on a match, rewrites the browser to the destination. The trade-off is that
// the response is an HTTP 404 with a brief JS hop rather than a true 3xx; for a
// handful of vanity/legacy URLs that's an acceptable cost for staying on a
// zero-server static host.
//
// Keys and values are root-relative paths. Keys are matched with and without a
// trailing slash, so write them however reads cleanest.
export const redirects: Record<string, string> = {
  "/15418-project": "/posts/15418-project/",
  "/colophon": "/posts/colophon/",
};
