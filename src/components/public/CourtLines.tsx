import { cn } from "@/lib/utils";

/**
 * Decorative padel-court line work for dark sections: an out-of-frame court
 * seen from above (outer cage, net line, service boxes). Purely aesthetic.
 */
export function CourtLines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Outer cage, bleeding off-canvas */}
      <div className="absolute -top-[30%] right-[-12%] bottom-[-30%] left-[55%] rounded-[3rem] border border-lime-400/10" />
      {/* Net line */}
      <div className="absolute top-1/2 right-[-12%] left-[55%] h-px bg-lime-400/15" />
      {/* Service line */}
      <div className="absolute top-[18%] bottom-[18%] left-[72%] w-px bg-lime-400/10" />
      {/* Center service line */}
      <div className="absolute top-1/2 left-[72%] hidden h-px w-[20%] -translate-y-12 bg-lime-400/10 lg:block" />
    </div>
  );
}
