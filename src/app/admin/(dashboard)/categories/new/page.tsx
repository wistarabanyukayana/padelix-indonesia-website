import { createCategory } from "@/actions/categories";
import { getMedias } from "@/actions/media";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { AccessDenied } from "@/components/admin/general/AccessDenied";
import { PERMISSIONS } from "@/config/permissions";
import { categories } from "@/db/schema";
import { hasPermission } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewCategoryPage() {
  const allowed = await hasPermission(PERMISSIONS.MANAGE_CATEGORIES);
  if (!allowed) return <AccessDenied />;
  const categoryList = await db.select().from(categories);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="h2 text-neutral-900">Tambah Kategori Baru</h1>
      </div>

      <CategoryForm
        action={createCategory}
        categories={categoryList}
        allMedias={allMedias}
      />
    </div>
  );
}
