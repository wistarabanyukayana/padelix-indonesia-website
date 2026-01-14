import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface AppImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  alt: string;
}

export function AppImage({ src, alt, className, fill, sizes, ...props }: AppImageProps) {
  if (!src) return null;
  const isLocalUpload = src.startsWith("/uploads/");
  const isDev = process.env.NODE_ENV === "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_DEV_SITE_URL;
  const resolvedSrc = isLocalUpload && !isDev && siteUrl ? `${siteUrl}${src}` : src;

  // Default sizes for filled images if not provided
  const defaultSizes = fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      sizes={sizes || defaultSizes}
      className={cn("object-cover object-center", className)}
      {...props}
    />
  );
}
