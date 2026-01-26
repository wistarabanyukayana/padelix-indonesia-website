"use client";

import { trackMetaPageView } from "@/lib/metaPixel";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type Fbq = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
  callMethod?: (...args: unknown[]) => void;
};

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isApiRoute = pathname?.startsWith("/api");
  const shouldSkip = isAdminRoute || isApiRoute;

  useEffect(() => {
    if (!pixelId || shouldSkip) return;
    const win = window as Window & {
      __metaPixelInit?: boolean;
      __metaPixelLastUrl?: string | null;
    };
    const existingFbq = (window as Window & { fbq?: Fbq }).fbq;
    if (win.__metaPixelInit || existingFbq?.loaded) {
      win.__metaPixelInit = true;
      return;
    }
    if (!existingFbq) {
      // Base Meta Pixel loader (matches official snippet)
      const fbq = ((...args: unknown[]) => {
        const callMethod = fbq.callMethod;
        if (callMethod) {
          callMethod(...args);
        } else {
          fbq.queue.push(args);
        }
      }) as Fbq;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.callMethod = undefined;
      (window as Window & { fbq?: Fbq }).fbq = fbq;

      const existingScript = document.querySelector(
        'script[src="https://connect.facebook.net/en_US/fbevents.js"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }
    }
    (window as Window & { fbq?: Fbq }).fbq?.("init", pixelId);
    win.__metaPixelInit = true;
  }, [shouldSkip]);

  useEffect(() => {
    if (!pixelId || shouldSkip) return;
    const win = window as Window & { __metaPixelLastUrl?: string | null };
    const currentUrl = `${pathname}?${searchParams.toString()}`;
    if (win.__metaPixelLastUrl === currentUrl) return;
    win.__metaPixelLastUrl = currentUrl;
    if (window.fbq) {
      trackMetaPageView();
    }
  }, [pathname, searchParams, shouldSkip]);

  if (!pixelId || shouldSkip) return null;

  return (
    <>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
