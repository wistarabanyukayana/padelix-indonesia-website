"use client";

import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ProductContentCarousel } from "./ProductContentCarousel";
import { ProductCarouselCard } from "./ProductCarouselCard";
import { ProductProps } from "@/types";

interface ProductCarouselProps {
  products: ProductProps[];
  basePath: string;
}

export function ProductCarousel({ products, basePath }: ProductCarouselProps) {
  // Define carousel options and plugins here
  const opts = { loop: true };
  const autoplay = useRef(Autoplay({ delay: 8000, stopOnInteraction: false }));

  return (
    <ProductContentCarousel
      products={products}
      component={ProductCarouselCard}
      basePath={basePath}
      opts={opts}
      plugins={[autoplay.current]}
    />
  );
}
