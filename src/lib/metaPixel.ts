type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
  if (!fbq) return;
  fbq("track", event, params);
}

export function trackMetaPageView() {
  trackMetaEvent("PageView");
}
