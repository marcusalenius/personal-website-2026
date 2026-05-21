// Stub — full impl in M8 (Next/Image unoptimized, borderless, optional Caption).

type FigureProps = {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
};

export function Figure({ src, alt, children }: FigureProps) {
  return (
    <figure>
      {src && <img src={src} alt={alt ?? ""} />}
      {children}
    </figure>
  );
}
