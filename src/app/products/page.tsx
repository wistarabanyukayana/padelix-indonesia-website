import { StimulatedProgress } from "@/components/general/StimulatedProgress";
import { ProductContentList } from "@/components/special/product/ProductContentList";
import { ProductListCard } from "@/components/special/product/ProductListCard";
import { Suspense } from "react";

export const revalidate = false;

export default function ProductRoute() {
  return (
    <Suspense fallback={<StimulatedProgress />}>
      <ProductContentList
      headline="Katalog Produk"
      path="/api/products"
      component={ProductListCard}
      showSearch
      showPagination
      itemClassName="bg-lime-400 p-4 rounded-brand xl:h-auto"
      showSpecification={false}
      itemImageClassName="lg:max-w-[15.375rem] xl:lg:max-w-[17.375rem]"
      headlineAlignment="center"
      className="h-full"
    />
    </Suspense>
  );
}
