/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,

  // NOTE: Do not add a `redirects()` here. With `output: "export"` there is no
  // Next server to resolve them, and our GitHub Pages host can't run server
  // redirect rules either — so `redirects()` is silently ignored. URL
  // redirects are handled client-side via the 404.html catch-all; add new ones
  // to the map in lib/redirects.ts. See that file for the full rationale.
};

export default nextConfig;
