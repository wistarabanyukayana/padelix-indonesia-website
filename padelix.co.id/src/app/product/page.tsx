import { ProductContentList } from "@/components/special/product/ProductContentList";
import { ProductCard } from "@/components/special/product/ProductCard";

interface PageProps {
  searchParams: Promise<{ page?: string; query?: string }>;
}

export default async function ProductRoute({ searchParams }: PageProps) {
  const { page, query } = await searchParams;
  return (
    <ProductContentList
      headline="Katalog Produk"
      path="/api/products"
      component={ProductCard}
      showSearch
      query={query}
      showPagination
      page={page}
      itemClassName="bg-lime-400 p-4 rounded-[1.875rem] xl:h-auto"
      showSpecification={false}
      itemImageClassName="lg:max-w-[15.375rem] xl:lg:max-w-[17.375rem]"
      headlineAlignment="center"
      className="h-full"
    />
  );
}
