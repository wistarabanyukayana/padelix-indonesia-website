"use client";

import Link from "next/link";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { useSearchParams } from "next/navigation";

interface ProductCategorySidebarProps {
  treeNodes: TreeNode[];
}

export function ProductCategorySidebar({ treeNodes }: ProductCategorySidebarProps) {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const brandId = searchParams.get("brand");
  const query = searchParams.get("q");

  const renderLabel = (node: TreeNode) => {
    const isSelected = categoryId === node.id;
    return (
        <Link 
            href={`/products?category=${node.id}${brandId ? `&brand=${brandId}` : ""}${query ? `&q=${query}` : ""}`}
            className={`block py-1 text-sm font-bold transition-all hover:text-brand-green ${
                isSelected ? "text-brand-green" : "text-neutral-500"
            }`}
        >
            {node.label}
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
