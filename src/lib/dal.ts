import "server-only";

import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return { isAuth: true, userId: session.user.id, user: session.user };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const data = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    const user = data[0];

    return user;
  } catch {
    console.log("Failed to fetch user");
    return null;
  }
});
