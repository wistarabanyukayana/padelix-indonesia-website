import { AppImage } from "@/components/general/AppImage";
import { CategoriesProps } from "@/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="section bg-white">
      <div className="wrapper gap-12">
        <div className="flex flex-col gap-2 text-center">
          <span className="subheading text-brand-green">Pilihan Terbaik</span>
          <h2 className="h2 text-neutral-900">Jelajahi Kategori</h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-brand border border-neutral-100 bg-neutral-100 p-6"
            >
              {c.imageUrl ? (
                <AppImage
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-neutral-200 via-neutral-100 to-white" />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col gap-1">
                <h3 className="text-xl font-black text-white">{c.name}</h3>
                {c.description ? (
                  <p className="line-clamp-2 text-sm leading-snug text-white/70">
                    {c.description}
                  </p>
                ) : (
                  <p className="text-sm leading-snug text-white/60 italic">
                    Tanpa deskripsi.
                  </p>
                )}
                <span className="mt-2 flex items-center gap-1 text-xs font-black tracking-widest text-brand-green uppercase">
                  Lihat Produk <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
