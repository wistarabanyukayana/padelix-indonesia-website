"use client";

import { uploadFileToCloudinary } from "@/lib/upload";
import { handleUploadError } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function MediaUploadButton({
  currentFolder,
}: {
  currentFolder?: string | null;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [queueStatus, setQueueStatus] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const router = useRouter();
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleCancel = () => {
    if (xhrRef.current) {
      // Nothing to clean up: the asset only reaches Cloudinary on completion
      // and the DB row is only created after that.
      xhrRef.current.abort();
      xhrRef.current = null;

      setIsUploading(false);
      setProgress(0);
      setQueueStatus(null);
      toast.info("Unggahan dibatalkan");
    }
  };

  const uploadSingle = async (file: File) => {
    if (!file) return;
    setProgress(0);

    try {
      const isVideo = file.type.startsWith("video/");
      await uploadFileToCloudinary(file, {
        folder: currentFolder,
        xhrRef,
        onProgress: setProgress,
      });
      toast.success(
        isVideo ? "Video berhasil diunggah" : "File berhasil diunggah",
      );
      router.refresh();
    } catch (error) {
      if (error === "ABORTED") return;
      const message = handleUploadError(error, "Gagal mengunggah file.", {
        suppressPattern: /Sesi berakhir/i,
      });
      toast.error(message);
    }
  };

  const handleUploads = async (files: FileList) => {
    const uploadList = Array.from(files);
    if (uploadList.length === 0) return;

    setIsUploading(true);
    setQueueStatus({ current: 1, total: uploadList.length });

    try {
      for (let i = 0; i < uploadList.length; i += 1) {
        setQueueStatus({ current: i + 1, total: uploadList.length });
        await uploadSingle(uploadList[i]);
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
      setQueueStatus(null);
    }
  };

  return (
    <div className="relative flex w-auto items-center gap-2 text-nowrap lg:text-wrap">
      <input
        type="file"
        id="media-upload"
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            handleUploads(e.target.files);
            e.target.value = "";
          }
        }}
        disabled={isUploading}
      />
      <label
        htmlFor="media-upload"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-brand bg-brand-dark px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-black active:scale-95 disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>
              {queueStatus
                ? `Mengunggah ${queueStatus.current}/${queueStatus.total}`
                : "Mengunggah..."}
              {progress > 0 ? ` · ${progress}%` : ""}
            </span>
          </>
        ) : (
          <>
            <Plus size={18} />
            <span>Unggah Media</span>
          </>
        )}
      </label>

      {isUploading && (
        <button
          onClick={handleCancel}
          className="rounded-full bg-red-100 p-2 text-red-600 shadow-sm transition-colors hover:bg-red-200"
          title="Batalkan Unggahan"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
