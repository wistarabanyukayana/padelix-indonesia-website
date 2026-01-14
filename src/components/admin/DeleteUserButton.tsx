"use client";

import { deleteUser } from "@/actions/users";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteUserButton({ id, username }: { id: number; username: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${username}"?`)) {
      startTransition(async () => {
        const result = await deleteUser(id);
        if (result.success) {
          toast.success("Pengguna berhasil dihapus");
        } else {
          toast.error(result.message || "Gagal menghapus pengguna");
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
