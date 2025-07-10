import { ProductProps } from "@/types";
import { getContent } from "@/data/loaders";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ContentCarouselProps {
  query?: string;
  path: string;
  featured?: boolean;
  custom?: boolean;
  component: React.ComponentType<ProductProps & { basePath: string }>;
}

async function loader(path: string) {
  const { data, meta } = await getContent(path);
  return {
    products: (data as ProductProps[]) || [],
  };
}

export async function ContentCarousel({
  path,
  component,
}: Readonly<ContentCarouselProps>) {
  const { products } = await loader(path);
  const Component = component;

  return (
    <Carousel
      className="carrier items-center justify-center"
      opts={{ loop: true }}
    >
      <CarouselPrevious
        className="left-0 top-1/2 -translate-y-1/2 z-10 text-[60px]"
        variant="link"
        iconSize={[60, 1]}
      />
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem key={product.documentId} className="px-17">
            <Component {...product} basePath={path} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext
        className="right-0 top-1/2 -translate-y-1/2 z-10"
        variant="link"
        iconSize={[60, 1]}
      />
    </Carousel>
  );
}
