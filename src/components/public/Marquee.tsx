interface MarqueeProps {
  items: string[];
}

/** Full-bleed lime "tape" strip with looping poster text. */
export function Marquee({ items }: MarqueeProps) {
  // Two identical halves so translateX(-50%) loops seamlessly
  const half = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-xl tracking-wide whitespace-nowrap text-neutral-900 uppercase sm:text-2xl">
            {item}
          </span>
          <span aria-hidden className="text-neutral-900/60">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className="relative z-10 -my-4 -rotate-1 overflow-hidden border-y-2 border-neutral-900 bg-brand-green py-3 shadow-xl"
    >
      <div className="animate-marquee flex w-max">
        {half}
        {half}
      </div>
    </div>
  );
}
