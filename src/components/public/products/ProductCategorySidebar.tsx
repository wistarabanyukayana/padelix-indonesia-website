"use client";

import { TreeNode } from "@/components/ui/CollapsibleTree";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ProductCategorySidebarProps {
  treeNodes: TreeNode[];
}

/**
 * Public category tree: always expanded (catalog trees are small), with
 * hierarchy shown through indent guide lines instead of collapse chevrons.
 * Zero-count categories are dimmed but stay clickable.
 */
export function ProductCategorySidebar({
  treeNodes,
}: ProductCategorySidebarProps) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : undefined;
  const brandId = searchParams.get("brand");
  const query = searchParams.get("q");

  const renderNodes = (nodes: TreeNode[], level = 0) => (
    <ul
      className={cn(
        "flex flex-col gap-0.5",
        level > 0 && "ml-4 border-l border-neutral-200 pl-2",
      )}
    >
      {nodes.map((node) => {
        const isSelected = categoryId === node.id;
        const count = (node.data as { count?: number } | undefined)?.count;
        const isEmpty = count === 0;
        return (
          <li key={node.id} className="flex flex-col gap-0.5">
            <Link
              href={`/products?category=${node.id}${brandId ? `&brand=${brandId}` : ""}${query ? `&q=${query}` : ""}`}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "flex items-center justify-between gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition-all",
                isSelected
                  ? "bg-neutral-900 text-brand-green shadow-md"
                  : isEmpty
                    ? "text-neutral-300 hover:bg-neutral-50 hover:text-neutral-400"
                    : "text-neutral-500 hover:bg-lime-50 hover:text-lime-700",
              )}
            >
              <span className="truncate">{node.label}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "text-[10px] font-black tabular-nums",
                    isSelected
                      ? "text-brand-green/70"
                      : isEmpty
                        ? "text-neutral-300"
                        : "text-neutral-400",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
            {node.children &&
              node.children.length > 0 &&
              renderNodes(node.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderNodes(treeNodes);
}
