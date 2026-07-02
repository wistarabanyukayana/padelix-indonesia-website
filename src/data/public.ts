import {
  brands,
  categories,
  medias,
  portfolioMedias,
  portfolios,
  productMedias,
  products,
  productSpecifications,
  productVariants,
} from "@/db/schema";
import { db } from "@/lib/db";
import { getDisplayUrl, parseMetadata } from "@/lib/utils";
import {
  DBBrand,
  DBCategory,
  DetailedProduct,
  FeaturedPortfolio,
  FeaturedProduct,
  MediaUI,
} from "@/types";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const logPublicError = (scope: string, error: unknown) => {
  console.error(`[PublicData] ${scope} failed`, error);
};

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {

  try {
    const productList = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
        showPrice: products.showPrice,
      })
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.updatedAt));

    if (productList.length === 0) return [];

    const productIds = productList.map((p) => p.id);
    const mediaLinks = await db
      .select({
        productId: productMedias.productId,
        mediaId: productMedias.mediaId,
        isPrimary: productMedias.isPrimary,
        sortOrder: productMedias.sortOrder,
      })
      .from(productMedias)
      .where(inArray(productMedias.productId, productIds))
      .orderBy(desc(productMedias.isPrimary), asc(productMedias.sortOrder));

    const mediaIds = Array.from(
      new Set(mediaLinks.map((link) => link.mediaId)),
    );
    const mediaMap = new Map<
      number,
      { url: string; type: string; metadata: unknown }
    >();
    if (mediaIds.length > 0) {
      const mediaRows = await db
        .select({
          id: medias.id,
          url: medias.url,
          type: medias.type,
          metadata: medias.metadata,
        })
        .from(medias)
        .where(inArray(medias.id, mediaIds));
      mediaRows.forEach((m) => mediaMap.set(m.id, m));
    }

    const productMediaMap = new Map<number, number>();
    mediaLinks.forEach((link) => {
      if (!productMediaMap.has(link.productId)) {
        productMediaMap.set(link.productId, link.mediaId);
      }
    });

    return productList.map((p) => {
      const mediaId = productMediaMap.get(p.id);
      const media = mediaId ? mediaMap.get(mediaId) : undefined;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.basePrice.toString(),
        showPrice: p.showPrice,
        image: media ? getDisplayUrl(media) : "",
      };
    });
  } catch (error) {
    logPublicError("getFeaturedProducts", error);
    return [];
  }
}

export interface PublicStats {
  projects: number;
  products: number;
  brands: number;
}

export async function getPublicStats(): Promise<PublicStats> {

  try {
    const [[projectRow], [productRow], [brandRow]] = await Promise.all([
      db.select({ value: count() }).from(portfolios),
      db
        .select({ value: count() })
        .from(products)
        .where(eq(products.isActive, true)),
      db.select({ value: count() }).from(brands),
    ]);

    return {
      projects: projectRow?.value ?? 0,
      products: productRow?.value ?? 0,
      brands: brandRow?.value ?? 0,
    };
  } catch (error) {
    logPublicError("getPublicStats", error);
    return { projects: 0, products: 0, brands: 0 };
  }
}

export async function getFeaturedPortfolios(): Promise<FeaturedPortfolio[]> {

  try {
    const portfolioList = await db
      .select({
        id: portfolios.id,
        title: portfolios.title,
        slug: portfolios.slug,
        location: portfolios.location,
        description: portfolios.description,
      })
      .from(portfolios)
      .where(
        and(eq(portfolios.isActive, true), eq(portfolios.isFeatured, true)),
      )
      .orderBy(desc(portfolios.updatedAt));

    if (portfolioList.length === 0) return [];

    const portfolioIds = portfolioList.map((p) => p.id);
    const mediaLinks = await db
      .select({
        portfolioId: portfolioMedias.portfolioId,
        mediaId: portfolioMedias.mediaId,
        altText: portfolioMedias.altText,
        isPrimary: portfolioMedias.isPrimary,
        sortOrder: portfolioMedias.sortOrder,
      })
      .from(portfolioMedias)
      .where(inArray(portfolioMedias.portfolioId, portfolioIds))
      .orderBy(desc(portfolioMedias.isPrimary), asc(portfolioMedias.sortOrder));

    const mediaIds = Array.from(
      new Set(mediaLinks.map((link) => link.mediaId)),
    );
    const mediaMap = new Map<
      number,
      { url: string; type: string; metadata: unknown }
    >();
    if (mediaIds.length > 0) {
      const mediaRows = await db
        .select({
          id: medias.id,
          url: medias.url,
          type: medias.type,
          metadata: medias.metadata,
        })
        .from(medias)
        .where(inArray(medias.id, mediaIds));
      mediaRows.forEach((m) => mediaMap.set(m.id, m));
    }

    const portfolioItems = new Map<number, FeaturedPortfolio["medias"]>();
    mediaLinks.forEach((link) => {
      const media = mediaMap.get(link.mediaId);
      if (!media) return;
      const list = portfolioItems.get(link.portfolioId) ?? [];
      list.push({
        id: link.mediaId,
        url: media.url,
        type: media.type as MediaUI["type"],
        metadata: parseMetadata(media.metadata),
        altText: link.altText,
        isPrimary: link.isPrimary,
        sortOrder: link.sortOrder,
      });
      portfolioItems.set(link.portfolioId, list);
    });

    return portfolioList.map((p) => {
      const items = portfolioItems.get(p.id) ?? [];
      const primaryMedia = items.find((img) => img.isPrimary) || items[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        location: p.location,
        description: p.description,
        image: primaryMedia ? getDisplayUrl(primaryMedia) : "",
        medias: items,
      };
    });
  } catch (error) {
    logPublicError("getFeaturedPortfolios", error);
    return [];
  }
}

