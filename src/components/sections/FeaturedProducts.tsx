import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FeaturedProductsProps } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section id="products" className="section bg-brand-green">
      <div className="wrapper gap-12">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="subheading text-lime-800">Katalog</span>
            <h2 className="h2 text-neutral-900">Produk Unggulan</h2>
          </div>
          <Link href="/products">
            <Button variant="dark" size="sm">Lihat Semua</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}