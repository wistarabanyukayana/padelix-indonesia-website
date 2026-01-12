"use client"

import { Toaster as Sonner } from "sonner"
import { useEffect, useState } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

interface MobileMenuEvent extends CustomEvent {
  detail: { isOpen: boolean };
}

const Toaster = ({ ...props }: ToasterProps) => {
  const [position, setPosition] = useState<ToasterProps["position"]>("bottom-center");

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as MobileMenuEvent;
      setPosition(customEvent.detail.isOpen ? "top-center" : "bottom-center");
    };

    window.addEventListener('mobileMenuToggle', handleToggle);
    return () => window.removeEventListener('mobileMenuToggle', handleToggle);
  }, []);

  return (
    <Sonner
      className="toaster group"
      position={position}
      style={{
        // h-20 is 5rem (80px). We add a bit more for breathing room.
        // We set z-index to 40 so it's below the Header (z-50) 
        // but above most content.
        top: position === "top-center" ? "5.5rem" : undefined,
        zIndex: 40,
      } as React.CSSProperties}
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
