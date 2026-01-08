"use client";

import React, { useState, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Hls from "hls.js";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { MediaPlayerProps } from "@/types";
import ReactMarkdown from "react-markdown";
import { AppImage } from "@/components/general/AppImage";

// MuxPlayer component
const MuxPlayer = ({ playbackId }: { playbackId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const src = `https://stream.mux.com/${playbackId}.m3u8`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error encountered, trying to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error encountered, trying to recover");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable fatal error", data);
              hls.destroy();
              break;
          }
        }
      });
    } else {
      console.error("This is an unsupported browser");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-full object-contain object-center rounded-[1.875rem]"
    />
  );
};

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface ContentCarouselProps {
  portofoliosMedia: MediaPlayerProps[];
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
}

export function PortofolioContentCarousel({
  portofoliosMedia,
  opts,
  plugins,
}: ContentCarouselProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = (portofoliosMedia || [])
    .map((portofolio) => {
      // Handle Strapi images
      if (portofolio.media && portofolio.media.length > 0) {
        const firstMedia = portofolio.media[0];
        if (firstMedia.mime?.startsWith("image")) {
          return {
            src: firstMedia.url,
            alt: firstMedia.alternativeText || "…",
            width: 1920,
            height: 1080,
          };
        }
      }
      return null;
    })
    .filter((slide) => slide !== null) as {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];

  const renderMedia = (portofolio: MediaPlayerProps, index: number) => {
    // Prioritize Mux video
    if (portofolio.muxVideo) {
      const { isReady, playback_id, playbackId } = portofolio.muxVideo;
      const effectivePlaybackId = playbackId || playback_id;

      if (isReady && effectivePlaybackId) {
        return <MuxPlayer playbackId={effectivePlaybackId} />;
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-black rounded-[1.875rem]">
          <p className="text-white text-center p-4">Video is processing, please check back later.</p>
        </div>
      );
    }

    // Fallback to Strapi media
    if (portofolio.media && portofolio.media.length > 0) {
      const firstMedia = portofolio.media[0];
      if (firstMedia.mime?.startsWith("image")) {
        return (
          <AppImage
            src={firstMedia.url || ""}
            alt={firstMedia.alternativeText || "…"}
            height={1080}
            width={1920}
            className="w-full h-full object-contain object-center rounded-[1.875rem]"
            priority={index === 0}
          />
        );
      }
      if (firstMedia.mime?.startsWith("audio")) {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 rounded-[1.875rem] p-4">
            <audio src={firstMedia.url} controls className="w-full" />
          </div>
        );
      }
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-black rounded-[1.875rem]">
        <p className="text-white">Media not available</p>
      </div>
    );
  };

  return (
    <>
      <Carousel
        className="wrapper flex-col justify-evenly h-full sm:h-auto"
        opts={opts}
        plugins={plugins}
      >
        <CarouselContent>
          {(portofoliosMedia || []).map((portofolio, index) => {
            const isImage = portofolio.media && portofolio.media[0]?.mime?.startsWith("image");

            return (
              <CarouselItem
                key={portofolio.id}
                className="flex flex-col justify-evenly items-center max-w-[16.375rem] p-5 sm:rounded-none basis-full sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <div
                  className="flex justify-center items-center w-full h-48 overflow-hidden bg-black rounded-[1.875rem]"
                  onClick={() => {
                    if (isImage) {
                      setOpen(true);
                      const imageIndex = slides.findIndex(
                        (slide) => slide.src === portofolio.media![0]?.url
                      );
                      if (imageIndex !== -1) {
                        setIndex(imageIndex);
                      }
                    }
                  }}
                  role={isImage ? "button" : "presentation"}
                  tabIndex={isImage ? 0 : -1}
                >
                  {renderMedia(portofolio, index)}
                </div>

                <div className="text-center text-slate-50 mt-4">
                  <ReactMarkdown>{portofolio.mediaText}</ReactMarkdown>
                </div>
              </CarouselItem>
            );
          })}
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
