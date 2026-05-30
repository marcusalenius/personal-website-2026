import { Layout } from "@/components/Layout";
import { BackLink } from "@/components/BackLink";
import { redirects } from "@/lib/redirects";

// Runs synchronously on the GitHub Pages 404.html before the page paints: if
// the attempted path matches a known redirect, rewrite the browser to its
// destination (replace, so the dead URL stays out of history). Trailing
// slashes are normalized on both sides so map keys can be written either way.
const redirectScript = `(function () {
  var map = ${JSON.stringify(redirects)};
  var norm = function (p) { return p.length > 1 ? p.replace(/\\/+$/, "") : p; };
  var dest = map[norm(window.location.pathname)];
  if (dest) window.location.replace(dest);
})();`;

export default function NotFound() {
  return (
    <Layout>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <div className="mt-[110px]">
        <h1 className="type-article-title text-heading">Page not found</h1>
        <div className="mt-[16px]">
          <BackLink href="/">back to home</BackLink>
        </div>
      </div>
    </Layout>
  );
}
