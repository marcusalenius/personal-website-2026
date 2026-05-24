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
    let notes: { note: HTMLElement; ref: HTMLElement }[] = [];

    const teardown = () => {
      container?.remove();
      container = null;
      notes = [];
      article.classList.remove("has-sidenotes");
    };

    // Build the note elements once. Their vertical positions are set separately
    // by position() so reflows don't have to recreate the DOM.
    const construct = () => {
      teardown();

      const refs = Array.from(
        article.querySelectorAll<HTMLAnchorElement>("[data-footnote-ref]"),
      );
      if (refs.length === 0) return;

      container = document.createElement("div");
      container.className = "sidenotes";
      container.setAttribute("aria-hidden", "true");

      for (const ref of refs) {
        const def = document.getElementById(
          decodeURIComponent((ref.getAttribute("href") ?? "").slice(1)),
        );
        if (!def) continue;

        const note = document.createElement("aside");
        note.className = "sidenote";
        note.dataset.refId = ref.id;

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
        notes.push({ note, ref });
      }

      article.appendChild(container);
      article.classList.add("has-sidenotes");
    };

    // Align each note to its reference, stacking when they crowd. Mutates only
    // the notes' `top`, so it never detaches the elements — safe to run on every
    // reflow (including the content-visibility height changes during a scroll, so
    // a scroll animation tracking a note isn't yanked out from under it).
    const position = () => {
      if (!container) return;
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      let prevBottom = 0;
      for (const { note, ref } of notes) {
        const refTop =
          ref.getBoundingClientRect().top + window.scrollY - articleTop;
        const top = Math.max(refTop, prevBottom + GAP);
        note.style.top = `${top}px`;
        prevBottom = top + note.offsetHeight;
      }
    };

    const update = () => {
      if (window.innerWidth <= BREAKPOINT) {
        teardown();
        return;
      }
      if (!container) construct();
      position();
    };

    update();

    // Reflow on width changes and on content reflow (fonts/images settling, or
    // content-visibility blocks rendering as they scroll into view).
    const observer = new ResizeObserver(update);
    observer.observe(article);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      teardown();
    };
  }, []);

  return null;
}
