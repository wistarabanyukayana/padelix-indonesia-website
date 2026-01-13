"use server";

import { db } from "@/lib/db";
import { users, usersRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { ActionState } from "@/types";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";

const userSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  isActive: z.coerce.boolean(),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export async function createUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk membuat pengguna" };
  }

  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    isActive: formData.get("isActive") === "true",
    password: formData.get("password"),
  };

  const selectedRoles: number[] = JSON.parse(formData.get("roles") as string || "[]");

  const validated = userSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;
  if (!data.password) {
    return { error: { password: ["Password wajib diisi untuk pengguna baru"] } };
  }

  let newId: number | null = null;

  try {
    const passwordHash = await hash(data.password, 10);
    
    const [result] = await db.insert(users).values({
      username: data.username,
      email: data.email,
      passwordHash,
      isActive: data.isActive,
      lastLogin: new Date(), // Initialize with current date
    }).$returningId();

    newId = result.id;

    if (selectedRoles.length > 0) {
      await db.insert(usersRoles).values(
        selectedRoles.map(roleId => ({
          usersId: newId!,
          rolesId: roleId,
        }))
      );
    }

    await createAuditLog("USER_CREATE", newId!, `Created user: ${data.username}`);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal membuat pengguna: " + message };
  }

  revalidatePath("/admin/users");
  return { success: true, redirectTo: `/admin/users/${newId}/edit` };
}

export async function updateUser(id: number, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengubah pengguna" };
  }

  const rawData = {
    username: formData.get("username"),
    email: formData.get("email"),
    isActive: formData.get("isActive") === "true",
    password: formData.get("password"),
  };

  const selectedRoles: number[] = JSON.parse(formData.get("roles") as string || "[]");

  const validated = userSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;

  try {
    const updateData: {
      username: string;
      email: string;
      isActive: boolean;
      passwordHash?: string;
    } = {
      username: data.username,
      email: data.email,
      isActive: data.isActive,
    };

    if (data.password && data.password.length >= 6) {
      updateData.passwordHash = await hash(data.password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    // Sync Roles
    await db.delete(usersRoles).where(eq(usersRoles.usersId, id));
    if (selectedRoles.length > 0) {
      await db.insert(usersRoles).values(
        selectedRoles.map(roleId => ({
          usersId: id,
          rolesId: roleId,
        }))
      );
    }

    await createAuditLog("USER_UPDATE", id, `Updated user: ${data.username}`);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal memperbarui pengguna: " + message };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "Pengguna berhasil diperbarui" };
}

export async function deleteUser(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);
    
    // Check if user is deleting themselves
    if (session.user.id === id) {
        return { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri" };
    }

    await db.delete(users).where(eq(users.id, id));
    await createAuditLog("USER_DELETE", id, `Deleted user ID: ${id}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus pengguna";
    return { success: false, message };
  }
}
