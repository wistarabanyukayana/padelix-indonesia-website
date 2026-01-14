import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, FolderTree } from "lucide-react";
import { checkPermission } from "@/lib/auth";

import { CategoryTreeNode, DBCategory } from "@/types";
import { PERMISSIONS } from "@/config/permissions";
import { CategoryList } from "@/components/admin/CategoryList";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  await checkPermission(PERMISSIONS.MANAGE_CATEGORIES);
  const allCategories: DBCategory[] = await db.select().from(categories);
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const rawSort = typeof params.sort === "string" ? params.sort : "updated";
  const rawDir = typeof params.dir === "string" ? params.dir : "desc";
  const searchQuery = rawQuery.trim();
  const sortKey = rawSort;
  const sortDir = rawDir === "asc" ? "asc" : "desc";

  const normalizeDate = (value: Date | string | null) => {
    if (!value) return 0;
    const raw = value instanceof Date ? value.toISOString() : value;
    const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(normalized).getTime();
  };

  const matchesSearch = (category: DBCategory) => {
    if (!searchQuery) return true;
    const lowered = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(lowered) ||
      category.slug.toLowerCase().includes(lowered)
    );
  };

  const getSortValue = (category: DBCategory) => {
    switch (sortKey) {
      case "name":
        return category.name.toLowerCase();
      case "created":
        return normalizeDate(category.createdAt);
      case "updated":
      default:
        return normalizeDate(category.updatedAt);
    }
  };

  const compareNodes = (a: DBCategory, b: DBCategory) => {
    const valueA = getSortValue(a);
    const valueB = getSortValue(b);
    if (valueA < valueB) return sortDir === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDir === "asc" ? 1 : -1;
    return 0;
  };

  // Build recursive tree structure
  const buildTree = (parentId: number | null = null): CategoryTreeNode[] => {
    const nodes = allCategories
      .filter(c => c.parentId === parentId)
      .map(c => ({
        ...c,
        level: 0, 
        children: buildTree(c.id)
      }))
      .filter((node) => matchesSearch(node) || node.children.length > 0)
      .sort((a, b) => compareNodes(a, b));

    return nodes;
  };

  const categoryTree = buildTree(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="h2 text-neutral-900">Struktur Kategori</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-1">
            <FolderTree size={14} /> Kelola hierarki kategori produk Anda
          </p>
        </div>
      </div>
      <div
        className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-neutral-50/95 backdrop-blur border-b border-neutral-200"
        style={{ top: "var(--app-header-height, 0px)" }}
      >
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari kategori..."
              className="w-full rounded border border-neutral-200 px-3 py-2 text-sm"
            />
            <Button type="submit" variant="outline" size="sm">
              Cari
            </Button>
          </div>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sortKey}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="updated">Terakhir Diubah</option>
              <option value="created">Tanggal Dibuat</option>
              <option value="name">Nama</option>
            </select>
            <select
              name="dir"
              defaultValue={sortDir}
              className="rounded border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </form>
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
