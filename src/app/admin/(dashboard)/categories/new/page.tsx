import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { createCategory } from "@/actions/categories";
import { getMedias } from "@/actions/media";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

export default async function NewCategoryPage() {
  await checkPermission(PERMISSIONS.MANAGE_CATEGORIES);
  const categoryList = await db.select().from(categories);
  const allMedias = await getMedias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Tambah Kategori Baru</h1>
      </div>

      <CategoryForm action={createCategory} categories={categoryList} allMedias={allMedias} />
    </div>
  );
}
