import { DeleteBrandButton } from "@/components/admin/brands/DeleteBrandButton";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { brands } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, like, or } from "drizzle-orm";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBrandsPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_BRANDS);
  if (!allowed) return <AccessDenied />;
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
  const sortColumn =
    sortMap[sortKey as keyof typeof sortMap] ?? brands.updatedAt;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        like(brands.name, `%${searchQuery}%`),
        like(brands.slug, `%${searchQuery}%`),
      ),
    );
  }

  let brandsQuery = db.select().from(brands).$dynamic();
  if (filters.length) {
    brandsQuery = brandsQuery.where(and(...filters));
  }

  const brandList = await brandsQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Manajemen Brand</h1>
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
        <div className="rounded-brand border border-neutral-200 bg-white py-12 text-center">
          <p className="text-neutral-400">
            Belum ada brand. Silakan tambah brand baru.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {brandList.map((brand) => (
              <div
                key={brand.id}
                className="group relative overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm"
              >
                <div className="absolute top-3 right-3 z-10">
                  <DeleteBrandButton id={brand.id} name={brand.name} />
                </div>

                <Link
                  href={`/admin/brands/${brand.id}/edit`}
                  className="block p-4 transition-colors active:bg-neutral-50"
                >
                  <div className="flex items-center gap-4 pr-10">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-2">
                      {brand.logoUrl ? (
                        <AppImage
                          src={brand.logoUrl}
                          alt={brand.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-xs text-neutral-300">No Logo</div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="truncate text-base leading-tight font-bold text-neutral-900">
                        {brand.name}
                      </h3>
                      <p className="truncate text-xs text-brand-green">
                        {brand.website}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="w-24 px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Logo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Nama Brand
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Website
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {brandList.map((brand) => (
                    <tr
                      key={brand.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 p-1">
                          {brand.logoUrl ? (
                            <AppImage
                              src={brand.logoUrl}
                              alt={brand.name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-[10px] text-neutral-300">
                              No Logo
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        {brand.name}
                        <div className="mt-0.5 text-xs font-normal text-neutral-400">
                          /{brand.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-green">
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {brand.website}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/brands/${brand.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 border-blue-200 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
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

      <div className="mt-4 flex justify-end">
        <Link href="/admin/brands/new">
          <Button
            variant="dark"
            size="sm"
            className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base"
          >
            <Plus size={16} />
            <span>Tambah Brand</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
