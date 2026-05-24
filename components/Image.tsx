import NextImage from "next/image";

type ImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function Image({ src, alt = "", width = 1600, height = 900 }: ImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className="h-auto w-full"
    />
  );
}
