"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

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

  // Close the panel once the user scrolls the page away from where they
  // opened it. The threshold absorbs the layout shift of opening (and any
  // scroll-anchoring correction), which would otherwise close it instantly.
  useEffect(() => {
    if (!open) return;
    const openedAtY = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - openedAtY) > 24) setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold tracking-wider text-neutral-900 uppercase transition-colors hover:border-brand-green lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filter & Kategori
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[10px] font-black text-white">
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
          sticky filter bar; the card background separates it from the page.
          No overscroll-contain: short panels must chain swipes to the page */}
      <div
        className={cn(
          "max-h-[60vh] flex-col gap-8 overflow-y-auto rounded-xl bg-neutral-50 p-4 lg:max-h-none lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0",
          open ? "flex" : "hidden lg:flex",
        )}
      >
        {children}
      </div>
    </div>
  );
}
