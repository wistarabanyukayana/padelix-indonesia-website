import { ProductSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { ContentCarousel } from "../general/ContentCarousel";
import { ProductCard } from "../general/ProductCard";

export function ProductSection({
  subheading,
  backgroundColor,
}: Readonly<ProductSectionProps>) {
  return (
    <section
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center flex-col py-13 gap-13`}
    >
      <h3 className="subheading">{subheading}</h3>
      <ContentCarousel path="/api/products" component={ProductCard} />
    </section>
  );
}
