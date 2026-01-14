import { db } from "@/lib/db";
import { brands } from "@/db/schema";
import { desc, like, or, asc, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { Edit, Plus } from "lucide-react";
import { DeleteBrandButton } from "@/components/admin/DeleteBrandButton";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBrandsPage({ searchParams }: PageProps) {
  await checkPermission(PERMISSIONS.MANAGE_BRANDS);
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "updated";
  const rawDir = typeof params.dir === "string" ? params.dir : "desc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const sortMap = {
    updated: brands.updatedAt,
    created: brands.createdAt,
    name: brands.name,
  };
  const sortColumn = sortMap[sortKey as keyof typeof sortMap] ?? brands.updatedAt;

  const filters = [];
  if (searchQuery) {
    filters.push(or(like(brands.name, `%${searchQuery}%`), like(brands.slug, `%${searchQuery}%`)));
  }

  let brandsQuery = db.select().from(brands).$dynamic();
  if (filters.length) {
    brandsQuery = brandsQuery.where(and(...filters));
  }

  const brandList = await brandsQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Manajemen Brand</h1>
      </div>
      <div
        className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-neutral-50/95 backdrop-blur border-b border-neutral-200"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari brand..."
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

      {brandList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada brand. Silakan tambah brand baru.</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {brandList.map((brand) => (
              <div key={brand.id} className="relative bg-white rounded-brand border border-neutral-200 shadow-sm overflow-hidden group">
                <div className="absolute top-3 right-3 z-10">
                   <DeleteBrandButton id={brand.id} name={brand.name} />
                </div>

                <Link href={`/admin/brands/${brand.id}/edit`} className="block p-4 active:bg-neutral-50 transition-colors">
                    <div className="flex gap-4 items-center pr-10">
                        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center p-2">
                            {brand.logoUrl ? (
                                <AppImage src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
                            ) : (
                                <div className="text-neutral-300 text-xs">No Logo</div>
                            )}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <h3 className="font-bold text-neutral-900 text-base leading-tight truncate">
                                {brand.name}
                            </h3>
                            <p className="text-xs text-brand-green truncate">{brand.website}</p>
                        </div>
                    </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs w-24">Logo</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Nama Brand</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Website</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {brandList.map((brand) => (
                      <tr key={brand.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center p-1">
                            {brand.logoUrl ? (
                              <AppImage src={brand.logoUrl} alt={brand.name} fill className="object-contain" />
                            ) : (
                              <div className="text-neutral-300 text-[10px]">No Logo</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900">
                          {brand.name}
                          <div className="text-xs text-neutral-400 font-normal mt-0.5">/{brand.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-brand-green">
                          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {brand.website}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/brands/${brand.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <DeleteBrandButton id={brand.id} name={brand.name} />
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
        <Link href="/admin/brands/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah Brand</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
