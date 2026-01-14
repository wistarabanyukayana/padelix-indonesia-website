import { db } from "@/lib/db";
import { portfolios, portfolioMedias, medias } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { Edit, Plus } from "lucide-react";
import { DeletePortfolioButton } from "@/components/admin/DeletePortfolioButton";
import { FeaturedToggleButton } from "@/components/admin/FeaturedToggleButton";
import { togglePortfolioFeatured } from "@/actions/portfolios";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { getDisplayUrl } from "@/lib/utils";

export default async function AdminPortfoliosPage() {
  await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  const portfolioList = await db.select().from(portfolios).orderBy(desc(portfolios.createdAt));

  const portfoliosWithImages = await Promise.all(
    portfolioList.map(async (p) => {
      const media = await db
        .select({ url: medias.url, type: medias.type, metadata: medias.metadata })
        .from(portfolioMedias)
        .innerJoin(medias, eq(portfolioMedias.mediaId, medias.id))
        .where(and(eq(portfolioMedias.portfolioId, p.id), eq(portfolioMedias.isPrimary, true)))
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
        <h1 className="h2 text-neutral-900">Manajemen Portofolio</h1>
      </div>

      {portfoliosWithImages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-brand border border-neutral-200">
          <p className="text-neutral-400">Belum ada portofolio. Silakan tambah portofolio baru.</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {portfoliosWithImages.map((p) => (
              <div key={p.id} className="relative bg-white rounded-brand border border-neutral-200 shadow-sm overflow-hidden group">
                
                {/* Actions */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                   <FeaturedToggleButton id={p.id} isFeatured={p.isFeatured} onToggle={togglePortfolioFeatured} />
                   <DeletePortfolioButton id={p.id} title={p.title} />
                </div>

                <Link href={`/admin/portfolios/${p.id}/edit`} className="block p-4 active:bg-neutral-50 transition-colors">
                    <div className="flex gap-4 items-start pr-10">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                            {p.imageUrl ? (
                                <AppImage src={p.imageUrl} alt={p.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">No IMG</div>
                            )}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <h3 className="font-bold text-neutral-900 text-base leading-tight line-clamp-2">
                                {p.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    p.isActive ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-500"
                                }`}>
                                    {p.isActive ? "Aktif" : "Draft"}
                                </span>
                                {p.isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Unggulan
                                    </span>
                                )}
                                <span className="text-xs text-neutral-400 truncate">
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
          <div className="hidden md:block bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs w-24">Gambar</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Judul Proyek</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Lokasi</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-center">Unggulan</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-bold text-neutral-900 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {portfoliosWithImages.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                            {p.imageUrl ? (
                              <AppImage src={p.imageUrl} alt={p.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300">No IMG</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-900">
                          {p.title}
                          <div className="text-xs text-neutral-400 font-normal mt-0.5">/{p.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          {p.location}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex justify-center">
                                <FeaturedToggleButton id={p.id} isFeatured={p.isFeatured} onToggle={togglePortfolioFeatured} />
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.isActive ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-800"
                          }`}>
                            {p.isActive ? "Aktif" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/portfolios/${p.id}/edit`}>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
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

      <div className="flex justify-end mt-4">
        <Link href="/admin/portfolios/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah Portofolio</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
