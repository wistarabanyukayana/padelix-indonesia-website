"use client";

import React, { useState } from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

import { AppImage } from "@/components/general/AppImage";
import { PortfolioProps } from "@/types";
import { Play } from "lucide-react";

export function Portfolio({ items }: PortfolioProps) {
  const [open, setOpen] = useState(false);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  if (items.length === 0) return null;

  const currentPortfolio = items[activePortfolioIndex];
  const slides = currentPortfolio.medias.map((m) => {
    if (m.type === 'video') {
        const playbackId = m.url.split('/').pop()?.split('.')[0];
        return {
            type: "video",
            sources: [
                {
                    src: m.url,
                    type: "application/x-mpegURL",
                },
            ],
            poster: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
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
    <section id="portfolio" className="section bg-brand-dark text-white">
      <div className="wrapper gap-12">
        <div className="text-center flex flex-col gap-2">
          <span className="subheading text-brand-green">Hasil Kerja</span>
          <h2 className="h2 text-white">Proyek Berjalan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {items.map((item, idx) => {
            const hasVideo = item.medias.some(m => m.type === 'video');
            return (
              <div 
                key={item.id} 
                className="group relative overflow-hidden rounded-brand bg-neutral-800 aspect-video cursor-pointer shadow-2xl"
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
                  className="group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  <span className="text-sm font-bold text-brand-green uppercase tracking-wider">{item.location}</span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    {hasVideo && <Play size={20} className="text-brand-green fill-brand-green" />}
                  </div>
                  {item.medias.length > 1 && (
                     <span className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                        <ImageIcon size={12} /> {item.medias.length} Media
                     </span>
                  )}
                </div>
                
                {/* Zoom Icon Indicator */}
                <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>
            )
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

function ImageIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
    )
}