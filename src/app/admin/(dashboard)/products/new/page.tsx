import { getMedias } from "@/actions/media";
import { createProduct } from "@/actions/products";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { brands, categories } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function NewProductPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PRODUCTS);
  if (!allowed) return <AccessDenied />;
  const categoryList = await db.select().from(categories);
  const brandList = await db.select().from(brands);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Produk Baru</h1>
        <Link href="/admin/products" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <ProductForm
        action={createProduct}
        categories={categoryList}
        brands={brandList}
        allMedias={allMedias}
      />
    </div>
  );
}
