import { registerUploadedMedia, signMediaUpload } from "@/actions/media";
import { MEDIA_CAPS, resolveMediaKind } from "@/config/media";

interface CloudinaryUploadResponse {
  public_id: string;
  resource_type: "image" | "video" | "raw";
}

export interface UploadedMedia {
  id: number;
  url: string;
  resourceType: "image" | "video" | "raw";
}

/**
 * Uploads a file straight from the browser to Cloudinary (signed by the
 * server) and registers it in the medias table. Vercel functions cap
 * request bodies at ~4.5MB, so the file must not pass through a Server
 * Action — it goes browser → Cloudinary, then only the public_id goes to
 * the server for registration.
 *
 * Rejects with the string "ABORTED" when cancelled via xhrRef.
 */
export async function uploadFileToCloudinary(
  file: File,
  options: {
    folderId?: number | null;
    xhrRef?: { current: XMLHttpRequest | null };
    onProgress?: (percent: number) => void;
  } = {},
): Promise<UploadedMedia> {
  const { folderId, xhrRef, onProgress } = options;

  const kind = resolveMediaKind(file.name, file.type);

  // Compress images in the browser before the size gate so large photos still
  // succeed and upload fast. Skip gif/svg (animation/vector) and fall back to
  // the original on any failure, so uploads never break.
  let toUpload = file;
  if (kind === "image" && isCompressibleImage(file)) {
    try {
      const { default: imageCompression } =
        await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 2000,
        maxSizeMB: 1.5,
        useWebWorker: true,
        initialQuality: 0.8,
      });
      if (compressed.size < file.size) toUpload = compressed;
    } catch {
      toUpload = file;
    }
  }

  const cap = MEDIA_CAPS[kind];
  if (toUpload.size > cap.maxBytes) {
    throw new Error(
      kind === "video"
        ? `Video melebihi ${cap.sizeLabel}. Coba unggah versi lebih pendek atau resolusi 1080p.`
        : `Ukuran file maksimal ${cap.sizeLabel} untuk ${cap.noun}.`,
    );
  }

  const signed = await signMediaUpload();
  if ("error" in signed) throw new Error(signed.error);

  const formData = new FormData();
  formData.append("file", toUpload);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);

  const xhr = new XMLHttpRequest();
  if (xhrRef) xhrRef.current = xhr;
  xhr.open(
    "POST",
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`,
  );

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable && onProgress) {
      onProgress(Math.round((event.loaded / event.total) * 100));
    }
  };

  const uploaded = await new Promise<CloudinaryUploadResponse>(
    (resolve, reject) => {
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve(JSON.parse(xhr.responseText))
          : reject(new Error("Cloudinary upload failed"));
      xhr.onerror = () => reject(new Error("Cloudinary upload error"));
      xhr.onabort = () => reject("ABORTED");
      xhr.send(formData);
    },
  );
  if (xhrRef) xhrRef.current = null;

  const result = await registerUploadedMedia(
    uploaded.public_id,
    file.name,
    uploaded.resource_type,
    folderId ?? null,
  );
  if (result.error || result.url === undefined || result.id === undefined) {
    throw new Error(result.error || "Gagal menyimpan media");
  }

  return {
    id: result.id,
    url: result.url,
    resourceType: uploaded.resource_type,
  };
}

const COMPRESSIBLE_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Only the raster formats browser-image-compression handles well. Empty MIME
// falls back to the file extension. GIF (animation) and SVG (vector) are
// excluded so they aren't flattened/rasterized.
function isCompressibleImage(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (mime) return COMPRESSIBLE_IMAGE_MIME.has(mime);
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return ["jpg", "jpeg", "png", "webp"].includes(ext);
}
