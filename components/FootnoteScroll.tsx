"use client";

import { useEffect } from "react";

// Smooth-scrolls footnote ref → definition and backref → ref, with a transient
// flash on the landing target. remark-gfm prefixes ids with `user-content-`.
export function FootnoteScroll() {
  useEffect(() => {
    const root = document.querySelector(".article-body");
    if (!root) return;

    const onClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>(
        'a[href^="#user-content-fn"]',
      );
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      const dest = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!dest) return;

      e.preventDefault();
      // When footnotes render as sidenotes the bottom list is hidden, so there's
      // nothing to scroll to — the note is already beside the reference.
      if (dest.offsetParent === null) return;
      dest.scrollIntoView({ behavior: "smooth", block: "center" });
      dest.classList.remove("footnote-flash");
      void dest.offsetWidth; // restart the animation
      dest.classList.add("footnote-flash");
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return null;
}
