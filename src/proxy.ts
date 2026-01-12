import { NextRequest, NextResponse } from "next/server";
import { updateSession, decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // 1. Handle session refresh for all requests
  const response = await updateSession(request);

  // 2. Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session")?.value;
    const isLoginPage = request.nextUrl.pathname === "/admin/login";

    let isValidSession = false;
    if (sessionCookie) {
      try {
        await decrypt(sessionCookie);
        isValidSession = true;
      } catch {
        isValidSession = false;
      }
    }

    if (!isValidSession && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isValidSession && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response || NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
