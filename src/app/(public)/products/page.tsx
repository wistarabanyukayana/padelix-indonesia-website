import { getAllProducts, getCategories, getBrands } from "@/data/public";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/general/EmptyState";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";
import { TreeNode } from "@/components/ui/CollapsibleTree";
import { ProductCategorySidebar } from "@/components/products/ProductCategorySidebar";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { q, category, brand } = await searchParams;
  
  const query = typeof q === "string" ? q : undefined;
  const categoryId = typeof category === "string" ? Number(category) : undefined;
  const brandId = typeof brand === "string" ? Number(brand) : undefined;
  
  const [products, allCategories, brands] = await Promise.all([
    getAllProducts({ query, categoryId, brandId }),
    getCategories(),
    getBrands(),
  ]);

  // Build recursive tree for sidebar
  const buildTreeNodes = (parentId: number | null = null): TreeNode[] => {
    return allCategories
      .filter(c => c.parentId === parentId)
      .map(c => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(c.id),
      }));
  };

  const treeNodes = buildTreeNodes(null);

  return (
    <main className="min-h-screen bg-brand-light">
      <section className="section bg-brand-green text-neutral-900 pt-16 pb-16">
        <div className="wrapper text-center gap-4">
          <h1 className="h1">Katalog Produk</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-80 font-medium">
            Temukan perlengkapan padel terbaik dari brand ternama dunia.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrapper gap-12 lg:flex-row lg:items-start">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex flex-col gap-8 shrink-0">
            {/* Search */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Cari</h3>
                <form className="flex gap-2">
                    <input 
                        type="text" 
                        name="q"
                        placeholder="Nama produk..." 
                        defaultValue={query}
                        className="flex-1 p-3 bg-neutral-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green transition-all text-sm"
                    />
                    <Button type="submit" variant="dark" size="sm">Cari</Button>
                </form>
            </div>

            {/* Categories Tree */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Kategori</h3>
                <div className="flex flex-col gap-1">
                    <Link 
                        href="/products"
                        className={`py-2 text-sm font-bold transition-all border-b border-transparent hover:border-brand-green hover:text-brand-green inline-block ${
                            !categoryId ? "text-brand-green border-brand-green" : "text-neutral-500"
                        }`}
                    >
                        Semua Kategori
                    </Link>
                    <ProductCategorySidebar treeNodes={treeNodes} />
                </div>
            </div>

            {/* Brands */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Brand</h3>
                <div className="flex flex-wrap lg:flex-col gap-1">
                    {brands.map((b) => (
                        <Link 
                            key={b.id}
                            href={`/products?brand=${b.id}${categoryId ? `&category=${categoryId}` : ""}${query ? `&q=${query}` : ""}`}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                                brandId === b.id ? "bg-brand-green border-brand-green text-white shadow-md" : "bg-white border-transparent text-neutral-500 hover:text-brand-green"
                            }`}
                        >
                            {b.name}
                        </Link>
                    ))}
                    {brandId && (
                        <Link href="/products" className="px-4 py-2 text-xs text-red-500 font-bold hover:underline mt-1">
                            Hapus Filter Brand
                        </Link>
                    )}
                </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <p className="text-sm text-neutral-400 font-medium">
                    Menampilkan <span className="text-neutral-900 font-bold">{products.length}</span> produk
                </p>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((item) => (
                    <ProductCard key={item.id} product={item} />
                ))}
                </div>
            ) : (
                <div className="py-20 w-full">
                <EmptyState message={query || categoryId || brandId ? "Tidak ada produk yang sesuai dengan kriteria Anda." : "Belum ada produk"} />
                </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
