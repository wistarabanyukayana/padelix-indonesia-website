import { db } from "@/lib/db";
import { products, productMedias, categories, medias } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { Edit, Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { FeaturedToggleButton } from "@/components/admin/FeaturedToggleButton";
import { toggleProductFeatured } from "@/actions/products";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { getDisplayUrl } from "@/lib/utils";

export default async function AdminProductsPage() {
  await checkPermission(PERMISSIONS.MANAGE_PRODUCTS);
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const productsWithImages = await Promise.all(
    productList.map(async (p) => {
      const media = await db
        .select({ url: medias.url, type: medias.type, metadata: medias.metadata })
        .from(productMedias)
        .innerJoin(medias, eq(productMedias.mediaId, medias.id))
        .where(and(eq(productMedias.productId, p.id), eq(productMedias.isPrimary, true)))
        .limit(1);
        
      return {
        ...p,
        imageUrl: media[0] ? getDisplayUrl(media[0]) : "",
      };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Manajemen Produk</h1>
      </div>

      {productsWithImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada produk. Silakan tambah produk baru.</p>
        </div>
      ) : (
        <>
          {/* Mobile View (Clickable Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {productsWithImages.map((product) => (
              <div key={product.id} className="relative bg-white rounded-brand border border-neutral-200 shadow-sm overflow-hidden group">
                
                {/* Actions (Absolute Top Right) */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                   <FeaturedToggleButton id={product.id} isFeatured={product.isFeatured} onToggle={toggleProductFeatured} />
                   <DeleteProductButton id={product.id} name={product.name} />
                </div>

                {/* Main Click Area -> Edit Page */}
                <Link href={`/admin/products/${product.id}/edit`} className="block p-4 active:bg-neutral-50 transition-colors">
                    <div className="flex gap-4 items-start pr-10"> {/* pr-10 to avoid overlap with actions */}
                        {/* Image */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                            {product.imageUrl ? (
                                <AppImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">No IMG</div>
                            )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <h3 className="font-bold text-neutral-900 text-base leading-tight line-clamp-2">
                                {product.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    product.isActive ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-500"
                                }`}>
                                    {product.isActive ? "Aktif" : "Draft"}
                                </span>
                                {product.isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Unggulan
                                    </span>
                                )}
                                <span className="text-xs text-neutral-400 truncate">
                                    {product.categoryName}
                                </span>
                            </div>
                            <div className="text-sm font-bold text-brand-green mt-1">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.basePrice))}
                            </div>
                        </div>
                    </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Gambar</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Nama Produk</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Kategori</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-center">Unggulan</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Harga Dasar</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {productsWithImages.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                            {product.imageUrl ? (
                              <AppImage src={product.imageUrl} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                No IMG
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900">
                          {product.name}
                          <div className="text-xs text-neutral-400 font-normal mt-0.5">/{product.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          {product.categoryName || <span className="text-neutral-400 italic">Uncategorized</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex justify-center">
                                <FeaturedToggleButton id={product.id} isFeatured={product.isFeatured} onToggle={toggleProductFeatured} />
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.basePrice))}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm" className="border-none shadow-none hover:bg-neutral-100 text-neutral-600">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <DeleteProductButton id={product.id} name={product.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end mt-4">
        <Link href="/admin/products/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah Produk</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
