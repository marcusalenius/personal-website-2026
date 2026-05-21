import { Blockquote } from "@/components/Blockquote";
import { MDLink } from "@/components/MDLink";
import { Caption } from "@/components/Caption";
import { Figure } from "@/components/Figure";
import { VersionTag } from "@/components/VersionTag";

export const mdxComponents = {
  a: MDLink,
  blockquote: Blockquote,
  Caption,
  Figure,
  VersionTag,
} as const;
