"use client";

import { useEffect } from "react";

export function AdminStickyBarWatcher() {
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    let currentElement: Element | null = null;

    const updateHeight = (element: Element) => {
      const height = element.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--admin-sticky-bar-height", `${height}px`);
    };

    const attachObserver = () => {
      const element = document.querySelector("[data-admin-sticky]");
      if (!element) {
        document.documentElement.style.removeProperty("--admin-sticky-bar-height");
        return;
      }

      if (element === currentElement) {
        return;
      }

      if (resizeObserver && currentElement) {
        resizeObserver.disconnect();
      }

      currentElement = element;
      resizeObserver = new ResizeObserver(() => updateHeight(element));
      resizeObserver.observe(element);
      updateHeight(element);
    };

    const mutationObserver = new MutationObserver(attachObserver);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    attachObserver();

    return () => {
      mutationObserver.disconnect();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return null;
}
