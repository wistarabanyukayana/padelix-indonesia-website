"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  activeFilterCount: number;
  children: React.ReactNode;
}

/**
 * Collapses the catalog filters behind a toggle on mobile so the product grid
 * stays close to the top; on lg+ the filters render as a regular sidebar.
 */
export function FilterPanel({ activeFilterCount, children }: FilterPanelProps) {
  // Auto-expand on mobile when filters are already active
  const [open, setOpen] = useState(activeFilterCount > 0);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-bold tracking-wider text-neutral-900 uppercase transition-colors hover:border-lime-500 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filter & Kategori
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-neutral-900">
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Capped + scrollable on mobile because the panel opens inside the
          sticky filter bar; the card background separates it from the page */}
      <div
        className={cn(
          "max-h-[60vh] flex-col gap-8 overflow-y-auto overscroll-contain rounded-3xl bg-neutral-50 p-4 lg:max-h-none lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
