import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { parseMetadata } from "@/lib/utils";
import { DBMedia } from "@/types";
import {
  Calendar,
  Copy,
  Download,
  FileType,
  HardDrive,
  MapPin,
  Move,
  Trash2,
  ZoomIn,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: DBMedia | null;
  folderPath?: string | null;
  onMove?: (media: DBMedia) => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function MediaDetailsModal({
  isOpen,
  onClose,
  media,
  folderPath,
  onMove,
  onDelete,
  isDeleting = false,
}: MediaDetailsModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!media) return null;

  const formatBytes = (bytes: number) => {
    if (!bytes) return "Tidak tersedia";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(media.url);
    toast.success("URL disalin ke clipboard!");
  };

  const meta = parseMetadata(media.metadata);

  // Folder comes from the media_folders table (folderPath); fall back to the
  // legacy metadata.folder for rows not yet migrated, else Root.
  const folder = folderPath || meta.folder || "Root";
  const isVideo = media.type === "video";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Media">
      <div className="flex flex-col gap-6">
        {/* Preview */}
        <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
          {media.type === "image" ? (
            <div
              className="relative h-full w-full cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <AppImage
                src={media.url}
                alt={media.name}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/5 group-hover:opacity-100">
                <div className="rounded-full bg-white/90 p-2 shadow-lg">
                  <ZoomIn size={20} className="text-neutral-700" />
                </div>
              </div>
            </div>
          ) : isVideo ? (
            // Cloudinary serves H.264 MP4 directly — a plain video tag is enough
            <video
              src={media.url}
              controls
              preload="metadata"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-neutral-400">
              <FileType size={48} />
              <span className="font-mono text-sm">{media.mimeType}</span>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <HardDrive size={12} /> Ukuran File
            </span>
            <span className="font-medium text-neutral-900">
              {formatBytes(media.fileSize)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <FileType size={12} /> Tipe MIME
            </span>
            <span className="font-medium text-neutral-900">
              {media.mimeType}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <MapPin size={12} /> Folder
            </span>
            <span className="font-medium text-neutral-900">{folder}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar size={12} /> Diunggah
            </span>
            <span className="font-medium text-neutral-900">
              {new Date(media.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>

        {/* Filename */}
        <div className="rounded border border-neutral-100 bg-neutral-50 p-3 font-mono text-xs break-all text-neutral-600">
          {media.name}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {onMove && (
              <Button
                variant="outline"
                onClick={() => {
                  onMove(media);
                  onClose();
                }}
                size="sm"
                className="justify-start gap-2"
              >
                <Move size={16} className="text-blue-600" /> Pindahkan
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
              onClick={() => {
                onDelete(media.id);
              }}
              disabled={isDeleting}
              size="sm"
              className="justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 size={16} /> {isDeleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              size="sm"
              className="gap-2"
            >
              <Copy size={16} /> Salin URL
            </Button>
            <a href={media.url} download target="_blank" rel="noreferrer">
              <Button variant="dark" size="sm" className="gap-2">
                <Download size={16} /> Download
              </Button>
            </a>
          </div>
        </div>
      </div>

      {media.type === "image" && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={[{ src: media.url, alt: media.name }]}
          plugins={[Zoom]}
          zoom={{ maxZoomPixelRatio: 3 }}
        />
      )}
    </Modal>
  );
}
