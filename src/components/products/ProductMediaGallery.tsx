"use client";

import { useState } from "react";
import { AppImage } from "@/components/general/AppImage";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import MuxPlayer from "@mux/mux-player-react";
import { ProductMediaGalleryProps } from "@/types";
import { Play, FileText, Music } from "lucide-react";
import { getDisplayUrl } from "@/lib/utils";

export function ProductMediaGallery({ medias, productName }: ProductMediaGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (medias.length === 0) return null;

  const activeMedia = medias[index];

  // Prepare slides for lightbox
  const slides = medias.map((m) => {
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
        };
    }
    return { src: m.url, alt: m.altText || productName };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Main Display */}
      <div 
        className="relative aspect-square w-full rounded-brand overflow-hidden bg-neutral-100 shadow-xl group"
      >
        {activeMedia.type === 'video' ? (
            <div className="w-full h-full bg-black">
                <MuxPlayer
                    streamType="on-demand"
                    playbackId={activeMedia.url.split('/').pop()?.split('.')[0]}
                    metadata={{
                        video_title: productName,
                    }}
                    className="w-full h-full object-contain"
                />
            </div>
        ) : activeMedia.type === 'image' ? (
            <div className="w-full h-full cursor-pointer relative" onClick={() => setOpen(true)}>
                <AppImage
                    src={activeMedia.url}
                    alt={activeMedia.altText || productName}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-neutral-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                        Klik untuk Memperbesar
                    </span>
                </div>
            </div>
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-50 border border-neutral-200">
                <FileText size={48} className="text-neutral-300" />
                <a href={activeMedia.url} target="_blank" rel="noopener noreferrer" className="text-brand-green font-bold hover:underline">
                    Lihat Dokumen
                </a>
            </div>
        )}
      </div>

          {/* Thumbnails */}
          {medias.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {medias.map((m, i) => (
                <div
                  key={i}
                  className={`group/thumb relative aspect-square rounded-xl overflow-hidden bg-neutral-100 cursor-pointer transition-all ${
                    i === index 
                      ? "ring-2 ring-brand-green ring-offset-2 opacity-100" 
                      : "opacity-70 hover:opacity-100 hover:ring-2 hover:ring-neutral-200 hover:ring-offset-1"
                  }`}
                  onClick={() => setIndex(i)}
                >
                  <AppImage
                    src={getDisplayUrl(m)}
                    alt={m.altText || productName}
                    fill
                    className="object-cover"
                  />
                  {m.type !== 'image' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/10 transition-colors">
                        {m.type === 'video' ? <Play size={20} className="text-white fill-white" /> : m.type === 'audio' ? <Music size={20} className="text-white" /> : <FileText size={20} className="text-white" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides as Slide[]}
        plugins={[Zoom, Video]}
        on={{
          view: ({ index: currentIndex }) => setIndex(currentIndex),
        }}
      />
    </div>
  );
}