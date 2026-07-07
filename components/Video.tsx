"use client";

import { useEffect, useRef, useState } from "react";

type VideoProps = {
  src: string;
  poster?: string;
  aspectRatio?: string;
  className?: string;
};

export function Video({
  src,
  poster,
  aspectRatio = "16 / 9",
  className,
}: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Start fetching/decoding the clip a bit before it reaches the viewport so it's
  // ready to play the moment it's actually visible — keeps at most one or two of
  // the post's videos active.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setLoad(true);
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Play only while the clip truly overlaps the viewport; pause + reset when it
  // scrolls away so it restarts from the beginning on re-entry.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!reducedMotion) el.play().catch(() => {});
        } else {
          el.pause();
          el.currentTime = 0;
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // play() in the observer can fire before src is attached; start playback once
  // the source is in the DOM.
  useEffect(() => {
    if (load && !reducedMotion) ref.current?.play().catch(() => {});
  }, [load, reducedMotion]);

  // When the viewer prefers reduced motion, don't autoplay — show the poster
  // and expose controls so they can start the clip themselves.
  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      controls={reducedMotion}
      preload="none"
      className={className ?? "h-auto w-full"}
      style={{ aspectRatio }}
    />
  );
}
