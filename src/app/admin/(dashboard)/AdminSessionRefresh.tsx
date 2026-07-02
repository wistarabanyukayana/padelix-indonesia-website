"use client";

import { refreshAdminSession } from "@/actions/auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AdminSessionRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    void refreshAdminSession();
  }, [pathname]);

  return null;
}
