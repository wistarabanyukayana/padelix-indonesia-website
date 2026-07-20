"use server";

import { categories } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";
import { checkPermission, getSession } from "@/lib/auth";
import { ActionState } from "@/types";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  description: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().min(1, "Deskripsi tidak valid").nullable().optional(),
  ),
  imageUrl: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().min(1, "Gambar kategori tidak valid").nullable().optional(),
  ),
  parentId: z.number().nullable().optional(),
});

export async function createCategory(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_CATEGORIES, session);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola kategori" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId")
      ? Number(formData.get("parentId"))
      : null,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  let newId: number | null = null;

  try {
    const [result] = await db
      .insert(categories)
      .values({
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description ?? null,
        imageUrl: validated.data.imageUrl ?? null,
        parentId: validated.data.parentId,
      })
      .returning({ id: categories.id });
    newId = result.id;
    await createAuditLog(
      "CATEGORY_CREATE",
      newId,
      `Created category: ${validated.data.name}`,
      session.user,
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal membuat kategori: " + message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  updateTag("public");
  updateTag("categories");
  updateTag("products");
  return { success: true, redirectTo: `/admin/categories/${newId}/edit?new=1` };
}

export async function updateCategory(
  id: number,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_CATEGORIES, session);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola kategori" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    parentId: formData.get("parentId")
      ? Number(formData.get("parentId"))
      : null,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db
      .update(categories)
      .set({
        name: validated.data.name,
        slug: validated.data.slug,
        description: validated.data.description ?? null,
        imageUrl: validated.data.imageUrl ?? null,
        parentId: validated.data.parentId,
      })
      .where(eq(categories.id, id));
    await createAuditLog(
      "CATEGORY_UPDATE",
      id,
      `Updated category: ${validated.data.name}`,
      session.user,
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal mengupdate kategori: " + message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  updateTag("public");
  updateTag("categories");
  updateTag("products");
  return { success: true, message: "Kategori berhasil diperbarui" };
}

export async function deleteCategory(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session)
    return { success: false, message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_CATEGORIES, session);
    await db.delete(categories).where(eq(categories.id, id));
    await createAuditLog(
      "CATEGORY_DELETE",
      id,
      `Deleted category ID: ${id}`,
      session.user,
    );
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    updateTag("public");
    updateTag("categories");
    updateTag("products");
    return { success: true };
  } catch {
    return { success: false, message: "Gagal menghapus kategori" };
  }
}
