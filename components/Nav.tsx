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
                  ? "type-nav-active text-accent"
                  : "type-nav text-nav"
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
