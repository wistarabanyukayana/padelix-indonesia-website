"use client";

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { uploadFile, deleteMedia } from "@/actions/media";
import { createMuxUpload, getMuxMediaByUploadId } from "@/actions/mux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MediaUploadButton({ currentFolder }: { currentFolder?: string | null }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [queueStatus, setQueueStatus] = useState<{ current: number; total: number } | null>(null);
  const router = useRouter();
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pendingMediaIdRef = useRef<number | null>(null);

  const handleCancel = async () => {
    if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;

        // Clean up DB record
        if (pendingMediaIdRef.current) {
            await deleteMedia(pendingMediaIdRef.current);
            pendingMediaIdRef.current = null;
        }

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
      if (file.type.startsWith("video/")) {
        const uploadInfo = await createMuxUpload(file.name, currentFolder, file.size);
        
        // Link record ID for potential cleanup
        const initialRecord = await getMuxMediaByUploadId(uploadInfo.id);
        if (initialRecord) pendingMediaIdRef.current = initialRecord.id;

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('PUT', uploadInfo.url);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error('Mux upload failed'));
          xhr.onerror = () => reject(new Error('Mux upload error'));
          xhr.onabort = () => reject('ABORTED');
        });

        xhr.send(file);
        await uploadPromise;
        xhrRef.current = null;
        pendingMediaIdRef.current = null;

        // Finalize: Poll for the DB record to be updated with asset ID (by webhook)
        let attempts = 0;
        while(attempts < 10) {
          try {
            const media = await getMuxMediaByUploadId(uploadInfo.id);
            if (media && media.url) break;
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
          } catch {
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
          }
        }
        toast.success("Video berhasil diunggah");
      } else {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) {
            formData.append("folder", currentFolder);
        }
        const result = await uploadFile(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("File berhasil diunggah");
        }
      }
      
      router.refresh();
    } catch (error) {
      if (error === 'ABORTED') return;
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah file.");
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
    <div className="relative flex items-center gap-2 text-nowrap lg:text-wrap w-auto">
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
        className="inline-flex items-center justify-center rounded-brand transition-all active:scale-95 disabled:opacity-50 bg-brand-dark text-white hover:bg-black px-4 py-2 text-sm font-medium gap-2 shadow-lg cursor-pointer"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>
              {queueStatus ? `Mengunggah ${queueStatus.current}/${queueStatus.total}` : "Mengunggah..."}
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
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
            title="Batalkan Unggahan"
        >
            <X size={16} />
        </button>
      )}
    </div>
  );
}
