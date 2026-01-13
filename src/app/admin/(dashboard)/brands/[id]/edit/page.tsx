import { db } from "@/lib/db";
import { brands } from "@/db/schema";
import { updateBrand } from "@/actions/brands";
import { getMedias } from "@/actions/media";
import { BrandForm } from "@/components/admin/BrandForm";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  await checkPermission(PERMISSIONS.MANAGE_BRANDS);
  const { id } = await params;
  const brandId = parseInt(id);
  if (isNaN(brandId)) notFound();

  const brandResult = await db.select().from(brands).where(eq(brands.id, brandId));
  const brand = brandResult[0];
  if (!brand) notFound();

  const allMedias = await getMedias();

  const updateBrandWithId = updateBrand.bind(null, brandId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Edit Brand: {brand.name}</h1>
      </div>

      <BrandForm action={updateBrandWithId} initialData={brand} allMedias={allMedias} />
    </div>
  );
}
