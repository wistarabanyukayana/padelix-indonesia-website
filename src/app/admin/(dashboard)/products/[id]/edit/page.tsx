import { getMedias } from "@/actions/media";
import { updateProduct } from "@/actions/products";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import {
  brands,
  categories,
  medias,
  productMedias,
  products,
  productSpecifications,
  productVariants,
} from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { MediaMetadata, MediaUI } from "@/types";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PRODUCTS);
  if (!allowed) return <AccessDenied />;
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  // Fetch Product
  const productResult = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  const product = productResult[0];
  if (!product) notFound();

  // Fetch Dependencies
  const categoryList = await db.select().from(categories);
  const brandList = await db.select().from(brands);
  const allMedias = await getMedias();

  // Fetch Relations (Medias)
  const productMediasResult = await db
    .select({
      id: medias.id,
      url: medias.url,
      type: medias.type,
      metadata: medias.metadata,
      isPrimary: productMedias.isPrimary,
      sortOrder: productMedias.sortOrder,
      altText: productMedias.altText,
    })
    .from(productMedias)
    .innerJoin(medias, eq(productMedias.mediaId, medias.id))
    .where(eq(productMedias.productId, productId))
    .orderBy(asc(productMedias.sortOrder));

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const specs = await db
    .select()
    .from(productSpecifications)
    .where(eq(productSpecifications.productId, productId));

  // Shape data for form
  const initialData = {
    ...product,
    medias: productMediasResult.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type as MediaUI["type"],
      metadata: m.metadata as MediaMetadata,
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      altText: m.altText,
    })) as MediaUI[],
    variants: variants.map((v) => ({
      name: v.name,
      sku: v.sku,
      priceAdjustment: v.priceAdjustment,
      stock: v.stockQuantity,
      isUnlimited: v.isUnlimitedStock,
    })),
    specs: specs.map((s) => ({ key: s.specKey, value: s.specValue })),
  };

  const updateProductWithId = updateProduct.bind(null, productId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Edit Produk: {product.name}</h1>
        <Link href="/admin/products" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <ProductForm
        action={updateProductWithId}
        initialData={initialData}
        categories={categoryList}
        brands={brandList}
        allMedias={allMedias}
      />
    </div>
  );
}
