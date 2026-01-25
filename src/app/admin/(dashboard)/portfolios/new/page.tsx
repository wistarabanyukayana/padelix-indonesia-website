import { getMedias } from "@/actions/media";
import { createPortfolio } from "@/actions/portfolios";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { PortfolioForm } from "@/components/admin/portofolios/PortfolioForm";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { hasPermission } from "@/lib/auth";
import Link from "next/link";

export default async function NewPortfolioPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  if (!allowed) return <AccessDenied />;
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Portofolio Baru</h1>
        <Link href="/admin/portfolios" className="hidden md:block">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <PortfolioForm action={createPortfolio} allMedias={allMedias} />
    </div>
  );
}
