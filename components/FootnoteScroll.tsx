"use client";

import { useEffect } from "react";
import { animateScrollTo } from "@/lib/smooth-scroll";

// Flashes the target once it's actually in view. A smooth scroll to a distant
// footnote takes time, so starting the animation on click would let it fade out
// before the reader sees it. Fires immediately if already visible, otherwise
// when the scroll brings it into the viewport.
function flashWhenVisible(el: HTMLElement) {
  const flash = () => {
    el.classList.remove("footnote-flash");
    void el.offsetWidth; // restart the animation
    el.classList.add("footnote-flash");
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      if (entries[0]?.isIntersecting) {
        obs.disconnect();
        flash();
      }
    },
    // Low threshold so any note size triggers; a tall note can never reach a
    // high visible fraction and would otherwise never flash.
    { threshold: 0.1 },
  );
  observer.observe(el);
}

// Smooth-scrolls footnote ref → definition and backref → ref, with a transient
// flash on the landing target. remark-gfm prefixes ids with `user-content-`.
export function FootnoteScroll() {
  useEffect(() => {
    const root = document.querySelector(".article-body");
    if (!root) return;

    // Cancels the in-flight scroll so rapid clicks don't fight each other.
    let cancelScroll: (() => void) | null = null;

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
      cancelScroll?.();

      // Footnotes center their target in the viewport (read in context), unlike
      // the TOC which pins headings to the top. The shared helper tracks the live
      // target each frame to stay accurate under content-visibility (see
      // lib/smooth-scroll.ts).
      //
      // When footnotes render as sidenotes the bottom list is hidden. The note
      // can stack below its reference, so flash the matching sidenote (and only
      // scroll if it's off-screen) to point the reader to it.
      let landing: HTMLElement = dest;
      if (dest.offsetParent === null) {
        const sidenote = document.querySelector<HTMLElement>(
          `.sidenote[data-ref-id="${CSS.escape(anchor.id)}"]`,
        );
        if (!sidenote) return;
        landing = sidenote;
        const rect = sidenote.getBoundingClientRect();
        const offscreen = rect.top < 0 || rect.bottom > window.innerHeight;
        if (offscreen) {
          cancelScroll = animateScrollTo(sidenote, { block: "center" });
        }
      } else {
        cancelScroll = animateScrollTo(dest, { block: "center" });
      }

      flashWhenVisible(landing);
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      cancelScroll?.();
    };
  }, []);

  return null;
}
