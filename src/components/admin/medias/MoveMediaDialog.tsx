"use client";

import { Button } from "@/components/ui/Button";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { Modal } from "@/components/ui/Modal";
import { DBMediaFolder } from "@/types";
import { Folder } from "lucide-react";
import { useMemo, useState } from "react";

interface MoveMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolderId: number | null) => void;
  folders: DBMediaFolder[];
  currentFolderId: number | null;
}

export function MoveMediaDialog({
  isOpen,
  onClose,
  onMove,
  folders,
  currentFolderId,
}: MoveMediaDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    currentFolderId,
  );

  const treeNodes = useMemo(() => {
    const byParent = new Map<number | null, DBMediaFolder[]>();
    for (const f of folders) {
      const arr = byParent.get(f.parentId) ?? [];
      arr.push(f);
      byParent.set(f.parentId, arr);
    }
    const build = (parentId: number | null): TreeNode[] =>
      (byParent.get(parentId) ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((f) => ({
          id: String(f.id),
          label: f.name,
          children: build(f.id),
        }));
    return build(null);
  }, [folders]);

  const renderLabel = (node: TreeNode) => {
    const id = Number(node.id);
    const isSelected = selectedFolderId === id;
    return (
      <button
        type="button"
        onClick={() => setSelectedFolderId(id)}
        className={`flex w-full items-center gap-2 rounded p-1 text-left text-sm transition-all hover:bg-neutral-100 ${isSelected ? "bg-brand-light/20 font-bold text-brand-green" : "text-neutral-700"}`}
      >
        <Folder
          size={14}
          className={
            isSelected
              ? "fill-brand-green/20 stroke-brand-green"
              : "text-neutral-400"
          }
        />
        <span>{node.label}</span>
      </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pindahkan Media">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-500">Pilih folder tujuan.</p>

        <div className="max-h-75 overflow-y-auto rounded-lg border bg-white p-2">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`mb-1 flex w-full items-center gap-2 rounded p-1 text-left text-sm transition-all hover:bg-neutral-100 ${selectedFolderId === null ? "bg-brand-light/20 font-bold text-brand-green" : "text-neutral-700"}`}
          >
            <Folder
              size={14}
              className={
                selectedFolderId === null
                  ? "fill-brand-green/20 stroke-brand-green"
                  : "text-neutral-400"
              }
            />
            <span>Root (Tanpa Folder)</span>
          </button>
          <CollapsibleTree
            nodes={treeNodes}
            renderLabel={renderLabel}
            defaultExpanded={true}
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onMove(selectedFolderId);
              onClose();
            }}
          >
            Pindahkan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
