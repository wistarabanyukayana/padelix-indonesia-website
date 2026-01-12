"use server";

import { db } from "@/lib/db";
import { products, productMedias, productVariants, productSpecifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ActionState, MediaPayload, ProductVariantUI, ProductSpecUI } from "@/types";
import { checkPermission, getSession } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { createAuditLog } from "@/lib/audit";

const productMediaSchema = z.object({
  id: z.number(), // The media ID from medias table
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().default(0),
  altText: z.string().nullable().default(null),
});

const productVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().nullable().default(null),
  priceAdjustment: z.union([z.number(), z.string()]),
  stock: z.union([z.number(), z.string()]),
  isUnlimited: z.boolean(),
});

const productSpecSchema = z.object({
  key: z.string().min(1),
  value: z.string().nullable().default(null),
});

const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  isActive: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
  showPrice: z.coerce.boolean(),
  categoryId: z.coerce.number().optional(),
  brandId: z.coerce.number().optional(),
});

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
  } catch {
    return { message: "Anda tidak memiliki izin untuk membuat produk" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    showPrice: formData.get("showPrice") === "true",
    categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
    brandId: formData.get("brandId") ? Number(formData.get("brandId")) : undefined,
  };

  let medias: MediaPayload[] = [];
  let variants: ProductVariantUI[] = [];
  let specs: ProductSpecUI[] = [];

  try {
    medias = z.array(productMediaSchema).parse(JSON.parse(formData.get("medias") as string || "[]"));
    variants = z.array(productVariantSchema).parse(JSON.parse(formData.get("variants") as string || "[]"));
    specs = z.array(productSpecSchema).parse(JSON.parse(formData.get("specs") as string || "[]"));
  } catch {
    return { message: "Format data tambahan tidak valid" };
  }

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data } = validated;
  let newId: number | null = null;

  try {
    const [result] = await db.insert(products).values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        showPrice: data.showPrice,
        categoryId: data.categoryId,
        brandId: data.brandId,
        createdBy: session.user.id, 
    }).$returningId();

    newId = result.id;

    if (medias.length > 0) {
      await db.insert(productMedias).values(
        medias.map((m) => ({
          productId: newId!,
          mediaId: m.id,
          isPrimary: m.isPrimary || false,
          sortOrder: m.sortOrder || 0,
          altText: m.altText,
        }))
      );
    }

    if (variants.length > 0) {
      await db.insert(productVariants).values(
        variants.map((v) => ({
          productId: newId!,
          name: v.name,
          sku: v.sku,
          priceAdjustment: Number(v.priceAdjustment),
          stockQuantity: Number(v.stock),
          isUnlimitedStock: v.isUnlimited,
        }))
      );
    }

    if (specs.length > 0) {
      await db.insert(productSpecifications).values(
        specs.map((s) => ({
          productId: newId!,
          specKey: s.key,
          specValue: s.value,
        }))
      );
    }

    await createAuditLog("PRODUCT_CREATE", newId!, `Created product: ${data.name}`);

  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal membuat produk: " + errorMessage };
  }

  revalidatePath("/admin/products", "layout");
  revalidatePath("/");
  revalidatePath("/products", "layout");
  redirect(`/admin/products/${newId}/edit`);
}

export async function updateProduct(id: number, prevState: ActionState, formData: FormData): Promise<ActionState> {
    const session = await getSession();
    if (!session) return { message: "Sesi berakhir, silakan login kembali" };

    try {
      await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
    } catch {
      return { message: "Anda tidak memiliki izin untuk mengubah produk" };
    }

    const rawData = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        basePrice: formData.get("basePrice"),
        isActive: formData.get("isActive") === "true",
        isFeatured: formData.get("isFeatured") === "true",
        showPrice: formData.get("showPrice") === "true",
        categoryId: formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined,
        brandId: formData.get("brandId") ? Number(formData.get("brandId")) : undefined,
      };
    
      let medias: MediaPayload[] = [];
      let variants: ProductVariantUI[] = [];
      let specs: ProductSpecUI[] = [];
    
      try {
        medias = z.array(productMediaSchema).parse(JSON.parse(formData.get("medias") as string || "[]"));
        variants = z.array(productVariantSchema).parse(JSON.parse(formData.get("variants") as string || "[]"));
        specs = z.array(productSpecSchema).parse(JSON.parse(formData.get("specs") as string || "[]"));
      } catch {
        return { message: "Format data tambahan tidak valid" };
      }
    
      const validated = productSchema.safeParse(rawData);
    
      if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
      }
    
      const { data } = validated;
    
      try {
        await db.update(products).set({
            name: data.name,
            slug: data.slug,
            description: data.description,
            basePrice: data.basePrice,
            isActive: data.isActive,
            isFeatured: data.isFeatured,
            showPrice: data.showPrice,
            categoryId: data.categoryId,
            brandId: data.brandId,
        }).where(eq(products.id, id));
    
        await db.delete(productMedias).where(eq(productMedias.productId, id));
        if (medias.length > 0) {
          await db.insert(productMedias).values(
            medias.map((m) => ({
              productId: id,
              mediaId: m.id,
              isPrimary: m.isPrimary || false,
              sortOrder: m.sortOrder || 0,
              altText: m.altText,
            }))
          );
        }
    
        await db.delete(productVariants).where(eq(productVariants.productId, id));
        if (variants.length > 0) {
          await db.insert(productVariants).values(
            variants.map((v) => ({
              productId: id,
              name: v.name,
              sku: v.sku,
              priceAdjustment: Number(v.priceAdjustment),
              stockQuantity: Number(v.stock),
              isUnlimitedStock: v.isUnlimited,
            }))
          );
        }
    
        await db.delete(productSpecifications).where(eq(productSpecifications.productId, id));
        if (specs.length > 0) {
          await db.insert(productSpecifications).values(
            specs.map((s) => ({
              productId: id,
              specKey: s.key,
              specValue: s.value,
            }))
                );
              }
          
              await createAuditLog("PRODUCT_UPDATE", id, `Updated product: ${data.name}`);
          
            } catch (error: unknown) {
          
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
              return { message: "Gagal mengupdate produk: " + errorMessage };
            }
            
            revalidatePath("/admin/products", "layout");
    revalidatePath("/");
    revalidatePath("/products", "layout");
            return { success: true, message: "Produk berhasil diperbarui" };
        }
export async function toggleProductFeatured(id: number, isFeatured: boolean): Promise<ActionState> {
  try {
    await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
    await db.update(products).set({ isFeatured }).where(eq(products.id, id));
    await createAuditLog("PRODUCT_TOGGLE_FEATURED", id, `Set featured to: ${isFeatured}`);
    revalidatePath("/admin/products", "layout");
    revalidatePath("/");
    revalidatePath("/products", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui status featured";
    return { success: false, message };
  }
}

export async function deleteProduct(id: number): Promise<ActionState> {
  try {
    await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
    await db.delete(products).where(eq(products.id, id));
    await createAuditLog("PRODUCT_DELETE", id, `Deleted product ID: ${id}`);
    revalidatePath("/admin/products", "layout");
    revalidatePath("/");
    revalidatePath("/products", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus produk";
    return { success: false, message };
  }
}