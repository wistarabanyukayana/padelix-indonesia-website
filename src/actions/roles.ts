"use server";

import { db } from "@/lib/db";
import { roles, rolesPermissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionState } from "@/types";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";

const roleSchema = z.object({
  name: z.string().min(1, "Nama peran wajib diisi"),
  description: z.string().optional().or(z.literal("")),
});

export async function createRole(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola peran" };
  }

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const selectedPermissions: number[] = JSON.parse(formData.get("permissions") as string || "[]");

  const validated = roleSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;
  let newId: number | null = null;

  try {
    const [result] = await db.insert(roles).values({
      name: data.name,
      description: data.description,
    }).$returningId();

    newId = result.id;

    if (selectedPermissions.length > 0) {
      await db.insert(rolesPermissions).values(
        selectedPermissions.map(permId => ({
          rolesId: newId!,
          permissionsId: permId,
        }))
      );
    }

    await createAuditLog("ROLE_CREATE", newId!, `Created role: ${data.name}`);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal membuat peran: " + message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
  return { success: true, redirectTo: `/admin/roles/${newId}/edit` };
}

export async function updateRole(id: number, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola peran" };
  }

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const selectedPermissions: number[] = JSON.parse(formData.get("permissions") as string || "[]");

  const validated = roleSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;

  try {
    await db.update(roles).set({
      name: data.name,
      description: data.description,
    }).where(eq(roles.id, id));

    // Sync Permissions
    await db.delete(rolesPermissions).where(eq(rolesPermissions.rolesId, id));
    if (selectedPermissions.length > 0) {
      await db.insert(rolesPermissions).values(
        selectedPermissions.map(permId => ({
          rolesId: id,
          permissionsId: permId,
        }))
      );
    }

    await createAuditLog("ROLE_UPDATE", id, `Updated role: ${data.name}`);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal memperbarui peran: " + message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/roles");
  return { success: true, message: "Peran berhasil diperbarui" };
}

export async function deleteRole(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_USERS);

    // Check if it's super_admin
    const role = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (role[0]?.name === 'super_admin') {
        return { success: false, message: "Tidak dapat menghapus peran super_admin" };
    }

    await db.delete(roles).where(eq(roles.id, id));
    await createAuditLog("ROLE_DELETE", id, `Deleted role ID: ${id}`);
    revalidatePath("/admin/roles");
    return { success: true };
  } catch {
    return { success: false, message: "Gagal menghapus peran. Pastikan tidak ada pengguna yang menggunakan peran ini." };
  }
}
