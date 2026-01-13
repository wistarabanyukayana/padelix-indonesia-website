"use server";

import { db } from "@/lib/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/types";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";

const brandSchema = z.object({
  name: z.string().min(1, "Nama brand wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  website: z.string().url("Website harus berupa URL valid"),
  logoUrl: z.string().nullable().optional(),
});

export async function createBrand(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_BRANDS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola brand" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    website: formData.get("website"),
    logoUrl: formData.get("logoUrl") || null,
  };

  const validated = brandSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  let newId: number | null = null;

  try {
    const [result] = await db.insert(brands).values({
        name: validated.data.name,
        slug: validated.data.slug,
        website: validated.data.website,
        logoUrl: validated.data.logoUrl,
    }).$returningId();
    newId = result.id;
    await createAuditLog("BRAND_CREATE", newId, `Created brand: ${validated.data.name}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal membuat brand: " + message };
  }

  revalidatePath("/admin/brands", "layout");
  revalidatePath("/admin/products", "layout");
  revalidatePath("/products", "layout");
  return { success: true, redirectTo: `/admin/brands/${newId}/edit` };
}

export async function updateBrand(id: number, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_BRANDS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola brand" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    website: formData.get("website"),
    logoUrl: formData.get("logoUrl") || null,
  };

  const validated = brandSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.update(brands).set({
        name: validated.data.name,
        slug: validated.data.slug,
        website: validated.data.website,
        logoUrl: validated.data.logoUrl,
    }).where(eq(brands.id, id));
    await createAuditLog("BRAND_UPDATE", id, `Updated brand: ${validated.data.name}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal mengupdate brand: " + message };
  }

  revalidatePath("/admin/brands", "layout");
  revalidatePath("/admin/products", "layout");
  revalidatePath("/products", "layout");
  return { success: true, message: "Brand berhasil diperbarui" };
}

export async function deleteBrand(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { success: false, message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_BRANDS);
    await db.delete(brands).where(eq(brands.id, id));
    await createAuditLog("BRAND_DELETE", id, `Deleted brand ID: ${id}`);
    revalidatePath("/admin/brands", "layout");
    revalidatePath("/admin/products", "layout");
    revalidatePath("/products", "layout");
    return { success: true };
  } catch {
    return { success: false, message: "Gagal menghapus brand" };
  }
}
