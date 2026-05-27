"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/site.config";

type TitleProps = {
  subhead?: string;
};

// Resets on a full page load, persists across client-side navigations — so the
// name animates once per real load, while the subhead animates on every mount.
let hasLoadedOnce = false;

export function Title({ subhead }: TitleProps) {
  const [firstLoad] = useState(() => !hasLoadedOnce);

  useEffect(() => {
    hasLoadedOnce = true;
  }, []);

  return (
    <div>
      <div className={firstLoad ? "load-title" : undefined}>
        <span className="block type-display text-accent">
          {siteConfig.name.first}
        </span>
        <span className="block type-display-italic text-heading">
          {siteConfig.name.last}
        </span>
      </div>
      {subhead && (
        <span className="load-title block type-section text-muted">
          {subhead}
        </span>
      )}
    </div>
  );
}
