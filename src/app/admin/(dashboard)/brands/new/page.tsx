import { createBrand } from "@/actions/brands";
import { getMedias } from "@/actions/media";
import { BrandForm } from "@/components/admin/brands/BrandForm";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/config/permissions";
import { hasPermission } from "@/lib/auth";
import Link from "next/link";

export default async function NewBrandPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_BRANDS);
  if (!allowed) return <AccessDenied />;
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Brand Baru</h1>
        <Link href="/admin/brands">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <BrandForm action={createBrand} allMedias={allMedias} />
    </div>
  );
}
