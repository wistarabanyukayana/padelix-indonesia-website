import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { checkPermission } from "@/lib/auth";

import { CategoryTreeNode, DBCategory } from "@/types";
import { PERMISSIONS } from "@/config/permissions";
import { CategoryList } from "@/components/admin/CategoryList";

export default async function AdminCategoriesPage() {
  await checkPermission(PERMISSIONS.MANAGE_CATEGORIES);
  const allCategories: DBCategory[] = await db.select().from(categories);

  // Build recursive tree structure
  const buildTree = (parentId: number | null = null): CategoryTreeNode[] => {
    return allCategories
      .filter(c => c.parentId === parentId)
      .map(c => ({
        ...c,
        level: 0, 
        children: buildTree(c.id)
      }));
  };

  const categoryTree = buildTree(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <h1 className="h2 text-neutral-900">Struktur Kategori</h1>
            <p className="text-sm text-neutral-500 flex items-center gap-1">
                <FolderTree size={14} /> Kelola hierarki kategori produk Anda
            </p>
        </div>
      </div>

      <CategoryList data={categoryTree} />

      <div className="flex justify-end mt-4">
        <Link href="/admin/categories/new">
          <Button variant="dark" size="sm" className="flex items-center gap-2 shadow-lg sm:px-6 sm:py-3 sm:text-base">
            <Plus size={16} />
            <span>Tambah Kategori</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
