"use client";

import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { PortofolioContentCarousel } from "./PortofolioContentCarousel";
import { LogoProps } from "@/types";

interface ProductCarouselProps {
  portofolios: LogoProps[];
}

export function PortofolioCarousel({ portofolios }: ProductCarouselProps) {
  // Define carousel options and plugins here
  const opts = { loop: true };
  const autoplay = useRef(Autoplay({ delay: 8000, stopOnInteraction: false }));

  return (
    <PortofolioContentCarousel
      portofolios={portofolios}
      opts={opts}
      plugins={[autoplay.current]}
    />
  );
}
