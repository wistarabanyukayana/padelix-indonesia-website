"use client";

import { AppImage } from "@/components/general/AppImage";
import { getDisplayUrl } from "@/lib/utils";
import { ProductMediaGalleryProps } from "@/types";
import MuxPlayer from "@mux/mux-player-react";
import { FileText, Music, Play } from "lucide-react";
import { useState } from "react";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

export function ProductMediaGallery({
  medias,
  productName,
}: ProductMediaGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (medias.length === 0) return null;

  const activeMedia = medias[index];

  // Prepare slides for lightbox
  const slides = medias.map((m) => {
    if (m.type === "video") {
      const playbackId = m.url.split("/").pop()?.split(".")[0];
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
      <div className="group relative aspect-square w-full overflow-hidden rounded-brand bg-neutral-100 shadow-xl">
        {activeMedia.type === "video" ? (
          <div className="h-full w-full bg-black">
            <MuxPlayer
              streamType="on-demand"
              playbackId={activeMedia.url.split("/").pop()?.split(".")[0]}
              metadata={{
                video_title: productName,
              }}
              className="h-full w-full object-contain"
            />
          </div>
        ) : activeMedia.type === "image" ? (
          <div
            className="relative h-full w-full cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <AppImage
              src={activeMedia.url}
              alt={activeMedia.altText || productName}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 shadow-lg backdrop-blur-sm">
                Klik untuk Memperbesar
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 border border-neutral-200 bg-neutral-50">
            <FileText size={48} className="text-neutral-300" />
            <a
              href={activeMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-green hover:underline"
            >
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
              className={`group/thumb relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-neutral-100 transition-all ${
                i === index
                  ? "opacity-100 ring-2 ring-brand-green ring-offset-2"
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
              {m.type !== "image" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover/thumb:bg-black/10">
                  {m.type === "video" ? (
                    <Play size={20} className="fill-white text-white" />
                  ) : m.type === "audio" ? (
                    <Music size={20} className="text-white" />
                  ) : (
                    <FileText size={20} className="text-white" />
                  )}
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
