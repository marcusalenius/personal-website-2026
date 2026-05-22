"use client";

import { useEffect } from "react";

// Below this width there's no room for the right gutter, so footnotes fall back
// to the bottom list (matches the TOC breakpoint).
const BREAKPOINT = 1040;
// Minimum vertical gap between stacked notes when two refs sit close together.
const GAP = 16;

// Renders GFM footnotes as right-margin sidenotes aligned to their reference in
// the text. Pure DOM (no React tree) so we can measure note heights synchronously
// and stack them in a single pass. Content is cloned from our own compiled-MDX
// definitions, so the innerHTML is trusted.
export function Sidenotes() {
  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".article-body");
    if (!article) return;

    let container: HTMLElement | null = null;

    const clear = () => {
      container?.remove();
      container = null;
      article.classList.remove("has-sidenotes");
    };

    const build = () => {
      clear();
      if (window.innerWidth <= BREAKPOINT) return;

      const refs = Array.from(
        article.querySelectorAll<HTMLAnchorElement>("[data-footnote-ref]"),
      );
      if (refs.length === 0) return;

      container = document.createElement("div");
      container.className = "sidenotes";
      container.setAttribute("aria-hidden", "true");
      article.appendChild(container);
      article.classList.add("has-sidenotes");

      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      let prevBottom = 0;

      for (const ref of refs) {
        const def = document.getElementById(
          decodeURIComponent((ref.getAttribute("href") ?? "").slice(1)),
        );
        if (!def) continue;

        const note = document.createElement("aside");
        note.className = "sidenote";

        const number = document.createElement("span");
        number.className = "sidenote-number";
        number.textContent = ref.textContent?.trim() ?? "";

        const body = document.createElement("div");
        body.className = "sidenote-body";
        body.innerHTML = def.innerHTML;
        body
          .querySelectorAll("[data-footnote-backref]")
          .forEach((el) => el.remove());

        note.append(number, body);
        container.appendChild(note);

        const refTop =
          ref.getBoundingClientRect().top + window.scrollY - articleTop;
        const top = Math.max(refTop, prevBottom + GAP);
        note.style.top = `${top}px`;
        prevBottom = top + note.offsetHeight;
      }
    };

    build();

    // Reflow on width changes and on content reflow (fonts/images settling).
    const observer = new ResizeObserver(build);
    observer.observe(article);
    window.addEventListener("resize", build);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", build);
      clear();
    };
  }, []);

  return null;
}
