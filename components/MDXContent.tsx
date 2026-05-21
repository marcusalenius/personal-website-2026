import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/mdx";

// Velite emits MDX as a function-body string that destructures `arguments[0]`
// for the JSX runtime and returns `{ default: Component }`. We evaluate it via
// `new Function(code)` and invoke it with React's jsx runtime.
function useMDXComponent(code: string) {
  const fn = new Function(code);
  const mod = fn(runtime) as {
    default: (props: { components?: Record<string, unknown> }) => React.ReactElement;
  };
  return mod.default;
}

type MDXContentProps = {
  code: string;
};

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={mdxComponents} />;
}
