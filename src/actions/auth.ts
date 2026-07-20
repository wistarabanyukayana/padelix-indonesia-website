"use server";

import { permissions, rolesPermissions, users, usersRoles } from "@/db/schema";
import { db } from "@/lib/db";
import { createSession, deleteSession, updateSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { ActionState } from "@/types";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const loginLimit = rateLimit(`login:${ip}`, {
    intervalMs: 15 * 60 * 1000,
    max: 10,
  });
  if (!loginLimit.success) {
    return {
      message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
    };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input
  const validatedFields = loginSchema.safeParse({ email, password });
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Find user
  const userResult = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      isActive: users.isActive,
      sessionVersion: users.sessionVersion,
      passwordMatches: sql<boolean>`crypt(${password}, ${users.passwordHash}) = ${users.passwordHash}`,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = userResult[0];

  if (!user || !user.isActive) {
    await createAuditLog(
      "AUTH_LOGIN_FAILED",
      undefined,
      `Attempted email: ${email} (User not found or inactive)`,
    );
    return { message: "Email atau password salah" };
  }

  if (!user.passwordMatches) {
    await createAuditLog(
      "AUTH_LOGIN_FAILED",
      user.id,
      `Attempted email: ${email}`,
      { id: user.id, username: user.username },
    );
    return { message: "Email atau password salah" };
  }

  // Fetch permissions
  const userPermissions = await db
    .select({ slug: permissions.slug })
    .from(usersRoles)
    .innerJoin(
      rolesPermissions,
      eq(usersRoles.rolesId, rolesPermissions.rolesId),
    )
    .innerJoin(permissions, eq(rolesPermissions.permissionsId, permissions.id))
    .where(eq(usersRoles.usersId, user.id));

  const permissionSlugs = Array.from(
    new Set(userPermissions.map((p) => p.slug)),
  );

  // Create session
  await createSession({
    id: user.id,
    username: user.username,
    email: user.email,
    permissions: permissionSlugs,
    sessionVersion: user.sessionVersion ?? 0,
  });

  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  await createAuditLog(
    "AUTH_LOGIN_SUCCESS",
    user.id,
    `User logged in: ${user.username}`,
    { id: user.id, username: user.username },
  );

  return { success: true, redirectTo: "/admin" };
}

export async function logout() {
  await createAuditLog("AUTH_LOGOUT");
  await deleteSession();
  return { success: true, redirectTo: "/admin/login" };
}

export async function refreshAdminSession() {
  await updateSession();
}
