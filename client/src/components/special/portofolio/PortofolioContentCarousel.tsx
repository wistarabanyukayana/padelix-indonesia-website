"use client";

import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { LogoProps } from "@/types";
import ReactMarkdown from "react-markdown";
import { StrapiImage } from "@/components/general/StrapiImage";

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface ContentCarouselProps {
  portofolios: LogoProps[];
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
}

export function PortofolioContentCarousel({
  portofolios,
  opts,
  plugins,
}: ContentCarouselProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = portofolios.map((portofolio) => ({
    src: portofolio.image.url,
    alt: portofolio.image.alternativeText || "…",
    width: portofolio.image.width,
    height: portofolio.image.height,
  }));

  return (
    <>
      <Carousel
        className="wrapper flex-col justify-evenly h-full sm:h-auto"
        opts={opts}
        plugins={plugins}
      >
        <CarouselContent>
          {portofolios.map((portofolio, i) => (
            <CarouselItem
              key={`${portofolio.image.documentId}-${i}`}
              className="flex flex-col justify-evenly items-center max-w-[16.375rem] p-5 sm:rounded-none basis-full sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <button
                type="button"
                className="flex justify-center items-center w-full  overflow-hidden"
                onClick={() => {
                  setOpen(true);
                  setIndex(i);
                }}
              >
                <StrapiImage
                  src={portofolio.image.url}
                  alt={portofolio.image.alternativeText || "…"}
                  height={1280}
                  width={720}
                  className="w-full h-full object-contain object-center rounded-[1.875rem]"
                />
              </button>

              <div className="text-center text-slate-50 mt-4">
                <ReactMarkdown>{portofolio.logoText}</ReactMarkdown>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-around items-center w-full">
          <CarouselPrevious
            className="relative items-center justify-center top-auto left-auto translate-0 md:left-0 md:top-1/2 md:-translate-y-1/2 z-10 text-white md:absolute"
            variant="link"
            iconSizes={[60, 1]}
          />
          <CarouselNext
            className="relative items-center justify-center top-auto right-auto translate-0 md:right-0 md:top-1/2 md:-translate-y-1/2 z-10 text-white md:absolute"
            variant="link"
            iconSizes={[60, 1]}
          />
        </div>
      </Carousel>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </>
  );
}
