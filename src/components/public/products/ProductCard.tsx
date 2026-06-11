import { AppImage } from "@/components/general/AppImage";
import { ProductCardProps } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col gap-4 rounded-brand border border-neutral-100 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <AppImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h4 className="text-xl font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-lime-600">
          {product.name}
        </h4>
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4">
          {product.showPrice ? (
            <p className="text-lg font-black text-neutral-900">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(Number(product.price))}
            </p>
          ) : (
            <p className="text-lg font-black text-neutral-900">Hubungi Kami</p>
          )}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all duration-300 group-hover:bg-brand-green group-hover:text-neutral-900">
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
