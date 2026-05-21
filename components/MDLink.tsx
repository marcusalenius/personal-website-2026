// Stub — full impl in M8 (SemiBold heading-color text, 6px faded-blue highlight
// bar at y=9, external ↗ glyph with 5px gap, internal links via next/link).

import Link from "next/link";

type MDLinkProps = {
  href?: string;
  children?: React.ReactNode;
};

function isInternal(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

export function MDLink({ href = "", children }: MDLinkProps) {
  if (isInternal(href)) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
