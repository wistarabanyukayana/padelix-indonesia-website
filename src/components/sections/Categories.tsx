import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { ChevronRight } from "lucide-react";
import { CategoriesProps } from "@/types";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="section bg-white">
      <div className="wrapper gap-12">
        <div className="text-center flex flex-col gap-2">
          <span className="subheading text-brand-green">Pilihan Terbaik</span>
          <h2 className="h2 text-neutral-900">Jelajahi Kategori</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {categories.map((c) => (
            <Link 
                key={c.id} 
                href={`/products?category=${c.id}`}
                className="group relative overflow-hidden rounded-brand aspect-square bg-neutral-100 flex flex-col justify-end p-6 border border-neutral-100"
            >
                {c.imageUrl ? (
                  <AppImage 
                      src={c.imageUrl} 
                      alt={c.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-white" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white">{c.name}</h3>
                    {c.description ? (
                      <p className="text-sm text-white/70 line-clamp-2 leading-snug">{c.description}</p>
                    ) : (
                      <p className="text-sm text-white/60 italic leading-snug">Tanpa deskripsi.</p>
                    )}
                    <span className="flex items-center gap-1 text-xs font-black text-brand-green uppercase tracking-widest mt-2">
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
