type FigureProps = {
  // Fraction of the content column the figure should occupy, e.g. `width="60%"`
  // (or `width={60}`). Narrows the figure — image and caption together — to this
  // width and centers it. Omit for full column width.
  width?: number | string;
  children?: React.ReactNode;
};

export function Figure({ width, children }: FigureProps) {
  const w = typeof width === "number" ? `${width}%` : width;
  return (
    <figure style={w ? { width: w, marginInline: "auto" } : undefined}>
      {children}
    </figure>
  );
}
