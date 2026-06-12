import { Reveal } from "@/components/general/Reveal";
import { ProductCard } from "@/components/public/products/ProductCard";
import { FeaturedProductsProps } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section id="products" className="section bg-brand-light">
      <div className="wrapper gap-12">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="kicker text-lime-600">Katalog</span>
              <h2 className="display-2 text-neutral-900">Produk Unggulan</h2>
            </div>
            <Link
              href="/products"
              className="group flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-900 uppercase transition-colors hover:text-lime-600"
            >
              Lihat Semua
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition-all duration-300 group-hover:bg-brand-green group-hover:text-neutral-900">
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item, index) => (
            <Reveal key={item.id} delay={index * 90} className="h-full">
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
