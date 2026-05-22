import Image from "next/image";

type FigureProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
};

export function Figure({
  src,
  alt = "",
  width = 1600,
  height = 900,
  children,
}: FigureProps) {
  return (
    <figure>
      {src && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className="h-auto w-full"
        />
      )}
      {children}
    </figure>
  );
}
