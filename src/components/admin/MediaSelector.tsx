"use client";

import { useState } from "react";
import { DBMedia } from "@/types";
import { MediaLibrary } from "./MediaLibrary";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface MediaSelectorProps {
  onSelect: (media: DBMedia) => void;
  allMedias: DBMedia[];
  trigger?: React.ReactNode;
}

export function MediaSelector({ onSelect, allMedias, trigger }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || <Button type="button" variant="outline">Pilih dari Library</Button>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Modal */}
          <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900">Pilih Media</h3>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <MediaLibrary
                  initialMedias={allMedias}
                  allowSelection
                  onSelect={(media) => {
                    onSelect(media);
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t text-center text-xs text-neutral-500">
              Pilih media lalu klik &quot;Gunakan Media&quot; untuk mengonfirmasi.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
