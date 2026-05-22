type BlockquoteProps = {
  children?: React.ReactNode;
};

export function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="border-l-[3px] border-accent pl-[24px] type-blockquote text-heading">
      {children}
    </blockquote>
  );
}
