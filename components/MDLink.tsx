import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { siteConfig } from "@/site.config";
import { ArrowUDownLeftIcon, ArrowUpRightIcon } from "@/components/icons";

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
        <ArrowUpRightIcon size={10} className="md-link-arrow" />
      </a>
    );
  }

  if (kind === "hash") {
    const isBackref = "data-footnote-backref" in rest;
    return (
      <a href={href} className={cls} {...rest}>
        {isBackref ? (
          <ArrowUDownLeftIcon size={11} className="footnote-backref-icon" />
        ) : (
          children
        )}
      </a>
    );
  }

  return (
    <Link href={internalPath(href)} className={cls} {...rest}>
      {children}
    </Link>
  );
}
