"use client";

import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ProductCategorySidebarProps {
  treeNodes: TreeNode[];
}

export function ProductCategorySidebar({
  treeNodes,
}: ProductCategorySidebarProps) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : undefined;
  const brandId = searchParams.get("brand");
  const query = searchParams.get("q");

  const renderLabel = (node: TreeNode) => {
    const isSelected = categoryId === node.id;
    const count = (node.data as { count?: number } | undefined)?.count;
    const isEmpty = count === 0;
    return (
      <Link
        href={`/products?category=${node.id}${brandId ? `&brand=${brandId}` : ""}${query ? `&q=${query}` : ""}`}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex items-center justify-between gap-2 py-1 text-sm font-bold transition-all hover:text-brand-green",
          isSelected
            ? "text-brand-green"
            : isEmpty
              ? "text-neutral-300 hover:text-neutral-400"
              : "text-neutral-500",
        )}
      >
        <span className="truncate">{node.label}</span>
        {typeof count === "number" && (
          <span
            className={cn(
              "text-[10px] font-bold tabular-nums",
              isEmpty ? "text-neutral-300" : "text-neutral-400",
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="mt-2">
      <CollapsibleTree
        nodes={treeNodes}
        renderLabel={renderLabel}
        defaultExpanded={true}
      />
    </div>
  );
}
