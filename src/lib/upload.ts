import { registerUploadedMedia, signMediaUpload } from "@/actions/media";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/config/media";

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
    folder?: string | null;
    xhrRef?: { current: XMLHttpRequest | null };
    onProgress?: (percent: number) => void;
  } = {},
): Promise<UploadedMedia> {
  const { folder, xhrRef, onProgress } = options;

  const isVideo = file.type.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    throw new Error(
      `Ukuran file maksimal ${isVideo ? "100MB untuk video" : "20MB untuk gambar"}`,
    );
  }

  const signed = await signMediaUpload(folder);
  if ("error" in signed) throw new Error(signed.error);

  const formData = new FormData();
  formData.append("file", file);
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
