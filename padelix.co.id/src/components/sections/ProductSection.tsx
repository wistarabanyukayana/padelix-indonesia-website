import { ProductSectionProps, ProductProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { getContent } from "@/data/loaders";
import { ProductCarousel } from "../general/ProductCarousel";

export async function ProductSection({
  subheading,
  backgroundColor,
}: Readonly<ProductSectionProps>) {
  const { data: products } = await getContent("/api/products");

  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center flex-col sm:py-13 gap-3 sm:gap-12 h-[calc(100svh-4.75rem)] sm:h-auto scroll-mt-[4.75rem] sm:scroll-mt-[6.25rem] lg:gap-6 xl:gap-2`}
    >
      <h3 className="subheading">{subheading}</h3>

      <ProductCarousel
        products={products as ProductProps[]}
        basePath="products"
      />
    </section>
  );
}
