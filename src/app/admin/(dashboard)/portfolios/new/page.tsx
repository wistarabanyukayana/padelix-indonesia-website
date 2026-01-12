import { createPortfolio } from "@/actions/portfolios";
import { getMedias } from "@/actions/media";
import { PortfolioForm } from "@/components/admin/PortfolioForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewPortfolioPage() {
  await checkPermission(PERMISSIONS.MANAGE_PORTFOLIOS);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Portofolio Baru</h1>
        <Link href="/admin/portfolios" className="hidden md:block">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <PortfolioForm action={createPortfolio} allMedias={allMedias} />
    </div>
  );
}
