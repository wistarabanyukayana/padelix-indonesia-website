"use client"

import { Toaster as Sonner } from "sonner"
import { useEffect, useState } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [position, setPosition] = useState<ToasterProps["position"]>("top-right");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => {
      setPosition(media.matches ? "bottom-center" : "top-right");
    };

    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return (
    <Sonner
      className="toaster group"
      position={position}
      richColors
      offset={
        position === "bottom-center"
          ? {
              bottom: "calc(var(--admin-sticky-bar-height, 7.5rem) + 16px)",
              right: "16px",
              left: "16px",
            }
          : {
              top: "calc(var(--app-header-height, 5.5rem) + 12px)",
              right: "16px",
            }
      }
      mobileOffset={
        position === "bottom-center"
          ? {
              bottom: "calc(var(--admin-sticky-bar-height, 7.5rem) + 16px)",
            }
          : undefined
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-neutral-500",
          actionButton:
            "group-[.toast]:bg-brand-green group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
