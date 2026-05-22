type BlockquoteProps = {
  children?: React.ReactNode;
};

export function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="border-l-[3px] border-accent pl-[16px] type-blockquote text-heading">
      {children}
    </blockquote>
  );
}
