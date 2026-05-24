"use client";

import { useEffect, useRef, useState } from "react";

type Heading = { id: string; html: string; level: number };

function readHeadings(maxLevel: number): Heading[] {
  const levels: string[] = [];
  for (let l = 2; l <= maxLevel; l++) levels.push(`h${l}`);
  if (levels.length === 0) return [];

  const selector = levels.map((l) => `.article-body ${l}`).join(", ");
  const nodes = document.querySelectorAll<HTMLElement>(selector);

  return Array.from(nodes)
    .filter((el) => el.id && !el.closest(".footnotes"))
    .map((el) => ({
      id: el.id,
      // Reuse the heading's already-rendered HTML (KaTeX spans included) so math
      // shows in the TOC. Source is our own compiled MDX, not user input.
      html: el.innerHTML,
      level: Number(el.tagName.slice(1)),
    }));
}

export function TableOfContents({ maxLevel }: { maxLevel: number }) {
  const [items, setItems] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  // While a click-triggered smooth scroll is in flight, the clicked heading may
  // not reach the active line (e.g. the last heading near page bottom), so we
  // pin its selection and suppress scroll-driven recomputes until it settles.
  const clickLockRef = useRef(false);
  // Stops the in-flight scroll animation (set while one is running).
  const cancelScrollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const headings = readHeadings(maxLevel);
    setItems(headings);
    const first = headings[0];
    if (!first) return;

    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    // Active = the last heading whose top has crossed a line near the viewport
    // top. Recomputed whenever a heading crosses that line (gapless across long
    // sections, unlike picking only headings currently inside a narrow band).
    const computeActive = () => {
      if (clickLockRef.current) return;
      const line = window.innerHeight * 0.15;
      let current = first.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top - line <= 1) current = el.id;
      }
      setActiveId(current);
    };

    const observer = new IntersectionObserver(computeActive, {
      rootMargin: "-15% 0px -85% 0px",
      threshold: 0,
    });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [maxLevel]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();

    // Cancel any animation already in flight (e.g. rapid clicks).
    cancelScrollRef.current?.();

    setActiveId(id);
    history.pushState(null, "", `#${id}`);

    const targetTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollIntoView({ block: "start" });
      return;
    }

    clickLockRef.current = true;

    // We animate the scroll ourselves instead of using native smooth scroll.
    // The `.article-body` content-visibility rule (see globals.css) leaves
    // off-screen blocks at an estimated height, so a fixed destination would
    // over- or undershoot and then snap back as real heights render in mid-scroll.
    // We run a time-based ease-in-out tween (matching native smooth-scroll feel)
    // but recompute the heading's live position every frame, so it homes in on the
    // true destination and lands exactly there.
    let raf = 0;

    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      clickLockRef.current = false;
      cancelScrollRef.current = null;
    };
    cancelScrollRef.current = stop;

    const maxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (y: number) => Math.min(Math.max(y, 0), maxScroll());
    // Absolute scroll position that puts the heading on its target line, per the
    // current (live) layout.
    const liveDesired = () =>
      clamp(window.scrollY + el.getBoundingClientRect().top - targetTop);

    // Distance-scaled duration, capped to a native-like band. Tweak here to make
    // the scroll faster/slower overall.
    const startY = window.scrollY;
    const duration = Math.min(
      900,
      Math.max(250, 200 + Math.abs(liveDesired() - startY) * 0.075),
    );
    // Cubic ease-in-out (slow start, slow end), like native smooth scroll.
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const desired = liveDesired();
      if (t >= 1) {
        window.scrollTo(0, desired);
        // One settle frame to absorb any final layout shift, then stop.
        raf = requestAnimationFrame(() => {
          window.scrollTo(0, liveDesired());
          stop();
        });
        return;
      }
      window.scrollTo(0, startY + (desired - startY) * ease(t));
      raf = requestAnimationFrame(step);
    };

    // Abort if the user takes over the scroll.
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);

    raf = requestAnimationFrame(step);
  };

  if (items.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <ul className="flex flex-col gap-[8px]">
        {items.map((h) => (
          <li key={h.id} style={{ paddingLeft: (h.level - 2) * 12 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`toc-link${h.id === activeId ? " toc-link-active" : ""}`}
              dangerouslySetInnerHTML={{ __html: h.html }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
