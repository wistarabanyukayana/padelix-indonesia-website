"use client";

import { useState } from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { AppImage } from "@/components/general/AppImage";
import { Reveal } from "@/components/general/Reveal";
import { cn, getDisplayUrl } from "@/lib/utils";
import { PortfolioProps } from "@/types";
import { Images, Play, ZoomIn } from "lucide-react";

export function Portfolio({ items }: PortfolioProps) {
  const [open, setOpen] = useState(false);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  if (items.length === 0) return null;

  const currentPortfolio = items[activePortfolioIndex];
  const slides = currentPortfolio.medias.map((m) => {
    if (m.type === "video") {
      return {
        type: "video",
        sources: [
          {
            src: m.url,
            type: "video/mp4",
          },
        ],
        poster: getDisplayUrl(m),
        title: currentPortfolio.title,
        description: currentPortfolio.location || "",
      };
    }
    return {
      src: m.url,
      title: currentPortfolio.title,
      description: currentPortfolio.location || "",
    };
  });

  return (
    <section
      id="activities"
      className="section relative overflow-hidden bg-court-950 text-white"
    >
      <div className="bg-mesh absolute inset-0" aria-hidden />

      <div className="wrapper relative gap-12">
        <Reveal>
          <div className="flex flex-col items-start gap-3">
            <span className="kicker text-brand-green">Portofolio</span>
            <h2 className="display-2 text-white">Proyek & Aktivitas</h2>
          </div>
        </Reveal>

        {/* Asymmetric editorial grid: first project gets the spotlight */}
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item, idx) => {
            const hasVideo = item.medias.some((m) => m.type === "video");
            const isFeature = idx === 0;
            return (
              <Reveal
                key={item.id}
                delay={idx * 100}
                className={cn(isFeature && "md:col-span-2 md:row-span-2")}
              >
                <button
                  type="button"
                  aria-label={`Lihat galeri ${item.title}`}
                  className={cn(
                    "group relative block w-full cursor-pointer overflow-hidden rounded-brand bg-court-800 text-left shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-brand-green/60",
                    isFeature
                      ? "aspect-video md:aspect-auto md:h-full md:min-h-130"
                      : "aspect-video",
                  )}
                  onClick={() => {
                    setActivePortfolioIndex(idx);
                    setImageIndex(0);
                    setOpen(true);
                  }}
                >
                  <AppImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes={
                      isFeature
                        ? "(max-width: 768px) 92vw, 800px"
                        : "(max-width: 768px) 92vw, 400px"
                    }
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-court-950/95 via-court-950/20 to-transparent p-6 sm:p-8">
                    {item.location && (
                      <span className="text-xs font-bold tracking-[0.2em] text-brand-green uppercase">
                        {item.location}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-3">
                      <h3
                        className={cn(
                          "font-display tracking-wide uppercase",
                          isFeature ? "text-2xl sm:text-4xl" : "text-xl",
                        )}
                      >
                        {item.title}
                      </h3>
                      {hasVideo && (
                        <Play
                          size={20}
                          className="shrink-0 fill-brand-green text-brand-green"
                        />
                      )}
                    </div>
                    {item.medias.length > 1 && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                        <Images size={13} /> {item.medias.length} Media
                      </span>
                    )}
                  </div>

                  {/* Zoom indicator */}
                  <div className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <ZoomIn size={18} className="text-white" />
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={imageIndex}
        slides={slides as Slide[]}
        plugins={[Zoom, Video]}
        on={{
          view: ({ index }) => setImageIndex(index),
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
      />
    </section>
  );
}
