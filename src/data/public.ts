import { db } from "@/lib/db";
import { products, productMedias, productSpecifications, portfolios, portfolioMedias, productVariants, categories, brands, medias } from "@/db/schema";
import { eq, and, desc, like } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { 
  FeaturedProduct, 
  FeaturedPortfolio, 
  DetailedProduct, 
  DBCategory, 
  DBBrand,
  MediaUI
} from "@/types";
import { getDisplayUrl, parseMetadata } from "@/lib/utils";

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
    .limit(3);

  const results: FeaturedProduct[] = [];

  for (const p of productList) {
    const media = await db
      .select({ 
        url: medias.url,
        type: medias.type,
        metadata: medias.metadata
      })
      .from(productMedias)
      .innerJoin(medias, eq(productMedias.mediaId, medias.id))
      .where(and(eq(productMedias.productId, p.id), eq(productMedias.isPrimary, true)))
      .limit(1);

    results.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.basePrice.toString(),
      showPrice: p.showPrice,
      image: media[0] ? getDisplayUrl(media[0]) : "",
    });
  }

  return results;
}

export async function getFeaturedPortfolios(): Promise<FeaturedPortfolio[]> {
  const portfolioList = await db
    .select({
      id: portfolios.id,
      title: portfolios.title,
      slug: portfolios.slug,
      location: portfolios.location,
      description: portfolios.description,
    })
    .from(portfolios)
    .where(and(eq(portfolios.isActive, true), eq(portfolios.isFeatured, true)))
    .limit(3);

  const results: FeaturedPortfolio[] = [];

  for (const p of portfolioList) {
    const items = await db
      .select({ 
        id: medias.id,
        url: medias.url, 
        type: medias.type,
        metadata: medias.metadata,
        altText: portfolioMedias.altText, 
        isPrimary: portfolioMedias.isPrimary,
        sortOrder: portfolioMedias.sortOrder
      })
      .from(portfolioMedias)
      .innerJoin(medias, eq(portfolioMedias.mediaId, medias.id))
      .where(eq(portfolioMedias.portfolioId, p.id))
      .orderBy(desc(portfolioMedias.isPrimary), desc(portfolioMedias.sortOrder));

    const primaryMedia = items.find(img => img.isPrimary) || items[0];

    results.push({
      id: p.id,
      title: p.title,
      slug: p.slug,
      location: p.location,
      description: p.description,
      image: primaryMedia ? getDisplayUrl(primaryMedia) : "",
      medias: items.map(item => ({ 
        id: item.id,
        url: item.url, 
        type: item.type as MediaUI["type"],
        metadata: parseMetadata(item.metadata),
        altText: item.altText,
        isPrimary: item.isPrimary,
        sortOrder: item.sortOrder
      })),
    });
  }

  return results;
}

export async function getAllProducts(options?: { query?: string; categoryId?: number; brandId?: number }): Promise<FeaturedProduct[]> {
  const { query, categoryId, brandId } = options || {};

  const whereClause = and(
    eq(products.isActive, true),
    query ? like(products.name, `%${query}%`) : undefined,
    categoryId ? eq(products.categoryId, categoryId) : undefined,
    brandId ? eq(products.brandId, brandId) : undefined
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

  const results: FeaturedProduct[] = [];

  for (const p of productList) {
    const media = await db
      .select({ 
        url: medias.url,
        type: medias.type,
        metadata: medias.metadata
      })
      .from(productMedias)
      .innerJoin(medias, eq(productMedias.mediaId, medias.id))
      .where(and(eq(productMedias.productId, p.id), eq(productMedias.isPrimary, true)))
      .limit(1);

    results.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.basePrice.toString(),
      showPrice: p.showPrice,
      image: media[0] ? getDisplayUrl(media[0]) : "",
    });
  }

  return results;
}

export async function getCategories(): Promise<DBCategory[]> {
  return await db.select().from(categories);
}

export async function getBrands(): Promise<DBBrand[]> {
  return await db.select().from(brands);
}

export async function getProductBySlug(slug: string): Promise<DetailedProduct | null> {
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

  const { product: p, categoryName, parentCategoryName, brandName, brandLogo } = productResult[0];

  // Fetch all medias
  const items = await db
    .select({ 
        id: medias.id,
        url: medias.url, 
        type: medias.type,
        metadata: medias.metadata,
        altText: productMedias.altText, 
        isPrimary: productMedias.isPrimary,
        sortOrder: productMedias.sortOrder
    })
    .from(productMedias)
    .innerJoin(medias, eq(productMedias.mediaId, medias.id))
    .where(eq(productMedias.productId, p.id))
    .orderBy(desc(productMedias.isPrimary), desc(productMedias.sortOrder));

  // Fetch specs
  const specs = await db
    .select({ key: productSpecifications.specKey, value: productSpecifications.specValue })
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
    .where(and(eq(productVariants.productId, p.id), eq(productVariants.isActive, true)));

  return {
    ...p,
    categoryName,
    parentCategoryName,
    brandName,
    brandLogo,
    medias: items.map(i => ({ 
        id: i.id,
        url: i.url, 
        type: i.type as MediaUI["type"],
        metadata: parseMetadata(i.metadata),
        altText: i.altText || p.name, 
        isPrimary: i.isPrimary,
        sortOrder: i.sortOrder
    })),
    specs: specs,
    variants: variants.map(v => ({
      ...v,
      priceAdjustment: v.priceAdjustment.toString(),
      stock: v.stock.toString(),
    })),
  };
}