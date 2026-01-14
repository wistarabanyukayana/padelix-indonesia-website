"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function useNewItemToast(message: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasShown = useRef(false);
  const hasNew = searchParams.get("new") === "1";

  const clearNewParam = useCallback(() => {
    if (!hasNew) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    const next = params.toString();
    const target = next ? `${pathname}?${next}` : pathname;
    router.replace(target, { scroll: false });
  }, [hasNew, pathname, router, searchParams]);

  useEffect(() => {
    if (!hasNew || hasShown.current) return;
    hasShown.current = true;
    const timeout = setTimeout(() => {
      toast.success(message);
    }, 0);
    return () => clearTimeout(timeout);
  }, [hasNew, message]);

  return { hasNew, clearNewParam };
}
