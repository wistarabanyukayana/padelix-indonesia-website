import "server-only";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionPayload } from "@/types";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production");
}
const key = new TextEncoder().encode(secretKey || "dev-fallback-secret-key-change-me");

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

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const parsed = await decrypt(session);
    
    // DB Verification: Ensure user still exists and is active
    // We only select the 'isActive' field for performance
    const [dbUser] = await db
        .select({ isActive: users.isActive })
        .from(users)
        .where(eq(users.id, parsed.user.id))
        .limit(1);

    if (!dbUser || !dbUser.isActive) {
        return null;
    }

    // Ensure permissions array exists
    if (parsed.user && !parsed.user.permissions) {
      parsed.user.permissions = [];
    }
    return parsed;
  } catch {
    return null;
  }
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

    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
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
  return session.user.permissions.includes(permission);
}

export async function checkPermission(permission: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.permissions || !session.user.permissions.includes(permission)) {
    throw new Error("Unauthorized: Missing permission " + permission);
  }
}
