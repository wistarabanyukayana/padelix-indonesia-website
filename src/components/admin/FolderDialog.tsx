"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface FolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  currentPath: string | null;
}

export function FolderDialog({ isOpen, onClose, onCreate, currentPath }: FolderDialogProps) {
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreate(folderName.trim());
    setFolderName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Folder Baru">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Nama Folder</label>
            <div className="flex items-center gap-2">
                {currentPath && <span className="text-neutral-400 text-sm">{currentPath}/</span>}
                <input 
                    autoFocus
                    type="text" 
                    className="p-2 border rounded-lg flex-1" 
                    placeholder="Contoh: products" 
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                />
            </div>
            <p className="text-xs text-neutral-500">Folder hanya akan tersimpan jika berisi file.</p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={!folderName.trim()}>Buat Folder</Button>
        </div>
      </form>
    </Modal>
  );
}
