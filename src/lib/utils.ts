import { MediaMetadata } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Robustly parse metadata even if it's stringified or corrupted by spread-string issues
 */
export function parseMetadata(val: unknown): MediaMetadata {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as MediaMetadata;
    } catch {
      return {};
    }
  }
  // Handle "spread-string" corruption (object with keys "0", "1"...)
  if (typeof val === "object" && val !== null && "0" in val && "1" in val) {
    try {
      const obj = val as Record<string, string>;
      const parts: string[] = [];
      Object.keys(obj).forEach((k) => {
        if (!isNaN(Number(k))) parts[parts.length] = obj[k];
      });
      const recovered = parts.join("");
      const parsed = JSON.parse(recovered) as MediaMetadata;

      const final = { ...parsed };
      Object.keys(obj).forEach((k) => {
        if (isNaN(Number(k))) final[k] = obj[k];
      });
      return final;
    } catch {
      return val as MediaMetadata;
    }
  }
  return val as MediaMetadata;
}

/**
 * Resolves the correct display URL for a media item (derives a Cloudinary
 * still-frame thumbnail for videos so they can render inside <img>/<Image>)
 */
export function getDisplayUrl(
  media: { url: string; type: string; metadata?: unknown } | null | undefined,
) {
  if (!media || !media.url) return "";

  if (
    media.type === "video" &&
    typeof media.url === "string" &&
    media.url.includes("res.cloudinary.com")
  ) {
    // so_0 = frame at 0s; swapping the extension makes Cloudinary serve it
    // as an image instead of a video file
    return media.url
      .replace("/video/upload/", "/video/upload/so_0/")
      .replace(/\.[^/.]+$/, ".jpg");
  }
  return media.url;
}

export function handleUploadError(
  error: unknown,
  fallbackMessage: string,
  options?: { suppressPattern?: RegExp },
) {
  const message =
    error instanceof Error && error.message ? error.message : fallbackMessage;
  const suppressPattern = options?.suppressPattern;
  if (!suppressPattern?.test(message)) {
    console.error("Upload error:", error);
  }
  return message;
}
