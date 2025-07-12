"use client";

import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ContentCarousel } from "./ContentCarousel";
import { ProductCard } from "./ProductCard";
import { ProductProps } from "@/types";

interface ProductCarouselProps {
  products: ProductProps[];
  basePath: string;
}

export function ProductCarousel({ products, basePath }: ProductCarouselProps) {
  // Define carousel options and plugins here
  const opts = { loop: true };
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  return (
    <ContentCarousel
      products={products}
      component={ProductCard}
      basePath={basePath}
      opts={opts}
      plugins={[autoplay.current]}
    />
  );
}
