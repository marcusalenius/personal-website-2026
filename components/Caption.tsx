// Stub — full impl in M8 (caption token, muted, centered, 14px below image).

type CaptionProps = {
  children?: React.ReactNode;
};

export function Caption({ children }: CaptionProps) {
  return <figcaption>{children}</figcaption>;
}
