import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { ProductCardProps } from "@/types";
import Link from "next/link";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col gap-4 rounded-brand border border-neutral-100 bg-white p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <AppImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h4 className="text-xl font-bold text-neutral-900 transition-colors group-hover:text-brand-green">
          {product.name}
        </h4>
        {product.showPrice ? (
          <p className="text-lg font-bold text-brand-green">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(Number(product.price))}
          </p>
        ) : (
          <p className="text-lg font-bold text-brand-green">Hubungi Kami</p>
        )}
        <p className="line-clamp-2 text-sm text-neutral-500">
          {product.description}
        </p>

        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            className="pointer-events-none w-full"
          >
            Detail Produk
          </Button>
        </div>
      </div>
    </Link>
  );
}
