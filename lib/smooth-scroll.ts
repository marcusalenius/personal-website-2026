type ScrollBlock = "start" | "center";

type AnimateOptions = {
  // Where the target should land in the viewport: pinned near the top (for
  // section headings, read downward) or centered (for footnotes/refs, read in
  // context). Defaults to "start".
  block?: ScrollBlock;
  // Called once the animation settles, is interrupted, or completes instantly
  // (reduced motion). Useful for releasing UI locks tied to the scroll.
  onDone?: () => void;
};

// Smoothly scrolls the page so `el` reaches its target line in the viewport,
// re-measuring `el`'s live position every frame.
//
// Why not native `scrollIntoView({ behavior: "smooth" })`: the `.article-body`
// content-visibility rule (see globals.css) leaves off-screen blocks at an
// estimated height, so a destination computed up front would over- or undershoot
// and snap back as those blocks render at their real height mid-scroll. Tracking
// the live target each frame and easing toward it homes in on the true position
// and lands exactly there — no overshoot, no rebound. It also matches native feel
// (cubic ease-in-out, distance-scaled duration) and aborts if the user takes over
// the scroll. Returns a function that cancels the in-flight animation.
export function animateScrollTo(
  el: HTMLElement,
  { block = "start", onDone }: AnimateOptions = {},
): () => void {
  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;
  const clamp = (y: number) => Math.min(Math.max(y, 0), maxScroll());

  // Absolute scroll position that puts `el` on its target line, per the current
  // (live) layout.
  const liveDesired = () => {
    const rect = el.getBoundingClientRect();
    if (block === "center") {
      return clamp(
        window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
      );
    }
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    return clamp(window.scrollY + rect.top - margin);
  };

  let raf = 0;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", finish);
    window.removeEventListener("touchstart", finish);
    window.removeEventListener("keydown", finish);
    onDone?.();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, liveDesired());
    finish();
    return finish;
  }

  const startY = window.scrollY;
  // Distance-scaled duration, capped to a native-like band.
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
        finish();
      });
      return;
    }
    window.scrollTo(0, startY + (desired - startY) * ease(t));
    raf = requestAnimationFrame(step);
  };

  // Abort if the user takes over the scroll.
  window.addEventListener("wheel", finish, { passive: true });
  window.addEventListener("touchstart", finish, { passive: true });
  window.addEventListener("keydown", finish);
  raf = requestAnimationFrame(step);

  return finish;
}
