import { db } from "@/lib/db";
import { categories, brands } from "@/db/schema";
import { createProduct } from "@/actions/products";
import { getMedias } from "@/actions/media";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewProductPage() {
  await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
  const categoryList = await db.select().from(categories);
  const brandList = await db.select().from(brands);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Produk Baru</h1>
        <Link href="/admin/products" className="hidden md:block">
          <Button variant="outline">Batal</Button>
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
