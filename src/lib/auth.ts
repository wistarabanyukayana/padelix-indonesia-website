import { auditLogs, users } from "@/db/schema";
import { db } from "@/lib/db";
import { SessionPayload } from "@/types";
import { eq, inArray, sql } from "drizzle-orm";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import "server-only";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production");
}
const key = new TextEncoder().encode(
  secretKey || "dev-fallback-secret-key-change-me",
);

const PERMISSION_THROTTLE_MS = 5 * 60 * 1000;
const permissionDenyThrottle = new Map<string, number>();

async function logPermissionDenied(
  session: SessionPayload,
  permission: string,
) {
  try {
    const userId = session?.user?.id;
    const usernameSnapshot = session?.user?.username;
    if (!userId || !usernameSnapshot) return;

    const throttleKey = `${userId}:${permission}`;
    const now = Date.now();
    const last = permissionDenyThrottle.get(throttleKey) ?? 0;
    if (now - last < PERMISSION_THROTTLE_MS) return;
    permissionDenyThrottle.set(throttleKey, now);

    const headersList = await headers();
    const rawIp =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const ipAddress = rawIp.split(",")[0].trim().substring(0, 45);
    const userAgent = headersList.get("user-agent")?.substring(0, 255) || null;

    await db.insert(auditLogs).values({
      userId,
      usernameSnapshot,
      action: "PERMISSION_DENIED",
      details: `Missing permission: ${permission}`,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("[Audit] Failed to log permission denial:", error);
  }
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as unknown as SessionPayload;
}

export async function getSessionFromCookie(
  session: string | undefined,
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const parsed = await decrypt(session);

    // DB Verification: Ensure user still exists and is active
    const [dbUser] = await db
      .select({
        isActive: users.isActive,
        sessionVersion: users.sessionVersion,
      })
      .from(users)
      .where(eq(users.id, parsed.user.id))
      .limit(1);

    if (!dbUser || !dbUser.isActive) {
      return null;
    }

    const tokenSessionVersion =
      typeof parsed.user.sessionVersion === "number"
        ? parsed.user.sessionVersion
        : 0;
    if (dbUser.sessionVersion !== tokenSessionVersion) {
      return null;
    }

    // Ensure permissions array exists
    if (parsed.user && !parsed.user.permissions) {
      parsed.user.permissions = [];
    }
    if (typeof parsed.user.sessionVersion !== "number") {
      parsed.user.sessionVersion = dbUser.sessionVersion ?? 0;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return getSessionFromCookie(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  try {
    // Refresh session expiration
    const parsed = await decrypt(session);

    // Ensure permissions array exists
    if (parsed.user && !parsed.user.permissions) {
      parsed.user.permissions = [];
    }

    const now = Date.now();
    const issuedAtMs = parsed.iat ? parsed.iat * 1000 : now;
    const rotateAfterMs = 15 * 60 * 1000;
    if (now - issuedAtMs < rotateAfterMs) {
      return;
    }

    parsed.expires = new Date(now + 24 * 60 * 60 * 1000);

    const res = NextResponse.next();
    res.cookies.set({
      name: "session",
      value: await encrypt(parsed),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: parsed.expires,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch {
    // If decryption fails, the cookie is invalid or secret has changed.
    return;
  }
}

export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getSession();
  if (!session || !session.user || !session.user.permissions) return false;
  const allowed = session.user.permissions.includes(permission);
  if (!allowed) {
    await logPermissionDenied(session, permission);
  }
  return allowed;
}

export async function checkPermission(permission: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.permissions) {
    return false;
  }
  if (!session.user.permissions.includes(permission)) {
    await logPermissionDenied(session, permission);
    throw new Error("Unauthorized: Missing permission " + permission);
  }
  return true;
}

export async function bumpSessionVersion(userIds: number | number[]) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (ids.length === 0) return;
  try {
    await db
      .update(users)
      .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
      .where(inArray(users.id, ids));
  } catch (error) {
    console.error("[Auth] Failed to bump session version:", error);
  }
}
