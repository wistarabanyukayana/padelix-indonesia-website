// Upload size caps, enforced client-side before upload (src/lib/upload.ts) and
// server-side in registerUploadedMedia(). Values are Cloudinary FREE-tier upload
// limits (verified June 2026): image 10MB, raw/document 10MB, video 100MB. Files
// over 100MB would require chunked uploading, which the app does not implement.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_RAW_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
// Cloudinary stores audio through its video pipeline, so the 100MB video cap applies.
export const MAX_AUDIO_BYTES = MAX_VIDEO_BYTES;

export type MediaKind = "image" | "video" | "audio" | "document";

// Single source of truth for caps + their Indonesian labels, so the client gate
// and the server gate can never drift apart.
export const MEDIA_CAPS: Record<
  MediaKind,
  { maxBytes: number; sizeLabel: string; noun: string }
> = {
  image: { maxBytes: MAX_IMAGE_BYTES, sizeLabel: "10MB", noun: "gambar" },
  document: { maxBytes: MAX_RAW_BYTES, sizeLabel: "10MB", noun: "dokumen" },
  video: { maxBytes: MAX_VIDEO_BYTES, sizeLabel: "100MB", noun: "video" },
  audio: { maxBytes: MAX_AUDIO_BYTES, sizeLabel: "100MB", noun: "audio" },
};

const VIDEO_EXTS = ["mp4", "mov", "webm", "mkv", "avi", "m4v"];
const AUDIO_EXTS = [
  "mp3",
  "m4a",
  "aac",
  "ogg",
  "oga",
  "wav",
  "flac",
  "wma",
  "opus",
];
const IMAGE_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
  "bmp",
  "heic",
  "heif",
];

// Resolve a coarse media kind from a browser File. MIME type first, then a file
// extension fallback for the odd/empty MIME types some browsers and phones emit
// (so a video with no MIME isn't mistaken for an image and capped at 10MB).
export function resolveMediaKind(
  fileName: string,
  mimeType: string,
): MediaKind {
  const mime = (mimeType || "").toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "document";

  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (VIDEO_EXTS.includes(ext)) return "video";
  if (AUDIO_EXTS.includes(ext)) return "audio";
  if (IMAGE_EXTS.includes(ext)) return "image";
  return "document"; // unknown → raw/document (10MB), the conservative cap
}

// Map the DB media type (resolved server-side from Cloudinary) to a cap kind.
export function kindFromMediaType(
  type: "image" | "video" | "document" | "audio" | "other",
): MediaKind {
  if (type === "image") return "image";
  if (type === "video") return "video";
  if (type === "audio") return "audio";
  return "document";
}
