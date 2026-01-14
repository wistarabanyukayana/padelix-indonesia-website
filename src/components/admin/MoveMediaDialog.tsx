"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useMemo } from "react";
import { Plus, Folder } from "lucide-react";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";

interface MoveMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolder: string | null) => void;
  existingFolders: string[];
  currentFolder: string | null;
}

export function MoveMediaDialog({ isOpen, onClose, onMove, existingFolders, currentFolder }: MoveMediaDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(currentFolder);
  const [isCustom, setIsCustom] = useState(false);
  const [customFolder, setCustomFolder] = useState("");

  const handleMove = () => {
    if (isCustom) {
        onMove(customFolder.trim() || null);
    } else {
        onMove(selectedFolder);
    }
    onClose();
  };

  const treeNodes = useMemo(() => {
    const root: TreeNode[] = [];
    
    // Add Root Option
    root.push({
        id: "root",
        label: "Root (Tanpa Folder)",
        path: null, // Custom data
    });

    const addPath = (path: string) => {
        const parts = path.split('/');
        let currentLevel = root;
        let currentPath = "";

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            
            // Check if node exists at this level
            let existingNode = currentLevel.find(n => n.label === part && n.id !== "root");
            
            if (!existingNode) {
                existingNode = {
                    id: currentPath,
                    label: part,
                    path: currentPath,
                    children: [],
                };
                currentLevel.push(existingNode);
            }
            
            if (index < parts.length - 1) {
                if (!existingNode.children) existingNode.children = [];
                currentLevel = existingNode.children;
            }
        });
    };

    existingFolders.forEach(f => addPath(f));
    return root;
  }, [existingFolders]);

  const renderLabel = (node: TreeNode) => {
    const isSelected = selectedFolder === node.path;
    return (
        <button
            type="button"
            onClick={() => { setSelectedFolder(node.path ?? null); setIsCustom(false); }}
            className={`flex items-center gap-2 w-full p-1 rounded text-sm text-left hover:bg-neutral-100 transition-all ${isSelected ? 'text-brand-green font-bold bg-brand-light/20' : 'text-neutral-700'}`}
        >
            <Folder size={14} className={isSelected ? "fill-brand-green/20 stroke-brand-green" : "text-neutral-400"} />
            <span>{node.label}</span>
        </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pindahkan Media">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-neutral-500">Pilih folder tujuan.</p>
        
        <div className="max-h-[300px] overflow-y-auto border rounded-lg p-2 bg-white">
            <CollapsibleTree 
                nodes={treeNodes} 
                renderLabel={renderLabel} 
                defaultExpanded={true}
            />
        </div>

        <div className="border-t border-neutral-200 pt-4">
            <button 
                onClick={() => setIsCustom(!isCustom)}
                className="flex items-center gap-2 text-sm font-bold text-brand-green mb-2"
            >
                <Plus size={16} /> Folder Baru
            </button>
            
            {isCustom && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                    <input 
                        type="text" 
                        placeholder="Nama folder baru (contoh: archive/2024)" 
                        className="p-2.5 border rounded text-sm md:text-base"
                        value={customFolder}
                        onChange={(e) => setCustomFolder(e.target.value)}
                        autoFocus
                    />
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={onClose}>Batal</Button>
            <Button size="sm" onClick={handleMove} disabled={isCustom && !customFolder.trim()}>Pindahkan</Button>
        </div>
      </div>
    </Modal>
  );
}
