import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { updateCategory } from "@/actions/categories";
import { getMedias } from "@/actions/media";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/config/permissions";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await checkPermission(PERMISSIONS.MANAGE_CATEGORIES);
  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) notFound();

  const categoryResult = await db.select().from(categories).where(eq(categories.id, categoryId));
  const category = categoryResult[0];
  if (!category) notFound();

  const categoryList = await db.select().from(categories);
  const allMedias = await getMedias();

  const updateCategoryWithId = updateCategory.bind(null, categoryId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="h2 text-neutral-900">Edit Kategori: {category.name}</h1>
      </div>

      <CategoryForm action={updateCategoryWithId} initialData={category} categories={categoryList} allMedias={allMedias} />
    </div>
  );
}
