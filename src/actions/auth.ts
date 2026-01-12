"use server";

import { db } from "@/lib/db";
import { users, usersRoles, rolesPermissions, permissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ActionState } from "@/types";
import { createAuditLog } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
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
  const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userResult[0];

  if (!user || !user.isActive) {
    await createAuditLog("AUTH_LOGIN_FAILED", undefined, `Attempted email: ${email} (User not found or inactive)`);
    return { message: "Email atau password salah" };
  }

  // Verify password
  const passwordsMatch = await compare(password, user.passwordHash);
  if (!passwordsMatch) {
    await createAuditLog("AUTH_LOGIN_FAILED", user.id, `Attempted email: ${email}`, { id: user.id, username: user.username });
    return { message: "Email atau password salah" };
  }

  // Fetch permissions
  const userPermissions = await db
    .select({ slug: permissions.slug })
    .from(usersRoles)
    .innerJoin(rolesPermissions, eq(usersRoles.rolesId, rolesPermissions.rolesId))
    .innerJoin(permissions, eq(rolesPermissions.permissionsId, permissions.id))
    .where(eq(usersRoles.usersId, user.id));

  const permissionSlugs = Array.from(new Set(userPermissions.map((p) => p.slug)));

  // Create session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ 
    user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        permissions: permissionSlugs 
    }, 
    expires 
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });

  await createAuditLog("AUTH_LOGIN_SUCCESS", user.id, `User logged in: ${user.username}`, { id: user.id, username: user.username });

  redirect("/admin");
}

export async function logout() {
  await createAuditLog("AUTH_LOGOUT");
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/admin/login");
}
