"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpIcon } from "./icons";

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
    // Before the first heading crosses, "Top" is active.
    const computeActive = () => {
      if (clickLockRef.current) return;
      const line = window.innerHeight * 0.15;
      let current = "top";
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

  const handleTopClick = (e: React.MouseEvent) => {
    e.preventDefault();

    setActiveId("top");
    clickLockRef.current = true;

    window.scrollTo({ top: 0, behavior: "smooth" });
    history.pushState(null, "", window.location.pathname + window.location.search);

    const release = () => {
      clickLockRef.current = false;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release);
    setTimeout(release, 700);
  };

  const handleClick = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();

    setActiveId(id);
    clickLockRef.current = true;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${id}`);

    const release = () => {
      clickLockRef.current = false;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release);
    // Fallback for browsers without the scrollend event.
    setTimeout(release, 700);
  };

  if (items.length === 0) return null;

  return (
    <nav className="toc load-fade" aria-label="Table of contents">
      <ul className="flex flex-col -my-[4px]">
        <li className="toc-top">
          <a
            href="#"
            onClick={handleTopClick}
            className={`toc-link toc-top-link${activeId === "top" ? " toc-link-active" : ""}`}
          >
            <ArrowUpIcon size={10} className="toc-top-arrow" />
            Top
          </a>
        </li>
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
