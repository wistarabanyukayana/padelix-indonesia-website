"use client";

import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { CategoryTreeNode } from "@/types";
import { ChevronDown, ChevronRight, Edit, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CategoryList({ data }: { data: CategoryTreeNode[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-brand border border-neutral-200 bg-white py-20 text-center shadow-sm">
        <Folder className="mx-auto mb-4 text-neutral-200" size={48} />
        <p className="text-neutral-400">Belum ada kategori yang dibuat.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-brand border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col">
        {data.map((node) => (
          <CategoryItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

function CategoryItem({
  node,
  level = 0,
}: {
  node: CategoryTreeNode;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div className="group relative flex items-center border-b border-neutral-100 transition-colors hover:bg-neutral-50">
        <Link
          href={`/admin/categories/${node.id}/edit`}
          className="absolute inset-0 z-0"
          aria-label={`Edit kategori ${node.name}`}
        />
        {/* Indentation */}
        <div className="relative z-10 flex shrink-0">
          {Array.from({ length: level }).map((_, i) => (
            <div key={i} className="h-16 w-10 border-r border-neutral-200/50" />
          ))}
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-4 px-5 py-3">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => hasChildren && setIsExpanded(!isExpanded)}
            disabled={!hasChildren}
            className={`rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 ${!hasChildren ? "cursor-default opacity-0" : ""}`}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {/* Icon */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {node.imageUrl ? (
              <AppImage
                src={node.imageUrl}
                alt={node.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <Folder className="h-full w-full p-2 text-neutral-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-neutral-900">
                {node.name}
              </h3>
              {hasChildren && (
                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase">
                  {node.children!.length} Sub
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-neutral-400">/{node.slug}</p>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
            <Link href={`/admin/categories/${node.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-blue-200 px-2 text-blue-600 hover:bg-blue-50"
              >
                <Edit size={16} className="mr-1" />{" "}
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
            <DeleteCategoryButton id={node.id} name={node.name} />
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="animate-in slide-in-from-top-2 fade-in flex flex-col duration-200">
          {node.children!.map((child) => (
            <CategoryItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
