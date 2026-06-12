import { EmptyState } from "@/components/general/EmptyState";
import { CourtLines } from "@/components/public/CourtLines";
import { FilterPanel } from "@/components/public/products/FilterPanel";
import { ProductCard } from "@/components/public/products/ProductCard";
import { ProductCategorySidebar } from "@/components/public/products/ProductCategorySidebar";
import { ProductSearchForm } from "@/components/public/products/ProductSearchForm";
import { TreeNode } from "@/components/ui/CollapsibleTree";
import { siteConfig } from "@/config/site";
import {
  getAllProducts,
  getBrandProductCounts,
  getBrands,
  getCategories,
  getCategoryProductCounts,
} from "@/data/public";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
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

  const [products, allCategories, brands, categoryCounts, brandCounts] =
    await Promise.all([
      getAllProducts({ query, categoryId, brandId }),
      getCategories(),
      getBrands(),
      getCategoryProductCounts({ query, brandId }),
      getBrandProductCounts({ query, categoryId }),
    ]);

  const brandCountMap = new Map(brandCounts.map((c) => [c.brandId, c.count]));

  // Roll direct product counts up the category tree so parents reflect
  // everything underneath them (matching the filter semantics)
  const directCounts = new Map(
    categoryCounts.map((c) => [c.categoryId, c.count]),
  );
  const rolledUpCounts = new Map<number, number>();
  const rollUpCount = (id: number): number => {
    const memo = rolledUpCounts.get(id);
    if (memo !== undefined) return memo;
    const childSum = allCategories
      .filter((c) => c.parentId === id)
      .reduce((sum, child) => sum + rollUpCount(child.id), 0);
    const total = (directCounts.get(id) ?? 0) + childSum;
    rolledUpCounts.set(id, total);
    return total;
  };
  const totalCount = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  // Build recursive tree for sidebar
  const buildTreeNodes = (parentId: number | null = null): TreeNode[] => {
    return allCategories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(c.id),
        data: { count: rollUpCount(c.id) },
      }));
  };

  const treeNodes = buildTreeNodes(null);

  // URL for the current filters minus one of them
  const filterHref = (omit: "q" | "category" | "brand") => {
    const params = new URLSearchParams();
    if (omit !== "q" && query) params.set("q", query);
    if (omit !== "category" && categoryId)
      params.set("category", String(categoryId));
    if (omit !== "brand" && brandId) params.set("brand", String(brandId));
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const activeCategory = allCategories.find((c) => c.id === categoryId);
  const activeBrand = brands.find((b) => b.id === brandId);
  const hasActiveFilters = Boolean(query || activeCategory || activeBrand);

  return (
    <section className="section bg-white">
      <div className="wrapper gap-12 lg:flex-row lg:items-start">
        {/* Sidebar Filters: pinned under the header on mobile (full-bleed
              bar), sticky sidebar on desktop */}
        <aside className="sticky top-[var(--app-header-height,4.5rem)] z-30 -mx-6 flex shrink-0 flex-col gap-4 border-b border-neutral-100 bg-white px-6 py-3 sm:-mx-12 sm:px-12 md:-mx-20 md:px-20 lg:top-[calc(var(--app-header-height,5rem)+1rem)] lg:z-auto lg:-m-2 lg:max-h-[calc(100vh-8rem)] lg:w-68 lg:gap-8 lg:self-start lg:overflow-y-auto lg:border-0 lg:p-2">
          {/* Search */}
          <ProductSearchForm defaultQuery={query} />

          <FilterPanel
            activeFilterCount={(categoryId ? 1 : 0) + (brandId ? 1 : 0)}
          >
            {/* Categories Tree */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
                Kategori
              </h3>
              <div className="flex flex-col gap-1">
                <Link
                  href={filterHref("category")}
                  className={`flex items-center justify-between gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition-all ${
                    !categoryId
                      ? "bg-neutral-900 text-brand-green shadow-md"
                      : "text-neutral-500 hover:bg-lime-50 hover:text-lime-700"
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span
                    className={`text-[10px] font-black tabular-nums ${
                      !categoryId ? "text-brand-green/70" : "text-neutral-400"
                    }`}
                  >
                    {totalCount}
                  </span>
                </Link>
                <ProductCategorySidebar treeNodes={treeNodes} />
              </div>
            </div>

            {/* Brands */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black tracking-widest text-neutral-400 uppercase">
                Brand
              </h3>
              {/* Chips on mobile, quiet rows (like the category tree) on desktop */}
              <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
                {brands.map((b) => {
                  const isSelected = brandId === b.id;
                  const brandCount = brandCountMap.get(b.id) ?? 0;
                  const isEmpty = brandCount === 0;
                  return (
                    <Link
                      key={b.id}
                      href={`/products?brand=${b.id}${categoryId ? `&category=${categoryId}` : ""}${query ? `&q=${query}` : ""}`}
                      aria-current={isSelected ? "true" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all lg:justify-between lg:border-0 lg:px-3 lg:py-1.5",
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-brand-green shadow-md"
                          : isEmpty
                            ? "border-neutral-200 bg-white text-neutral-300 hover:text-neutral-400 lg:hover:bg-neutral-50"
                            : "border-neutral-200 bg-white text-neutral-500 hover:border-lime-500 hover:text-lime-600 lg:hover:bg-lime-50 lg:hover:text-lime-700",
                      )}
                    >
                      <span className="truncate">{b.name}</span>
                      <span
                        className={cn(
                          "text-[10px] font-black tabular-nums",
                          isSelected
                            ? "text-brand-green/70"
                            : isEmpty
                              ? "text-neutral-300"
                              : "text-neutral-400",
                        )}
                      >
                        {brandCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FilterPanel>
        </aside>

        {/* Product Grid */}
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-400">
                Menampilkan{" "}
                <span className="font-bold text-neutral-900">
                  {products.length}
                </span>{" "}
                produk
              </p>
              {hasActiveFilters && (
                <Link
                  href="/products"
                  className="text-xs font-bold tracking-wider text-red-500 uppercase hover:underline"
                >
                  Hapus Semua
                </Link>
              )}
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {query && (
                  <FilterChip
                    prefix="Cari"
                    label={`"${query}"`}
                    href={filterHref("q")}
                  />
                )}
                {activeCategory && (
                  <FilterChip
                    prefix="Kategori"
                    label={activeCategory.name}
                    href={filterHref("category")}
                  />
                )}
                {activeBrand && (
                  <FilterChip
                    prefix="Brand"
                    label={activeBrand.name}
                    href={filterHref("brand")}
                  />
                )}
              </div>
            )}
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
  );
}

function FilterChip({
  prefix,
  label,
  href,
}: {
  prefix: string;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 rounded-full border border-neutral-200 bg-brand-light px-3 py-1.5 text-xs font-bold text-neutral-700 transition-colors hover:border-red-300 hover:text-red-500"
    >
      <span className="font-medium text-neutral-400 transition-colors group-hover:text-red-400">
        {prefix}:
      </span>
      {label}
      <X
        size={12}
        className="text-neutral-400 transition-colors group-hover:text-red-500"
      />
    </Link>
  );
}

/* Mirrors the catalog layout while the data streams in */
function CatalogSkeleton() {
  return (
    <section className="section bg-white">
      <div className="wrapper gap-12 lg:flex-row lg:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-64 lg:gap-8">
          <div className="h-11 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-12 animate-pulse rounded-full bg-neutral-100 lg:hidden" />
          <div className="hidden flex-col gap-4 lg:flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-neutral-100"
                style={{ width: `${90 - (i % 4) * 12}%` }}
              />
            ))}
          </div>
        </aside>
        <div className="flex flex-1 flex-col gap-8">
          <div className="border-b border-neutral-100 pb-4">
            <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 rounded-brand border border-neutral-200 bg-white p-4"
              >
                <div className="aspect-square w-full animate-pulse rounded-[calc(var(--radius-brand)-0.5rem)] bg-neutral-100" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-brand-light">
      {/* Static hero renders instantly — only the catalog data streams */}
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
      <Suspense fallback={<CatalogSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
