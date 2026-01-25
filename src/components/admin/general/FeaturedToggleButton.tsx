"use client";

import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { ActionState } from "@/types";

interface FeaturedToggleButtonProps {
  id: number;
  isFeatured: boolean;
  onToggle: (id: number, isFeatured: boolean) => Promise<ActionState>;
}

export function FeaturedToggleButton({
  id,
  isFeatured,
  onToggle,
}: FeaturedToggleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await onToggle(id, !isFeatured);
      if (result.success) {
        toast.success(
          isFeatured ? "Dihapus dari Homepage" : "Ditampilkan di Homepage",
        );
      } else {
        const errorMsg =
          result.message ||
          (typeof result.error === "string"
            ? result.error
            : "Gagal mengubah status");
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
          ? "border-yellow-200 bg-yellow-50 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600"
          : "border-neutral-200 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-400"
      }`}
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? "Hapus dari Homepage" : "Tampilkan di Homepage"}
    >
      <Star size={16} fill={isFeatured ? "currentColor" : "none"} />
    </Button>
  );
}
