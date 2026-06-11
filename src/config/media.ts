// Upload size caps, enforced client-side before upload and server-side in
// registerUploadedMedia(). 100MB is Cloudinary's free-tier per-video limit.
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
