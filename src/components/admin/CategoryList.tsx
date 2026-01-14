"use client";

import { useState } from "react";
import { CategoryTreeNode } from "@/types";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { Folder, Edit, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export function CategoryList({ data }: { data: CategoryTreeNode[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-brand shadow-sm border border-neutral-200">
        <Folder className="mx-auto text-neutral-200 mb-4" size={48} />
        <p className="text-neutral-400">Belum ada kategori yang dibuat.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-brand shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex flex-col">
        {data.map((node) => (
          <CategoryItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}

function CategoryItem({ node, level = 0 }: { node: CategoryTreeNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div className="relative flex items-center hover:bg-neutral-50 transition-colors border-b border-neutral-100 group">
        <Link
          href={`/admin/categories/${node.id}/edit`}
          className="absolute inset-0 z-0"
          aria-label={`Edit kategori ${node.name}`}
        />
        {/* Indentation */}
        <div className="flex shrink-0 relative z-10">
            {Array.from({ length: level }).map((_, i) => (
                <div key={i} className="w-10 h-16 border-r border-neutral-200/50" />
            ))}
        </div>

        <div className="flex-1 flex items-center gap-4 py-3 px-5 min-w-0 relative z-10">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                disabled={!hasChildren}
                className={`p-1 rounded hover:bg-neutral-200 text-neutral-400 transition-colors ${!hasChildren ? "opacity-0 cursor-default" : ""}`}
            >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Icon */}
            <div className="relative w-12 h-12 shrink-0 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden">
                {node.imageUrl ? (
                    <AppImage src={node.imageUrl} alt={node.name} fill className="object-cover" />
                ) : (
                    <Folder className="w-full h-full p-2 text-neutral-300" />
                )}
            </div>
            
            {/* Info */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-900 truncate text-base">{node.name}</h3>
                    {hasChildren && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-bold uppercase">
                            {node.children!.length} Sub
                        </span>
                    )}
                </div>
                <p className="text-xs text-neutral-400 font-mono">/{node.slug}</p>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Link href={`/admin/categories/${node.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Edit size={16} className="mr-1" /> <span className="hidden sm:inline">Edit</span>
                    </Button>
                </Link>
                <DeleteCategoryButton id={node.id} name={node.name} />
            </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col animate-in slide-in-from-top-2 fade-in duration-200">
            {node.children!.map((child) => (
                <CategoryItem key={child.id} node={child} level={level + 1} />
            ))}
        </div>
      )}
    </div>
  );
}
