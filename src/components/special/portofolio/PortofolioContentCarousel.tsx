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
      className="w-full h-full object-cover object-center"
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

  // Prepare slides for Lightbox (only images)
  const slides = (portofoliosMedia || [])
    .map((portofolio) => {
      if (portofolio.media && portofolio.media.length > 0) {
        const firstMedia = portofolio.media[0];
        if (firstMedia.mime?.startsWith("image")) {
          return {
            src: firstMedia.url || "",
            alt: firstMedia.alternativeText || "Portfolio Image",
            width: 1920,
            height: 1080,
          };
        }
      }
      return null;
    })
    .filter((slide): slide is NonNullable<typeof slide> => slide !== null);

  const renderMedia = (portofolio: MediaPlayerProps, index: number) => {
    // Prioritize Mux video
    if (portofolio.muxVideo) {
      const { isReady, playback_id, playbackId } = portofolio.muxVideo;
      const effectivePlaybackId = playbackId || playback_id;

      if (isReady && effectivePlaybackId) {
        return <MuxPlayer playbackId={effectivePlaybackId} />;
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-neutral-900">
          <p className="text-white text-xs text-center p-2">Video processing...</p>
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
            alt={firstMedia.alternativeText || "Portfolio"}
            width={600}
            height={450}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            priority={index === 0}
          />
        );
      }
      if (firstMedia.mime?.startsWith("audio")) {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full bg-neutral-900 p-4">
            <audio src={firstMedia.url} controls className="w-full" />
          </div>
        );
      }
    }

    return (
      <div className="flex items-center justify-center w-full h-full bg-neutral-900">
        <p className="text-white text-xs">No Media</p>
      </div>
    );
  };

  return (
    <>
      <Carousel
        className="wrapper flex-col justify-evenly h-full w-full"
        opts={{
          align: "start",
          loop: true,
          ...opts,
        }}
        plugins={plugins}
      >
        <CarouselContent className="-ml-4">
          {(portofoliosMedia || []).map((portofolio, index) => {
            const isImage = portofolio.media?.[0]?.mime?.startsWith("image");

            return (
              <CarouselItem
                key={portofolio.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="flex flex-col gap-4">
                  {/* Media Container */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-brand bg-neutral-800 group"
                    onClick={() => {
                      if (isImage) {
                        const slideIndex = slides.findIndex(
                          (slide) => slide.src === portofolio.media![0]?.url
                        );
                        if (slideIndex !== -1) {
                          setIndex(slideIndex);
                          setOpen(true);
                        }
                      }
                    }}
                    role={isImage ? "button" : "presentation"}
                    tabIndex={isImage ? 0 : -1}
                  >
                    {renderMedia(portofolio, index)}
                    
                    {/* Hover Icon for Images */}
                    {isImage && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="text-center">
                    <div className="text-white font-medium text-sm sm:text-base">
                      <ReactMarkdown>{portofolio.mediaText}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <CarouselPrevious className="static translate-y-0 bg-white/10 hover:bg-white/20 border-0 text-white" />
          <CarouselNext className="static translate-y-0 bg-white/10 hover:bg-white/20 border-0 text-white" />
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