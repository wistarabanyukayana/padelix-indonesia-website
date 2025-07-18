import { ProductProps } from "@/types";
import { getContentList } from "@/data/loaders";

import { Pagination } from "@/components/tools/Pagination";
import { Search } from "@/components/tools/Search";

interface ContentListProps {
  headline: string;
  query?: string;
  path: string;
  featured?: boolean;
  component: React.ComponentType<ProductProps & { basePath: string }>;
  headlineAlignment?: "center" | "right" | "left";
  showSearch?: boolean;
  page?: string;
  showPagination?: boolean;
}

async function loader(
  path: string,
  featured?: boolean,
  query?: string,
  page?: string
) {
  const { data, meta } = await getContentList(path, featured, query, page);
  return {
    products: (data as ProductProps[]) || [],
    pageCount: meta?.pagination?.pageCount || 1,
  };
}

export async function ProductContentList({
  headline,
  path,
  featured,
  component,
  headlineAlignment,
  showSearch,
  query,
  page,
  showPagination,
}: Readonly<ContentListProps>) {
  const { products, pageCount } = await loader(path, featured, query, page);
  const Component = component;
  return (
    <section className="section">
      <h3
        className={`content-items__headline ${`content-items--${headlineAlignment}`}`}
      >
        {headline || "Featured Articles"}
      </h3>
      {showSearch && <Search />}
      <div className="flex flex-col gap-4">
        {products.map((article) => (
          <Component key={article.documentId} {...article} basePath={path} />
        ))}
      </div>
      {showPagination && <Pagination pageCount={pageCount} />}
    </section>
  );
}
