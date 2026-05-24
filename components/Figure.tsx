type FigureProps = {
  children?: React.ReactNode;
};

export function Figure({ children }: FigureProps) {
  return <figure>{children}</figure>;
}
