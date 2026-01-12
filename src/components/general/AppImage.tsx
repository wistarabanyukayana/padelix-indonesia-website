import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface AppImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  alt: string;
}

export function AppImage({ src, alt, className, fill, sizes, ...props }: AppImageProps) {
  if (!src) return null;

  // Default sizes for filled images if not provided
  const defaultSizes = fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes || defaultSizes}
      className={cn("object-cover object-center", className)}
      {...props}
    />
  );
}
