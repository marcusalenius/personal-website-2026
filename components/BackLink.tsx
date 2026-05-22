import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

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
      <ArrowLeftIcon size={12} />
      <span>{children}</span>
    </Link>
  );
}
