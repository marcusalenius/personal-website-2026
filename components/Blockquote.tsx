// Stub — full impl in M8 (left accent bar, blockquote token italic, 24px gap).

type BlockquoteProps = {
  children?: React.ReactNode;
};

export function Blockquote({ children }: BlockquoteProps) {
  return <blockquote>{children}</blockquote>;
}
