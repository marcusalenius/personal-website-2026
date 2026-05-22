type CaptionProps = {
  children?: React.ReactNode;
};

export function Caption({ children }: CaptionProps) {
  return (
    <figcaption className="mt-[14px] text-center type-caption text-muted">
      {children}
    </figcaption>
  );
}
