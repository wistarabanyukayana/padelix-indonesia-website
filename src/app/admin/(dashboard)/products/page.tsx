import { toggleProductFeatured } from "@/actions/products";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { FeaturedToggleButton } from "@/components/admin/general/FeaturedToggleButton";
import { DeleteProductButton } from "@/components/admin/products/DeleteProductButton";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { categories, medias, productMedias, products } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayUrl } from "@/lib/utils";
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PRODUCTS);
  if (!allowed) return <AccessDenied />;
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "updated";
  const rawDir = typeof params.dir === "string" ? params.dir : "desc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const sortMap = {
    updated: products.updatedAt,
    created: products.createdAt,
    name: products.name,
    price: products.basePrice,
  };
  const sortColumn =
    sortMap[sortKey as keyof typeof sortMap] ?? products.updatedAt;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        ilike(products.name, `%${searchQuery}%`),
        ilike(products.slug, `%${searchQuery}%`),
      ),
    );
  }

  let productsQuery = db
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
    .$dynamic();

  if (filters.length) {
    productsQuery = productsQuery.where(and(...filters));
  }

  const productList = await productsQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn),
  );

  const primaryMedias = productList.length
    ? await db
        .select({
          productId: productMedias.productId,
          url: medias.url,
          type: medias.type,
          metadata: medias.metadata,
        })
        .from(productMedias)
        .innerJoin(medias, eq(productMedias.mediaId, medias.id))
        .where(
          and(
            inArray(
              productMedias.productId,
              productList.map((product) => product.id),
            ),
            eq(productMedias.isPrimary, true),
          ),
        )
        .orderBy(asc(productMedias.productId), asc(productMedias.id))
    : [];
  const imageByProductId = new Map<number, string>();
  for (const media of primaryMedias) {
    if (!imageByProductId.has(media.productId)) {
      imageByProductId.set(media.productId, getDisplayUrl(media));
    }
  }
  const productsWithImages = productList.map((product) => ({
    ...product,
    imageUrl: imageByProductId.get(product.id) ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Manajemen Produk</h1>
      </div>
      <div
        className="sticky z-30 -mx-4 border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari produk..."
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm"
            />
            <Button type="submit" variant="outline" size="sm">
              Cari
            </Button>
          </div>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sortKey}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="updated">Terakhir Diubah</option>
              <option value="created">Tanggal Dibuat</option>
              <option value="name">Nama</option>
              <option value="price">Harga</option>
            </select>
            <select
              name="dir"
              defaultValue={sortDir}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </form>
      </div>

      {productsWithImages.length === 0 ? (
        <div className="rounded-brand border border-neutral-200 bg-white py-12 text-center">
          <p className="text-neutral-400">
            Belum ada produk. Silakan tambah produk baru.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View (Clickable Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {productsWithImages.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm"
              >
                {/* Actions (Absolute Top Right) */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  <FeaturedToggleButton
                    id={product.id}
                    isFeatured={product.isFeatured}
                    onToggle={toggleProductFeatured}
                  />
                  <DeleteProductButton id={product.id} name={product.name} />
                </div>

                {/* Main Click Area -> Edit Page */}
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="block p-4 transition-colors active:bg-neutral-50"
                >
                  <div className="flex items-start gap-4 pr-10">
                    {" "}
                    {/* pr-10 to avoid overlap with actions */}
                    {/* Image */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                      {product.imageUrl ? (
                        <AppImage
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">
                          No IMG
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-2 text-base leading-tight font-bold text-neutral-900">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {product.isActive ? "Aktif" : "Draft"}
                        </span>
                        {product.isFeatured && (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-800 uppercase">
                            Homepage
                          </span>
                        )}
                        <span className="truncate text-xs text-neutral-400">
                          {product.categoryName}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-bold text-brand-green">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(Number(product.basePrice))}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Gambar
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Nama Produk
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Homepage
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Harga Dasar
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {productsWithImages.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          {product.imageUrl ? (
                            <AppImage
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                              No IMG
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {product.name}
                        <div className="mt-0.5 text-xs font-normal text-neutral-400">
                          /{product.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.categoryName || (
                          <span className="text-neutral-400 italic">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <FeaturedToggleButton
                            id={product.id}
                            isFeatured={product.isFeatured}
                            onToggle={toggleProductFeatured}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(Number(product.basePrice))}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-none text-neutral-600 shadow-none hover:bg-neutral-100"
                            >
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <DeleteProductButton
                            id={product.id}
                            name={product.name}
                          />
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

      <div className="mt-4 flex justify-end">
        <Link href="/admin/products/new">
          <Button
            variant="dark"
            size="sm"
            className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base"
          >
            <Plus size={16} />
            <span>Tambah Produk</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
