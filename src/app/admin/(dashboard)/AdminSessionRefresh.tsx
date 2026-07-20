"use client";

import { refreshAdminSession } from "@/actions/auth";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const REFRESHED_AT_KEY = "admin-session-refreshed-at";
const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

export function AdminSessionRefresh() {
  const pathname = usePathname();
  const refreshing = useRef(false);

  useEffect(() => {
    if (refreshing.current) return;

    try {
      const refreshedAt = Number(sessionStorage.getItem(REFRESHED_AT_KEY));
      if (Date.now() - refreshedAt < REFRESH_INTERVAL_MS) return;
    } catch {
      void refreshAdminSession();
      return;
    }

    refreshing.current = true;
    void refreshAdminSession()
      .then(() => sessionStorage.setItem(REFRESHED_AT_KEY, String(Date.now())))
      .catch(() => {})
      .finally(() => {
        refreshing.current = false;
      });
  }, [pathname]);

  return null;
}
