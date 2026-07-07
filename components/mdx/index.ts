import { Blockquote } from "@/components/Blockquote";
import { MDLink } from "@/components/MDLink";
import { Caption } from "@/components/Caption";
import { Figure } from "@/components/Figure";
import { Image } from "@/components/Image";
import { Video } from "@/components/Video";

export const mdxComponents = {
  a: MDLink,
  blockquote: Blockquote,
  Caption,
  Figure,
  Image,
  Video,
} as const;