export async function getAllProducts(options?: {
  query?: string;
  categoryId?: number;
  brandId?: number;
}): Promise<FeaturedProduct[]> {
  const { query, categoryId, brandId } = options || {};
  const normalizedQuery = query ?? "";
  const normalizedCategoryId = categoryId ?? null;
  const normalizedBrandId = brandId ?? null;

  return getAllProductsCached(
    normalizedQuery,
    normalizedCategoryId,
    normalizedBrandId,
  );
}

/**
 * Product counts per category (direct assignment only — roll-ups happen at
 * the call site), faceted by the active search/brand filters.
 */
export async function getCategoryProductCounts(options?: {
  query?: string;
  brandId?: number;
}): Promise<{ categoryId: number | null; count: number }[]> {
  return getCategoryProductCountsCached(
    options?.query ?? "",
    options?.brandId ?? null,
  );
}

async function getCategoryProductCountsCached(
  query: string,
  brandId: number | null,
): Promise<{ categoryId: number | null; count: number }[]> {

  try {
    return await db
      .select({ categoryId: products.categoryId, count: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          query ? ilike(products.name, `%${query}%`) : undefined,
          brandId ? eq(products.brandId, brandId) : undefined,
        ),
      )
      .groupBy(products.categoryId);
  } catch (error) {
    logPublicError("getCategoryProductCounts", error);
    return [];
  }
}

/**
 * Product counts per brand, faceted by the active search/category filters.
 */
export async function getBrandProductCounts(options?: {
  query?: string;
  categoryId?: number;
}): Promise<{ brandId: number | null; count: number }[]> {
  return getBrandProductCountsCached(
    options?.query ?? "",
    options?.categoryId ?? null,
  );
}

async function getBrandProductCountsCached(
  query: string,
  categoryId: number | null,
): Promise<{ brandId: number | null; count: number }[]> {

  try {
    const categoryIds = categoryId
      ? await getDescendantCategoryIds(categoryId)
      : null;

    return await db
      .select({ brandId: products.brandId, count: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          query ? ilike(products.name, `%${query}%`) : undefined,
          categoryIds ? inArray(products.categoryId, categoryIds) : undefined,
        ),
      )
      .groupBy(products.brandId);
  } catch (error) {
    logPublicError("getBrandProductCounts", error);
    return [];
  }
}

/** A category filter matches the category itself plus all its descendants. */
async function getDescendantCategoryIds(categoryId: number): Promise<number[]> {
  const allCategories = await db
    .select({ id: categories.id, parentId: categories.parentId })
    .from(categories);

  const childrenByParent = new Map<number, number[]>();
  allCategories.forEach((c) => {
    if (c.parentId === null) return;
    const siblings = childrenByParent.get(c.parentId) ?? [];
    siblings.push(c.id);
    childrenByParent.set(c.parentId, siblings);
  });

  const ids: number[] = [];
  const queue = [categoryId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    ids.push(id);
    queue.push(...(childrenByParent.get(id) ?? []));
  }
  return ids;
}

