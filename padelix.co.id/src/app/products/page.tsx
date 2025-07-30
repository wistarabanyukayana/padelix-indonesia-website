import { ProductContentList } from "@/components/special/product/ProductContentList";
import { ProductListCard } from "@/components/special/product/ProductListCard";

export default function ProductRoute() {
  return (
    <ProductContentList
      headline="Katalog Produk"
      path="/api/products"
      component={ProductListCard}
      showSearch
      showPagination
      itemClassName="bg-lime-400 p-4 rounded-[1.875rem] xl:h-auto"
      showSpecification={false}
      itemImageClassName="lg:max-w-[15.375rem] xl:lg:max-w-[17.375rem]"
      headlineAlignment="center"
      className="h-full"
    />
  );
}
