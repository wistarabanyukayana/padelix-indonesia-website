import Image from "next/image";

interface AppImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export function AppImage({
  src,
  alt,
  className,
  priority = false,
  ...rest
}: Readonly<AppImageProps>) {
  if (!src) return null;

  return (
    <Image
      priority={priority}
      src={src}
      alt={alt}
      className={className}
      {...rest}
    />
  );
}
