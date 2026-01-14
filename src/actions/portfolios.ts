"use server";

import { db } from "@/lib/db";
import { portfolios, portfolioMedias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState, MediaPayload } from "@/types";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";

const portfolioMediaSchema = z.object({
  id: z.number(), // The media ID from medias table
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().default(0),
  altText: z.string().nullable().default(null),
});

const portfolioSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  location: z.string().optional(),
  description: z.string().optional(),
  completionDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  isActive: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
});

export async function createPortfolio(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk mengelola portofolio" };
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    location: formData.get("location"),
    description: formData.get("description"),
    completionDate: formData.get("completionDate"),
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };

  let medias: MediaPayload[] = [];
  try {
    medias = z.array(portfolioMediaSchema).parse(JSON.parse(formData.get("medias") as string || "[]"));
  } catch {
    return { message: "Format data media tidak valid" };
  }

  const validated = portfolioSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;
  let newId: number | null = null;

  try {
    const [result] = await db.insert(portfolios).values({
        title: data.title,
        slug: data.slug,
        location: data.location,
        description: data.description,
        completionDate: data.completionDate,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        createdBy: session.user.id, 
    }).$returningId();

    newId = result.id;

    if (medias.length > 0) {
      await db.insert(portfolioMedias).values(
        medias.map((m) => ({
          portfolioId: newId!,
          mediaId: m.id,
          isPrimary: m.isPrimary || false,
          sortOrder: m.sortOrder || 0,
          altText: m.altText,
        }))
      );
    }

    await createAuditLog("PORTFOLIO_CREATE", newId!, `Created portfolio: ${data.title}`);

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal membuat portofolio: " + message };
  }

  revalidatePath("/admin/portfolios", "layout");
  revalidatePath("/");
  return { success: true, redirectTo: `/admin/portfolios/${newId}/edit?new=1` };
}

export async function updatePortfolio(id: number, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getSession();
    if (!session) return { message: "Sesi berakhir, silakan login kembali" };

    try {
      await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
    } catch {
      return { message: "Anda tidak memiliki izin untuk mengelola portofolio" };
    }

    const rawData = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        location: formData.get("location"),
        description: formData.get("description"),
        completionDate: formData.get("completionDate"),
        isActive: formData.get("isActive") === "true",
        isFeatured: formData.get("isFeatured") === "true",
      };
    
      let medias: MediaPayload[] = [];
      try {
        medias = z.array(portfolioMediaSchema).parse(JSON.parse(formData.get("medias") as string || "[]"));
      } catch {
        return { message: "Format data media tidak valid" };
      }
    
      const validated = portfolioSchema.safeParse(rawData);
    
      if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
      }
    
      const { data } = validated;
    
      try {
        await db.update(portfolios).set({
            title: data.title,
            slug: data.slug,
            location: data.location,
            description: data.description,
            completionDate: data.completionDate,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
        }).where(eq(portfolios.id, id));
    
        await db.delete(portfolioMedias).where(eq(portfolioMedias.portfolioId, id));
        if (medias.length > 0) {
          await db.insert(portfolioMedias).values(
            medias.map((m) => ({
              portfolioId: id,
              mediaId: m.id,
              isPrimary: m.isPrimary || false,
              sortOrder: m.sortOrder || 0,
              altText: m.altText,
            }))
                );
              }
          
              await createAuditLog("PORTFOLIO_UPDATE", id, `Updated portfolio: ${data.title}`);
          
            } catch (error: unknown) {
          
        console.error(error);
        const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
        return { message: "Gagal mengupdate portofolio: " + message };
      }
    
      revalidatePath("/admin/portfolios", "layout");
      revalidatePath("/");
      return { success: true, message: "Portofolio berhasil diperbarui" };
}

export async function togglePortfolioFeatured(id: number, isFeatured: boolean): Promise<ActionState> {

  try {

    await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);

    await db.update(portfolios).set({ isFeatured }).where(eq(portfolios.id, id));

    await createAuditLog("PORTFOLIO_TOGGLE_FEATURED", id, `Set featured to: ${isFeatured}`);

    revalidatePath("/admin/portfolios", "layout");

    revalidatePath("/");

    return { success: true };

  } catch (error) {

    const message = error instanceof Error ? error.message : "Gagal memperbarui status featured";

    return { success: false, message };

  }

}



export async function deletePortfolio(id: number): Promise<ActionState> {

  try {

    await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);

    await db.delete(portfolios).where(eq(portfolios.id, id));

    await createAuditLog("PORTFOLIO_DELETE", id, `Deleted portfolio ID: ${id}`);

    revalidatePath("/admin/portfolios", "layout");

    revalidatePath("/");

    return { success: true };

  } catch (error) {

    const message = error instanceof Error ? error.message : "Gagal menghapus portofolio";

    return { success: false, message };

  }

}
