import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { siteConfig } from "@/site.config";

type MDLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

function classify(href: string): "hash" | "internal" | "external" {
  if (href.startsWith("#")) return "hash";
  if (href.startsWith("/")) return "internal";
  try {
    const url = new URL(href);
    const site = new URL(siteConfig.url);
    return url.origin === site.origin ? "internal" : "external";
  } catch {
    return "internal";
  }
}

function internalPath(href: string): string {
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

export function MDLink({ href = "", children, className, ...rest }: MDLinkProps) {
  const cls = className ? `md-link ${className}` : "md-link";
  const kind = classify(href);

  if (kind === "external") {
    return (
      <a
        href={href}
        className={cls}
        {...rest}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        {/* Inlined instead of <ArrowUpRightIcon> so the viewBox can be cropped
            to the path bounds — Phosphor's 0 0 256 256 box wraps the glyph in
            ~52u of transparent padding, which shrinks the visible arrow and
            stops its bottom from aligning to the text baseline. */}
        <svg
          className="md-link-arrow"
          viewBox="52 52 152 152"
          fill="currentColor"
          aria-hidden
        >
          <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
        </svg>
      </a>
    );
  }

  if (kind === "hash") {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={internalPath(href)} className={cls} {...rest}>
      {children}
    </Link>
  );
}
