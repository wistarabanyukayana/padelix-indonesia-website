import { ProductSectionProps, ProductProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { getContentCarousel } from "@/data/loaders";
import { ProductCarousel } from "../special/product/ProductCarousel";

export async function ProductSection({
  subheading,
  backgroundColor,
}: Readonly<ProductSectionProps>) {
  const { data: products } = await getContentCarousel("/api/products", true);

  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section gap-3 sm:py-13 sm:gap-12 lg:gap-6 xl:gap-2 ${getBackgroundColor(
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
