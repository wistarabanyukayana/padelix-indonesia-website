import { ProductContentList } from "@/components/special/product/ProductContentList";
import { ProductCard } from "@/components/special/product/ProductCard";

interface PageProps {
  searchParams: Promise<{ page?: string; query?: string }>;
}

export default async function BlogRoute({ searchParams }: PageProps) {
  const { page, query } = await searchParams;
  return (
    <div className="blog-page">
      <ProductContentList
        headline="Katalog Produk"
        path="/api/products"
        component={ProductCard}
        showSearch
        query={query}
        showPagination
        page={page}
      />
    </div>
  );
}
