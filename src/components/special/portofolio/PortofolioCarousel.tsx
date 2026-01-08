"use client";

import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { PortofolioContentCarousel } from "./PortofolioContentCarousel";
import { MediaPlayerProps } from "@/types";

interface PortofolioCarouselProps {
  portofoliosMedia: MediaPlayerProps[];
}

export function PortofolioCarousel({ portofoliosMedia }: PortofolioCarouselProps) {
  // Define carousel options and plugins here
  const opts = { loop: true };
  const autoplay = useRef(Autoplay({ delay: 8000, stopOnInteraction: false }));

  return (
    <PortofolioContentCarousel
      portofoliosMedia={portofoliosMedia}
      opts={opts}
      plugins={[autoplay.current]}
    />
  );
}
