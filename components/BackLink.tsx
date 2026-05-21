import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-[8px] type-caption text-muted"
    >
      <ArrowLeftIcon size={12} aria-hidden />
      <span>{children}</span>
    </Link>
  );
}
