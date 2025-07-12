"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductProps } from "@/types";

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface ContentCarouselProps {
  products: ProductProps[];
  component: React.ComponentType<ProductProps & { basePath: string }>;
  basePath: string;
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
}

export function ContentCarousel({
  products,
  component: Component,
  basePath,
  opts,
  plugins,
}: ContentCarouselProps) {
  return (
    <Carousel
      className="carrier flex-col items-center justify-evenly h-full sm:h-auto"
      opts={opts}
      plugins={plugins}
    >
      <CarouselContent>
        {products.map((product, index) => (
          <CarouselItem
            key={`${product.documentId}-${index}`}
            className="flex px-17 max-h-[40rem] sm:h-auto items-start sm:items-center"
          >
            <Component {...(product as ProductProps)} basePath={basePath} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-around items-center w-full">
        <CarouselPrevious
          className="relative items-center justify-center top-auto left-auto translate-0 md:left-0 md:top-1/2 md:-translate-y-1/2 z-10 md:absolute"
          variant="link"
          iconSizes={[60, 1]}
        />
        <CarouselNext
          className="relative items-center justify-center top-auto right-auto translate-0 md:right-0 md:top-1/2 md:-translate-y-1/2 z-10 md:absolute"
          variant="link"
          iconSizes={[60, 1]}
        />
      </div>
    </Carousel>
  );
}
