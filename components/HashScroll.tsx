"use client";

import { useEffect } from "react";
import { animateScrollTo } from "@/lib/smooth-scroll";

// The browser's native fragment scroll is unreliable under content-visibility:
// off-screen blocks sit at their estimated height, so a hash load (or hashchange)
// scrolls to the wrong spot, and scroll anchoring can't recover it because
// content-visibility elements aren't valid scroll anchors. We take over — scroll
// to the target and re-pin it as the real heights resolve (see lib/smooth-scroll).
export function HashScroll() {
  useEffect(() => {
    let cancel: (() => void) | null = null;

    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      cancel?.();
      cancel = animateScrollTo(el, { block: "start", behavior: "instant" });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      cancel?.();
    };
  }, []);

  return null;
}
