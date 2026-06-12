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
    return (
      <Link
        href={`/products?category=${node.id}${brandId ? `&brand=${brandId}` : ""}${query ? `&q=${query}` : ""}`}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex items-center justify-between gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition-all",
          isSelected
            ? "bg-neutral-900 text-brand-green shadow-md"
            : "text-neutral-500 hover:bg-lime-50 hover:text-lime-700",
        )}
      >
        <span className="truncate">{node.label}</span>
        {typeof count === "number" && (
          <span
            className={cn(
              "text-[10px] font-black tabular-nums",
              isSelected ? "text-brand-green/70" : "text-neutral-400",
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <CollapsibleTree
      nodes={treeNodes}
      renderLabel={renderLabel}
      defaultExpanded={true}
      rowClassName="gap-1 py-0.5"
    />
  );
}
