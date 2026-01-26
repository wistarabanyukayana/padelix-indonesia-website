"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface AppImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
}

export function AppImage({
  src,
  alt,
  className,
  fill,
  sizes,
  fallbackSrc,
  ...props
}: AppImageProps) {
  const [hasError, setHasError] = useState(false);
  if (!src) return null;
  const isLocalUpload = src.startsWith("/uploads/");
  const isDev = process.env.NODE_ENV === "development";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_DEV_SITE_URL;
  const resolvedSrc =
    isLocalUpload && !isDev && siteUrl ? `${siteUrl}${src}` : src;

  // Default sizes for filled images if not provided
  const defaultSizes = fill
    ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    : undefined;

  if (hasError) {
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill={fill}
          sizes={sizes || defaultSizes}
          className={cn("object-cover object-center", className)}
          {...props}
        />
      );
    }

    const width = typeof props.width === "number" ? props.width : undefined;
    const height = typeof props.height === "number" ? props.height : undefined;

    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-neutral-100 text-xs font-semibold text-neutral-400",
          fill ? "h-full w-full" : "",
          className,
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        Gambar tidak tersedia
      </div>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      sizes={sizes || defaultSizes}
      className={cn("object-cover object-center", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
