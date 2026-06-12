import { EmptyState } from "@/components/general/EmptyState";
import { CourtLines } from "@/components/public/CourtLines";
import { ProductCard } from "@/components/public/products/ProductCard";
import { ProductCategorySidebar } from "@/components/public/products/ProductCategorySidebar";
import { ProductSearchForm } from "@/components/public/products/ProductSearchForm";
import { TreeNode } from "@/components/ui/CollapsibleTree";
import { siteConfig } from "@/config/site";
import { getAllProducts, getBrands, getCategories } from "@/data/public";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q, category, brand } = await searchParams;
  const hasFilters = Boolean(q || category || brand);
  const title = hasFilters ? "Katalog Produk - Pencarian" : "Katalog Produk";
  const description =
    "Temukan perlengkapan padel terbaik dari brand ternama dunia.";

  return {
    title,
    description,
    alternates: {
      canonical: "/products",
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/products`,
    },
  };
}

async function ProductsContent({ searchParams }: PageProps) {
  const { q, category, brand } = await searchParams;

  const query = typeof q === "string" ? q : undefined;
  const categoryId =
    typeof category === "string" ? Number(category) : undefined;
  const brandId = typeof brand === "string" ? Number(brand) : undefined;

  const [products, allCategories, brands] = await Promise.all([
    getAllProducts({ query, categoryId, brandId }),
    getCategories(),
    getBrands(),
  ]);

  // Build recursive tree for sidebar
  const buildTreeNodes = (parentId: number | null = null): TreeNode[] => {
    return allCategories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(c.id),
      }));
  };

  const treeNodes = buildTreeNodes(null);

  return (
    <main className="min-h-screen bg-brand-light">
      <section className="section relative overflow-hidden bg-court-950 py-16 text-white sm:py-20">
        <div className="bg-mesh absolute inset-0" aria-hidden />
        <CourtLines />
        <div className="wrapper relative items-start gap-4">
          <span className="kicker text-brand-green">Peralatan Padel</span>
          <h1 className="display-1 text-white">Katalog Produk</h1>
          <p className="max-w-2xl text-lg text-pretty text-white/70 sm:text-xl">
            Temukan perlengkapan padel terbaik dari brand ternama dunia.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="wrapper gap-12 lg:flex-row lg:items-start">
          {/* Sidebar Filters */}
          <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-64">
            {/* Search */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
                Cari
              </h3>
              <ProductSearchForm defaultQuery={query} />
            </div>

            {/* Categories Tree */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
                Kategori
              </h3>
              <div className="flex flex-col gap-1">
                <Link
                  href="/products"
                  className={`inline-block border-b border-transparent py-2 text-sm font-bold transition-all hover:border-brand-green hover:text-lime-600 ${
                    !categoryId
                      ? "border-brand-green text-lime-600"
                      : "text-neutral-500"
                  }`}
                >
                  Semua Kategori
                </Link>
                <ProductCategorySidebar treeNodes={treeNodes} />
              </div>
            </div>

            {/* Brands */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
                Brand
              </h3>
              <div className="flex flex-wrap gap-1 lg:flex-col">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?brand=${b.id}${categoryId ? `&category=${categoryId}` : ""}${query ? `&q=${query}` : ""}`}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                      brandId === b.id
                        ? "border-neutral-900 bg-neutral-900 text-brand-green shadow-md"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-lime-500 hover:text-lime-600"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
                {brandId && (
                  <Link
                    href="/products"
                    className="mt-1 px-4 py-2 text-xs font-bold text-red-500 hover:underline"
                  >
                    Hapus Filter Brand
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex flex-1 flex-col gap-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <p className="text-sm font-medium text-neutral-400">
                Menampilkan{" "}
                <span className="font-bold text-neutral-900">
                  {products.length}
                </span>{" "}
                produk
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            ) : (
              <div className="w-full py-20">
                <EmptyState
                  message={
                    query || categoryId || brandId
                      ? "Tidak ada produk yang sesuai dengan kriteria Anda."
                      : "Belum ada produk"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-brand-light" />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
