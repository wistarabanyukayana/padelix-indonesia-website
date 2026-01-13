import { db } from "@/lib/db";
import { portfolios, portfolioMedias, medias } from "@/db/schema";
import { updatePortfolio } from "@/actions/portfolios";
import { getMedias } from "@/actions/media";
import { PortfolioForm } from "@/components/admin/PortfolioForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";
import { MediaUI } from "@/types";

interface EditPortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  const { id } = await params;
  const portfolioId = parseInt(id);
  if (isNaN(portfolioId)) notFound();

  const portfolioResult = await db.select().from(portfolios).where(eq(portfolios.id, portfolioId));
  const portfolio = portfolioResult[0];
  if (!portfolio) notFound();

  const allMedias = await getMedias();

  const portfolioMediasResult = await db
    .select({
        id: medias.id,
        url: medias.url,
        type: medias.type,
        metadata: medias.metadata,
        isPrimary: portfolioMedias.isPrimary,
        sortOrder: portfolioMedias.sortOrder,
        altText: portfolioMedias.altText,
    })
    .from(portfolioMedias)
    .innerJoin(medias, eq(portfolioMedias.mediaId, medias.id))
    .where(eq(portfolioMedias.portfolioId, portfolioId))
    .orderBy(asc(portfolioMedias.sortOrder));

  const initialData = {
    ...portfolio,
    medias: portfolioMediasResult.map(m => ({ 
        id: m.id, 
        url: m.url, 
        type: m.type as MediaUI["type"],
        metadata: m.metadata as MediaUI["metadata"],
        isPrimary: m.isPrimary, 
        sortOrder: m.sortOrder, 
        altText: m.altText 
    })),
  };

  const updatePortfolioWithId = updatePortfolio.bind(null, portfolioId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Edit Portofolio: {portfolio.title}</h1>
        <Link href="/admin/portfolios" className="hidden md:block">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <PortfolioForm action={updatePortfolioWithId} initialData={initialData} allMedias={allMedias} />
    </div>
  );
}
