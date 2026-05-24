"use client";

import { useEffect, useRef, useState } from "react";
import { animateScrollTo } from "@/lib/smooth-scroll";
import type { TocItem } from "@/lib/toc";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  // While a click-triggered smooth scroll is in flight, the clicked heading may
  // not reach the active line (e.g. the last heading near page bottom), so we
  // pin its selection and suppress scroll-driven recomputes until it settles.
  const clickLockRef = useRef(false);
  // Stops the in-flight scroll animation (set while one is running).
  const cancelScrollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const first = items[0];
    if (!first) return;

    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

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
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();

    // Cancel any animation already in flight (e.g. rapid clicks).
    cancelScrollRef.current?.();

    setActiveId(id);
    history.pushState(null, "", `#${id}`);

    // Pin selection and suppress scroll-driven recomputes until the scroll lands.
    clickLockRef.current = true;
    cancelScrollRef.current = animateScrollTo(el, {
      block: "start",
      onDone: () => {
        clickLockRef.current = false;
      },
    });
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
