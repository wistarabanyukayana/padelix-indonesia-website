"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { ActionState } from "@/types";

interface FeaturedToggleButtonProps {
  id: number;
  isFeatured: boolean;
  onToggle: (id: number, isFeatured: boolean) => Promise<ActionState>;
}

export function FeaturedToggleButton({ id, isFeatured, onToggle }: FeaturedToggleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      const result = await onToggle(id, !isFeatured);
      if (result.success) {
        toast.success(isFeatured ? "Dihapus dari unggulan" : "Ditambahkan ke unggulan");
      } else {
        const errorMsg = result.message || (typeof result.error === "string" ? result.error : "Gagal mengubah status");
        toast.error(errorMsg);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-8 w-8 p-0 transition-all ${
        isFeatured 
        ? "bg-yellow-50 border-yellow-200 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600" 
        : "text-neutral-300 border-neutral-200 hover:text-neutral-400 hover:bg-neutral-50"
      }`}
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? "Hapus dari Unggulan" : "Jadikan Unggulan"}
    >
      <Star size={16} fill={isFeatured ? "currentColor" : "none"} />
    </Button>
  );
}
