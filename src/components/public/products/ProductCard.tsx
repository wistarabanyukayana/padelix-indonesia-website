import { AppImage } from "@/components/general/AppImage";
import { ProductCardProps } from "@/types";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col gap-4 rounded-brand border border-neutral-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-green hover:shadow-xl hover:shadow-lime-400/10"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[calc(var(--radius-brand)-0.5rem)] bg-neutral-100">
        <AppImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Corner arrow chip */}
        <span className="absolute top-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
        <h4 className="text-lg leading-snug font-extrabold tracking-tight text-neutral-900 transition-colors group-hover:text-lime-600">
          {product.name}
        </h4>
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
          <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
            {product.showPrice ? "Harga" : "Penawaran"}
          </span>
          <p className="font-display text-xl tracking-wide text-neutral-900">
            {product.showPrice
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(Number(product.price))
              : "Hubungi Kami"}
          </p>
        </div>
      </div>
    </Link>
  );
}
