"use client";

import { MediaLibrary } from "@/components/admin/medias/MediaLibrary";
import { Button } from "@/components/ui/Button";
import { DBMedia } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";

interface MediaSelectorProps {
  onSelect: (media: DBMedia | DBMedia[]) => void;
  allMedias: DBMedia[];
  trigger?: React.ReactNode;
  multiple?: boolean;
}

export function MediaSelector({
  onSelect,
  allMedias,
  trigger,
  multiple = false,
}: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            Pilih dari Library
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-neutral-900 sm:text-xl">
                Pilih Media
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 transition-colors hover:text-neutral-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pt-2 pb-6 sm:px-6">
                <MediaLibrary
                  initialMedias={allMedias}
                  allowSelection
                  selectionMode={multiple ? "multiple" : "single"}
                  stickyOffset="0"
                  onSelect={(media) => {
                    onSelect(media);
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>

            <div className="border-t bg-neutral-50 p-4 text-center text-xs text-neutral-500">
              Pilih media lalu klik &quot;Gunakan Media&quot; untuk
              mengonfirmasi.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
