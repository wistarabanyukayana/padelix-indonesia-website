import { getMedias } from "@/actions/media";
import { updatePortfolio } from "@/actions/portfolios";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { PortfolioForm } from "@/components/admin/portofolios/PortfolioForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { medias, portfolioMedias, portfolios } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { MediaUI } from "@/types";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditPortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({
  params,
}: EditPortfolioPageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  if (!allowed) return <AccessDenied />;
  const { id } = await params;
  const portfolioId = parseInt(id);
  if (isNaN(portfolioId)) notFound();

  const portfolioResult = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, portfolioId));
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
    medias: portfolioMediasResult.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type as MediaUI["type"],
      metadata: m.metadata as MediaUI["metadata"],
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      altText: m.altText,
    })),
  };

  const updatePortfolioWithId = updatePortfolio.bind(null, portfolioId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">
          Edit Portofolio: {portfolio.title}
        </h1>
        <Link href="/admin/portfolios" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <PortfolioForm
        action={updatePortfolioWithId}
        initialData={initialData}
        allMedias={allMedias}
      />
    </div>
  );
}
