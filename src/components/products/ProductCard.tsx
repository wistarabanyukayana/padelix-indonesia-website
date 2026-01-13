import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { ProductCardProps } from "@/types";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      href={`/products/${product.slug}`} 
      className="bg-white rounded-brand p-6 flex flex-col gap-4 shadow-xl hover:shadow-2xl transition-all group border border-neutral-100 hover:-translate-y-1 duration-300 h-full"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        <AppImage
          src={product.image}
          alt={product.name}
          fill
          className="group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <h4 className="text-xl font-bold text-neutral-900 group-hover:text-brand-green transition-colors">{product.name}</h4>
        {product.showPrice ? (
          <p className="text-lg font-bold text-brand-green">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(product.price))}
          </p>
        ) : (
          <p className="text-lg font-bold text-brand-green">Hubungi Kami</p>
        )}
        <p className="text-neutral-500 text-sm line-clamp-2">{product.description}</p>
        
        <div className="mt-auto pt-2">
            <Button variant="outline" size="sm" className="w-full pointer-events-none">Detail Produk</Button>
        </div>
      </div>
    </Link>
  );
}