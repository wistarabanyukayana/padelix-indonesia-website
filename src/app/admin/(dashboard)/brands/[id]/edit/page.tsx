import { updateBrand } from "@/actions/brands";
import { getMedias } from "@/actions/media";
import { BrandForm } from "@/components/admin/brands/BrandForm";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { PERMISSIONS } from "@/config/permissions";
import { brands } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_BRANDS);
  if (!allowed) return <AccessDenied />;
  const { id } = await params;
  const brandId = parseInt(id);
  if (isNaN(brandId)) notFound();

  const brandResult = await db
    .select()
    .from(brands)
    .where(eq(brands.id, brandId));
  const brand = brandResult[0];
  if (!brand) notFound();

  const allMedias = await getMedias();

  const updateBrandWithId = updateBrand.bind(null, brandId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Edit Brand: {brand.name}</h1>
      </div>

      <BrandForm
        action={updateBrandWithId}
        initialData={brand}
        allMedias={allMedias}
      />
    </div>
  );
}
