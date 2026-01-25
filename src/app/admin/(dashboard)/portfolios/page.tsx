import { togglePortfolioFeatured } from "@/actions/portfolios";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { FeaturedToggleButton } from "@/components/admin/general/FeaturedToggleButton";
import { DeletePortfolioButton } from "@/components/admin/portofolios/DeletePortfolioButton";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { medias, portfolioMedias, portfolios } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDisplayUrl } from "@/lib/utils";
import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPortfoliosPage({ searchParams }: PageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  if (!allowed) return <AccessDenied />;
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "updated";
  const rawDir = typeof params.dir === "string" ? params.dir : "desc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const sortMap = {
    updated: portfolios.updatedAt,
    created: portfolios.createdAt,
    name: portfolios.title,
  };
  const sortColumn =
    sortMap[sortKey as keyof typeof sortMap] ?? portfolios.updatedAt;

  const filters = [];
  if (searchQuery) {
    filters.push(
      or(
        like(portfolios.title, `%${searchQuery}%`),
        like(portfolios.slug, `%${searchQuery}%`),
      ),
    );
  }

  let portfoliosQuery = db.select().from(portfolios).$dynamic();
  if (filters.length) {
    portfoliosQuery = portfoliosQuery.where(and(...filters));
  }

  const portfolioList = await portfoliosQuery.orderBy(
    sortDir === "asc" ? asc(sortColumn) : desc(sortColumn),
  );

  const portfoliosWithImages = await Promise.all(
    portfolioList.map(async (p) => {
      const media = await db
        .select({
          url: medias.url,
          type: medias.type,
          metadata: medias.metadata,
        })
        .from(portfolioMedias)
        .innerJoin(medias, eq(portfolioMedias.mediaId, medias.id))
        .where(
          and(
            eq(portfolioMedias.portfolioId, p.id),
            eq(portfolioMedias.isPrimary, true),
          ),
        )
        .limit(1);

      return {
        ...p,
        imageUrl: media[0] ? getDisplayUrl(media[0]) : "",
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="h2 text-neutral-900">Manajemen Portofolio</h1>
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
              placeholder="Cari portofolio..."
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

      {portfoliosWithImages.length === 0 ? (
        <div className="rounded-brand border border-neutral-200 bg-white py-12 text-center">
          <p className="text-neutral-400">
            Belum ada portofolio. Silakan tambah portofolio baru.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {portfoliosWithImages.map((p) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm"
              >
                {/* Actions */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                  <FeaturedToggleButton
                    id={p.id}
                    isFeatured={p.isFeatured}
                    onToggle={togglePortfolioFeatured}
                  />
                  <DeletePortfolioButton id={p.id} title={p.title} />
                </div>

                <Link
                  href={`/admin/portfolios/${p.id}/edit`}
                  className="block p-4 transition-colors active:bg-neutral-50"
                >
                  <div className="flex items-start gap-4 pr-10">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                      {p.imageUrl ? (
                        <AppImage
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">
                          No IMG
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-2 text-base leading-tight font-bold text-neutral-900">
                        {p.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            p.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {p.isActive ? "Aktif" : "Draft"}
                        </span>
                        {p.isFeatured && (
                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-800 uppercase">
                            Homepage
                          </span>
                        )}
                        <span className="truncate text-xs text-neutral-400">
                          {p.location}
                        </span>
                      </div>
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
                      Gambar
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Judul Proyek
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Lokasi
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-neutral-900 uppercase">
                      Homepage
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
                  {portfoliosWithImages.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          {p.imageUrl ? (
                            <AppImage
                              src={p.imageUrl}
                              alt={p.title}
                              fill
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
                        {p.title}
                        <div className="mt-0.5 text-xs font-normal text-neutral-400">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">{p.location}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <FeaturedToggleButton
                            id={p.id}
                            isFeatured={p.isFeatured}
                            onToggle={togglePortfolioFeatured}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          {p.isActive ? "Aktif" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/portfolios/${p.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 border-blue-200 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit size={16} />
                            </Button>
                          </Link>
                          <DeletePortfolioButton id={p.id} title={p.title} />
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
        <Link href="/admin/portfolios/new">
          <Button
            variant="dark"
            size="sm"
            className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base"
          >
            <Plus size={16} />
            <span>Tambah Portofolio</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
