import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DBMedia } from "@/types";
import { parseMetadata } from "@/lib/utils";
import { AppImage } from "@/components/general/AppImage";
import { Download, Copy, Calendar, HardDrive, FileType, MapPin, Move, Trash2, Play, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: DBMedia | null;
  onMove?: (media: DBMedia) => void;
  onDelete?: (id: number) => void;
}

export function MediaDetailsModal({ isOpen, onClose, media, onMove, onDelete }: MediaDetailsModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  if (!media) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(media.url);
    toast.success("URL disalin ke clipboard!");
  };

  const meta = parseMetadata(media.metadata);

  const folder = meta.folder || (media.url.split('/').length > 3 ? media.url.split('/').slice(2, -1).join('/') : "Root");
  const isVideoReady = media.type === 'video' && media.provider === 'mux' && meta.status === 'ready';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Media">
      <div className="flex flex-col gap-6">
        {/* Preview */}
        <div className="w-full bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-200 aspect-video relative group">
            {media.type === 'image' ? (
                <div className="relative w-full h-full cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                    <AppImage src={media.url} alt={media.name} fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                            <ZoomIn size={20} className="text-neutral-700" />
                        </div>
                    </div>
                </div>
            ) : isVideoReady ? (
                <MuxPlayer
                    playbackId={meta.playbackId as string}
                    metadata={{
                        video_title: media.name,
                    }}
                    style={{ height: '100%', width: '100%' }}
                />
            ) : (
                <div className="p-12 flex flex-col items-center justify-center gap-4 text-neutral-400">
                    {media.type === 'video' ? <Play size={48} className="animate-pulse" /> : <FileType size={48} />}
                    <span className="text-sm font-mono">{media.mimeType}</span>
                    {media.type === 'video' && !isVideoReady && (
                        <span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Processing...</span>
                    )}
                </div>
            )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
                <span className="text-neutral-500 text-xs flex items-center gap-1"><HardDrive size={12}/> Ukuran File</span>
                <span className="font-medium text-neutral-900">{(media.fileSize / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-neutral-500 text-xs flex items-center gap-1"><FileType size={12}/> Tipe MIME</span>
                <span className="font-medium text-neutral-900">{media.mimeType}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-neutral-500 text-xs flex items-center gap-1"><MapPin size={12}/> Folder</span>
                <span className="font-medium text-neutral-900">{folder}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-neutral-500 text-xs flex items-center gap-1"><Calendar size={12}/> Diunggah</span>
                <span className="font-medium text-neutral-900">{new Date(media.createdAt).toLocaleDateString("id-ID")}</span>
            </div>
        </div>

        {/* Filename */}
        <div className="bg-neutral-50 p-3 rounded border border-neutral-100 break-all text-xs font-mono text-neutral-600">
            {media.name}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-2 gap-2">
                {onMove && (
                    <Button variant="outline" onClick={() => { onMove(media); onClose(); }} size="sm" className="gap-2 justify-start">
                        <Move size={16} className="text-blue-600"/> Pindahkan
                    </Button>
                )}
                {onDelete && (
                    <Button variant="outline" onClick={() => { onDelete(media.id); onClose(); }} size="sm" className="gap-2 justify-start text-red-600 hover:bg-red-50 border-red-200">
                        <Trash2 size={16} /> Hapus Permanen
                    </Button>
                )}
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={copyToClipboard} size="sm" className="gap-2">
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

      {media.type === 'image' && (
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