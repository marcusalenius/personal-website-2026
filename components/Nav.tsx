"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { siteConfig } from "@/site.config";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-end items-baseline gap-[10px]">
      {siteConfig.nav.map((item, i) => {
        const active = isActive(item.href, pathname);
        // Active link is only a useful target on a descendant page (e.g. a
        // post under /posts), where clicking it navigates back to the section.
        // trailingSlash is on, so normalize before comparing to the href.
        const activeNavigable =
          active && pathname.replace(/\/$/, "") !== item.href.replace(/\/$/, "");
        return (
          <Fragment key={item.href}>
            {i > 0 && (
              <span className="type-nav text-nav-slash" aria-hidden>
                /
              </span>
            )}
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? `type-nav-active text-accent${activeNavigable ? " nav-link" : ""}`
                  : "nav-link type-nav text-muted-strong"
              }
            >
              {item.label}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
