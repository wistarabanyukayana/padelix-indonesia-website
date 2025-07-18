import { ProductSectionProps, ProductProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { getContentCarousel } from "@/data/loaders";
import { ProductCarousel } from "../general/ProductCarousel";

export async function ProductSection({
  subheading,
  backgroundColor,
}: Readonly<ProductSectionProps>) {
  const { data: products } = await getContentCarousel("/api/products");

  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section  sm:py-13 gap-3 sm:gap-12 lg:gap-6 xl:gap-2 h-[calc(100svh-4.75rem)] sm:h-auto ${getBackgroundColor(
        backgroundColor
      )}`}
    >
      <h3 className="subheading">{subheading}</h3>

      <ProductCarousel
        products={products as ProductProps[]}
        basePath="products"
      />
    </section>
  );
}
