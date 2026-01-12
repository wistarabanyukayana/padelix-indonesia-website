import { createBrand } from "@/actions/brands";
import { getMedias } from "@/actions/media";
import { BrandForm } from "@/components/admin/BrandForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewBrandPage() {
  await checkPermission(PERMISSIONS.MANAGE_BRANDS);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Brand Baru</h1>
        <Link href="/admin/brands">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>

      <BrandForm action={createBrand} allMedias={allMedias} />
    </div>
  );
}
