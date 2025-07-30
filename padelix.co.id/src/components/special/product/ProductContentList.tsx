"use client";

import { ProductProps } from "@/types";
import { getContentList } from "@/data/loaders";

import { Pagination } from "@/components/tools/Pagination";
import { Search } from "@/components/tools/Search";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StimulatedProgress } from "@/components/general/StimulatedProgress";

interface ContentListProps {
  headline: string;
  path: string;
  featured?: boolean;
  component: React.ComponentType<
    ProductProps & {
      basePath: string;
      showSpecification?: boolean;
      className?: string;
      itemImageClassName?: string;
    }
  >;
  headlineAlignment?: "center" | "right" | "left";
  showSearch?: boolean;
  showPagination?: boolean;
  showSpecification?: boolean;
  itemClassName?: string;
  itemImageClassName?: string;
  className?: string;
}

export async function loadData(path: string, featured?: boolean, query?: string, page?: string) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const data = await getContentList(path, featured, query, page);
  return data;
}

export function ProductContentList({
  headline,
  path,
  featured,
  component,
  headlineAlignment,
  showSearch,
  showPagination,
  showSpecification = true,
  itemClassName,
  itemImageClassName,
  className,
}: Readonly<ContentListProps>) {
  

  // 1. Read search and page from the URL
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";

  // 2. State for products and page count
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);

  // 3. Fetch data when query or page changes
  useEffect(() => {
    async function loader(
      path: string,
      featured?: boolean,
      query?: string,
      page?: string
    ) {
      setLoading(true);

      const { data, meta } = await loadData(path, featured, query, page);
      setProducts((data as ProductProps[]) || [])
      setPageCount(meta?.pagination?.pageCount || 1)

      setLoading(false);
    }

    loader(path, featured, query, page);
  }, [path, featured, query, page]);

  console.log(products);
  
  const Component = component;
  return (
    <section className={cn("section", className)}>
      <h3 className={`h3 w-full ${`text-${headlineAlignment}`}`}>
        {headline || "Featured Articles"}
      </h3>
      {showSearch && <Search />}
      {loading ? (
        <StimulatedProgress />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 p-4 h-full">
          {products.map((product) => (
            <Component
              key={product.documentId}
              {...product}
              showSpecification={showSpecification}
              basePath={path}
              className={itemClassName}
              itemImageClassName={itemImageClassName}
            />
          ))}
        </div>
      )}
      {showPagination && <Pagination pageCount={pageCount} />}
    </section>
  );
}
