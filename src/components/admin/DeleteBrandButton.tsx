"use client";

import { deleteBrand } from "@/actions/brands";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteBrandButton({ id, name }: { id: number; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus brand "${name}"?`)) {
      startTransition(async () => {
        const result = await deleteBrand(id);
        if (result.success) {
          toast.success("Brand berhasil dihapus");
        } else {
          toast.error(result.message || "Gagal menghapus brand");
        }
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 size={16} />
    </Button>
  );
}
