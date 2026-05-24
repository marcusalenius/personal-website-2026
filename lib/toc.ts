import katex from "katex";

export type TocItem = { id: string; html: string; level: number };

// velite's `s.toc()` shape: nested headings with the raw markdown title (inline
// math left as `$...$` source) and a slug url matching the heading's id.
type RawTocNode = { title: string; url: string; items?: RawTocNode[] };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Render a heading title to HTML, turning `$...$` inline math into KaTeX markup
// (server-side, so the spans ship in the SSR HTML and need no client JS) and
// escaping the surrounding text.
function renderTitle(title: string): string {
  return title
    .split(/(\$[^$]+\$)/g)
    .map((part) =>
      part.length > 2 && part.startsWith("$") && part.endsWith("$")
        ? katex.renderToString(part.slice(1, -1), { throwOnError: false })
        : escapeHtml(part),
    )
    .join("");
}

// Flatten velite's nested toc into a server-renderable list, keeping headings up
// to `maxLevel` (h2 = level 2). Rendering this from data — rather than reading
// the DOM in a client effect — lets the TOC ship in the initial HTML instead of
// popping in after hydration.
export function buildToc(
  toc: RawTocNode[],
  maxLevel: number,
  level = 2,
): TocItem[] {
  const out: TocItem[] = [];
  for (const node of toc) {
    if (level <= maxLevel) {
      out.push({
        id: node.url.replace(/^#/, ""),
        html: renderTitle(node.title),
        level,
      });
    }
    if (node.items?.length) {
      out.push(...buildToc(node.items, maxLevel, level + 1));
    }
  }
  return out;
}