async function getAllProductsCached(
  query: string,
  categoryId: number | null,
  brandId: number | null,
): Promise<FeaturedProduct[]> {

  try {
    const categoryIds = categoryId
      ? await getDescendantCategoryIds(categoryId)
      : null;

    const whereClause = and(
      eq(products.isActive, true),
      query ? ilike(products.name, `%${query}%`) : undefined,
      categoryIds ? inArray(products.categoryId, categoryIds) : undefined,
      brandId ? eq(products.brandId, brandId) : undefined,
    );

    const productList = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        basePrice: products.basePrice,
        showPrice: products.showPrice,
      })
      .from(products)
      .where(whereClause);

    if (productList.length === 0) return [];

    const productIds = productList.map((p) => p.id);
    const mediaLinks = await db
      .select({
        productId: productMedias.productId,
        mediaId: productMedias.mediaId,
        isPrimary: productMedias.isPrimary,
        sortOrder: productMedias.sortOrder,
      })
      .from(productMedias)
      .where(inArray(productMedias.productId, productIds))
      .orderBy(desc(productMedias.isPrimary), asc(productMedias.sortOrder));

    const mediaIds = Array.from(
      new Set(mediaLinks.map((link) => link.mediaId)),
    );
    const mediaMap = new Map<
      number,
      { url: string; type: string; metadata: unknown }
    >();
    if (mediaIds.length > 0) {
      const mediaRows = await db
        .select({
          id: medias.id,
          url: medias.url,
          type: medias.type,
          metadata: medias.metadata,
        })
        .from(medias)
        .where(inArray(medias.id, mediaIds));
      mediaRows.forEach((m) => mediaMap.set(m.id, m));
    }

    const productMediaMap = new Map<number, number>();
    mediaLinks.forEach((link) => {
      if (!productMediaMap.has(link.productId)) {
        productMediaMap.set(link.productId, link.mediaId);
      }
    });

    return productList.map((p) => {
      const mediaId = productMediaMap.get(p.id);
      const media = mediaId ? mediaMap.get(mediaId) : undefined;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.basePrice.toString(),
        showPrice: p.showPrice,
        image: media ? getDisplayUrl(media) : "",
      };
    });
  } catch (error) {
    logPublicError("getAllProductsCached", error);
    return [];
  }
}

export async function getCategories(): Promise<DBCategory[]> {

  try {
    return await db.select().from(categories);
  } catch (error) {
    logPublicError("getCategories", error);
    return [];
  }
}

export async function getBrands(): Promise<DBBrand[]> {

  try {
    return await db.select().from(brands);
  } catch (error) {
    logPublicError("getBrands", error);
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<DetailedProduct | null> {
  return getProductBySlugCached(slug);
}

async function getProductBySlugCached(
  slug: string,
): Promise<DetailedProduct | null> {

  try {
    const parentCategories = alias(categories, "parent_categories");

    const productResult = await db
      .select({
        product: products,
        categoryName: categories.name,
        parentCategoryName: parentCategories.name,
        brandName: brands.name,
        brandLogo: brands.logoUrl,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!productResult.length) return null;

    const {
      product: p,
      categoryName,
      parentCategoryName,
      brandName,
      brandLogo,
    } = productResult[0];

    // Fetch all medias
    const items = await db
      .select({
        id: medias.id,
        url: medias.url,
        type: medias.type,
        metadata: medias.metadata,
        altText: productMedias.altText,
        isPrimary: productMedias.isPrimary,
        sortOrder: productMedias.sortOrder,
      })
      .from(productMedias)
      .innerJoin(medias, eq(productMedias.mediaId, medias.id))
      .where(eq(productMedias.productId, p.id))
      .orderBy(desc(productMedias.isPrimary), asc(productMedias.sortOrder));

    // Fetch specs
    const specs = await db
      .select({
        key: productSpecifications.specKey,
        value: productSpecifications.specValue,
      })
      .from(productSpecifications)
      .where(eq(productSpecifications.productId, p.id));

    // Fetch variants
    const variants = await db
      .select({
        id: productVariants.id,
        name: productVariants.name,
        priceAdjustment: productVariants.priceAdjustment,
        sku: productVariants.sku,
        stock: productVariants.stockQuantity,
        isUnlimited: productVariants.isUnlimitedStock,
      })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, p.id),
          eq(productVariants.isActive, true),
        ),
      );

    return {
      ...p,
      categoryName,
      parentCategoryName,
      brandName,
      brandLogo,
      medias: items.map((i) => ({
        id: i.id,
        url: i.url,
        type: i.type as MediaUI["type"],
        metadata: parseMetadata(i.metadata),
        altText: i.altText || p.name,
        isPrimary: i.isPrimary,
        sortOrder: i.sortOrder,
      })),
      specs: specs,
      variants: variants.map((v) => ({
        ...v,
        priceAdjustment: v.priceAdjustment.toString(),
        stock: v.stock.toString(),
      })),
    };
  } catch (error) {
    logPublicError("getProductBySlugCached", error);
    return null;
  }
}
