"use server";

import { PERMISSIONS } from "@/config/permissions";
import { medias } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { checkPermission, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mux } from "@/lib/mux";
import { parseMetadata } from "@/lib/utils";
import { ActionState, MediaMetadata, UploadResult } from "@/types";
import { desc, eq } from "drizzle-orm";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { join } from "path";

const HEIC_EXTENSIONS = ["heic", "heif"];
const HEIC_MIME_TYPES = ["image/heic", "image/heif"];

const isHeicFilename = (filename: string) =>
  HEIC_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(`.${ext}`));

const replaceHeicExtension = (filename: string) =>
  filename.replace(/\.(heic|heif)$/i, ".jpg");

const convertHeicToJpeg = async (buffer: Buffer) => {
  const { default: heicConvert } = await import("heic-convert");
  const output = await heicConvert({
    buffer,
    format: "JPEG",
    quality: 0.85,
  });
  return Buffer.from(output);
};

export async function getPhysicalFolders(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const publicDir = join(process.cwd(), "public", "uploads");
    const folders: string[] = [];

    const scan = async (dir: string, relativeBase: string) => {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const relativePath = relativeBase
            ? `${relativeBase}/${entry.name}`
            : entry.name;
          folders.push(relativePath);
          await scan(join(dir, entry.name), relativePath);
        }
      }
    };

    await scan(publicDir, "");
    return folders;
  } catch (error) {
    console.error("Get folders error:", error);
    return [];
  }
}

export async function createPhysicalFolder(
  folderPath: string,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    // Validate path (basic security to prevent directory traversal)
    if (folderPath.includes("..") || folderPath.startsWith("/")) {
      return { message: "Nama folder tidak valid" };
    }

    const publicDir = join(process.cwd(), "public", "uploads");
    const fullPath = join(publicDir, folderPath);

    try {
      await stat(fullPath);
      return { message: "Folder sudah ada" };
    } catch {
      // Folder doesn't exist, proceed
    }

    await mkdir(fullPath, { recursive: true });
    await createAuditLog(
      "MEDIA_FOLDER_CREATE",
      undefined,
      `Created folder: ${folderPath}`,
    );

    revalidatePath("/admin");
    return { success: true, message: "Folder berhasil dibuat" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal membuat folder: " + message };
  }
}

export async function deletePhysicalFolder(
  folderPath: string,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    // Validate path
    if (folderPath.includes("..") || folderPath.startsWith("/")) {
      return { message: "Nama folder tidak valid" };
    }

    const publicDir = join(process.cwd(), "public", "uploads");
    const fullPath = join(publicDir, folderPath);

    // Check if folder exists
    try {
      await stat(fullPath);
    } catch {
      return { message: "Folder tidak ditemukan" };
    }

    // Check if folder is empty
    const entries = await readdir(fullPath);
    if (entries.length > 0) {
      return {
        message:
          "Folder tidak kosong. Harap hapus atau pindahkan isinya terlebih dahulu.",
      };
    }

    // Delete folder (using rmdir since it must be empty)
    const { rmdir } = await import("fs/promises");
    await rmdir(fullPath);
    await createAuditLog(
      "MEDIA_FOLDER_DELETE",
      undefined,
      `Deleted folder: ${folderPath}`,
    );

    revalidatePath("/admin");
    return { success: true, message: "Folder berhasil dihapus" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal menghapus folder: " + message };
  }
}

export async function uploadFile(formData: FormData): Promise<UploadResult> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "Tidak ada file yang diunggah" };
    }

    const folder = formData.get("folder") as string | null;

    // Determine type based on mime type
    let type: "image" | "video" | "document" | "audio" | "other" = "other";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";
    else if (
      file.type === "application/pdf" ||
      file.type.includes("msword") ||
      file.type.includes("officedocument")
    )
      type = "document";

    if (file.size > 50 * 1024 * 1024) {
      // Increased to 50MB
      return { error: "Ukuran file maksimal 50MB" };
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    const isHeicUpload =
      HEIC_MIME_TYPES.includes(file.type) || isHeicFilename(file.name);
    let storedMimeType = file.type;
    let storedName = file.name;

    if (isHeicUpload) {
      buffer = await convertHeicToJpeg(buffer);
      storedMimeType = "image/jpeg";
      storedName = replaceHeicExtension(file.name);
      type = "image";
    }

    // Create unique filename
    const safeName = storedName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${safeName}`;

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Create record in medias table
    const [result] = await db
      .insert(medias)
      .values({
        name: storedName,
        fileKey: filename,
        type: type,
        provider: "local",
        mimeType: storedMimeType,
        fileSize: buffer.length,
        url: fileUrl,
        metadata: folder ? { folder } : null,
      })
      .$returningId();

    await createAuditLog(
      "MEDIA_UPLOAD",
      result.id,
      `Uploaded file: ${file.name} (local)`,
    );

    revalidatePath("/admin");
    return { url: fileUrl, id: result.id };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return { error: "Gagal mengunggah file: " + message };
  }
}

export async function deleteMedia(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const mediaResult = await db
      .select()
      .from(medias)
      .where(eq(medias.id, id))
      .limit(1);
    const media = mediaResult[0];

    if (!media) return { message: "Media tidak ditemukan" };

    if (media.provider === "local") {
      const filepath = join(
        process.cwd(),
        "public",
        media.url.startsWith("/") ? media.url.substring(1) : media.url,
      );
      try {
        await unlink(filepath);
      } catch (err) {
        console.error("Failed to delete local file:", err);
      }
    } else if (media.provider === "mux") {
      const meta = media.metadata as unknown as MediaMetadata;
      if (meta?.assetId) {
        try {
          await mux.video.assets.delete(meta.assetId);
        } catch (err) {
          console.error("Failed to delete Mux asset:", err);
        }
      }
    }

    await db.delete(medias).where(eq(medias.id, id));
    await createAuditLog("MEDIA_DELETE", id, `Deleted media: ${media.name}`);
    revalidatePath("/admin");
    return { success: true, message: "Media berhasil dihapus" };
  } catch (error: unknown) {
    console.error("Delete media error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return { message: "Gagal menghapus media: " + message };
  }
}

export async function getMedias() {
  const session = await getSession();
  if (!session) return [];

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    return await db.select().from(medias).orderBy(desc(medias.createdAt));
  } catch (error) {
    console.error("Get medias error:", error);
    return [];
  }
}

export async function updateMediaFolder(
  id: number,
  folder: string | null,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const mediaResult = await db
      .select()
      .from(medias)
      .where(eq(medias.id, id))
      .limit(1);
    const media = mediaResult[0];

    if (!media) return { message: "Media tidak ditemukan" };

    const currentMeta = parseMetadata(media.metadata);

    await db
      .update(medias)
      .set({
        metadata: {
          ...currentMeta,
          folder: folder || null,
        },
      })
      .where(eq(medias.id, id));

    await createAuditLog(
      "MEDIA_MOVE",
      id,
      `Moved media ${media.name} to folder: ${folder || "Root"}`,
    );

    revalidatePath("/admin");
    return { success: true, message: "Media berhasil dipindahkan" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal memindahkan media: " + message };
  }
}

export async function syncFileSystemMedias(): Promise<
  ActionState & { addedCount?: number; muxUpdatedCount?: number }
> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const publicDir = join(process.cwd(), "public");
    const foldersToSync = ["uploads"];
    let addedCount = 0;
    let muxUpdatedCount = 0;

    // Fetch all existing media URLs once
    const existingMedias = await db
      .select({ id: medias.id, url: medias.url, name: medias.name })
      .from(medias);
    const existingUrls = new Set(existingMedias.map((m) => m.url));
    const mediaByUrl = new Map(
      existingMedias.map((media) => [media.url, media]),
    );

    const scanDir = async (relativeDir: string) => {
      const fullPath = join(publicDir, relativeDir);
      const entries = await readdir(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        let entryRelativePath = join(relativeDir, entry.name);
        let url = `/${entryRelativePath.replace(/\\/g, "/")}`;

        if (entry.isDirectory()) {
          await scanDir(entryRelativePath);
        } else {
          let ext = entry.name.split(".").pop()?.toLowerCase();
          if (ext && HEIC_EXTENSIONS.includes(ext)) {
            const sourcePath = join(publicDir, entryRelativePath);
            const convertedName = replaceHeicExtension(entry.name);
            const targetRelativePath = join(relativeDir, convertedName);
            const targetPath = join(publicDir, targetRelativePath);
            const targetUrl = `/${targetRelativePath.replace(/\\/g, "/")}`;

            try {
              await stat(targetPath);
            } catch {
              const sourceBuffer = await readFile(sourcePath);
              const convertedBuffer = await convertHeicToJpeg(sourceBuffer);
              await writeFile(targetPath, convertedBuffer);
            }

            try {
              await unlink(sourcePath);
            } catch (error) {
              console.error("Failed to delete HEIC source:", error);
            }

            const existingHeic = mediaByUrl.get(url);
            if (existingHeic && !existingUrls.has(targetUrl)) {
              const convertedStat = await stat(targetPath);
              await db
                .update(medias)
                .set({
                  name: convertedName,
                  fileKey: targetRelativePath.replace(/\\/g, "/"),
                  mimeType: "image/jpeg",
                  fileSize: convertedStat.size,
                  url: targetUrl,
                })
                .where(eq(medias.id, existingHeic.id));
              existingUrls.delete(url);
              mediaByUrl.delete(url);
              existingUrls.add(targetUrl);
              mediaByUrl.set(targetUrl, {
                ...existingHeic,
                url: targetUrl,
                name: convertedName,
              });
            }

            entryRelativePath = targetRelativePath;
            url = targetUrl;
            ext = "jpg";
          }

          // Check against set instead of DB query
          if (!existingUrls.has(url)) {
            const fileStat = await stat(join(publicDir, entryRelativePath));
            let type: "image" | "video" | "document" | "audio" | "other" =
              "other";
            if (
              ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")
            )
              type = "image";
            else if (["mp4", "webm", "ogg"].includes(ext || "")) type = "video";
            else if (["pdf", "doc", "docx"].includes(ext || ""))
              type = "document";
            else if (["mp3", "wav"].includes(ext || "")) type = "audio";

            let folder: string | null = null;
            const normalizedPath = relativeDir.replace(/\\/g, "/");
            if (normalizedPath.startsWith("uploads/"))
              folder = normalizedPath.replace("uploads/", "");
            else if (normalizedPath === "uploads") folder = null;
            else folder = normalizedPath;

            if (folder === "") folder = null;

            await db.insert(medias).values({
              name: entry.name,
              fileKey: url,
              type: type,
              provider: "local",
              mimeType:
                type === "image" && ext === "jpg"
                  ? "image/jpeg"
                  : `${type}/${ext}`,
              fileSize: fileStat.size,
              url: url,
              metadata: folder ? { folder } : null,
            });
            addedCount++;
          }
        }
      }
    };

    for (const folder of foldersToSync) {
      const folderPath = join(publicDir, folder);
      try {
        await mkdir(folderPath, { recursive: true });
        await scanDir(folder);
      } catch (e) {
        console.error(`Failed to sync folder ${folder}:`, e);
      }
    }

    const muxMedias = await db
      .select()
      .from(medias)
      .where(eq(medias.provider, "mux"));
    for (const media of muxMedias) {
      const meta = parseMetadata(media.metadata);
      let assetId = meta?.assetId;
      const uploadId =
        typeof meta?.uploadId === "string" ? meta.uploadId : null;
      let playbackId = meta?.playbackId;

      if (!assetId && uploadId) {
        try {
          const upload = await mux.video.uploads.retrieve(uploadId);
          if (upload?.asset_id) {
            assetId = upload.asset_id;
          } else if (
            upload?.status === "errored" ||
            upload?.status === "cancelled" ||
            upload?.status === "timed_out"
          ) {
            await db
              .update(medias)
              .set({
                metadata: {
                  ...meta,
                  status: "errored",
                  uploadStatus: upload.status,
                  error: `Mux upload ${upload.status}`,
                },
              })
              .where(eq(medias.id, media.id));
            muxUpdatedCount += 1;
            continue;
          } else if (upload?.status) {
            const createdAt = media.createdAt
              ? new Date(media.createdAt).getTime()
              : 0;
            const ageMs = createdAt ? Math.max(0, Date.now() - createdAt) : 0;
            const staleThresholdMs = 60 * 60 * 1000;

            if (ageMs && ageMs > staleThresholdMs) {
              await db
                .update(medias)
                .set({
                  metadata: {
                    ...meta,
                    status: "errored",
                    uploadStatus: upload.status,
                    error: `Mux upload stale (${upload.status})`,
                  },
                })
                .where(eq(medias.id, media.id));
              muxUpdatedCount += 1;
              continue;
            }

            console.warn(
              `Mux upload ${uploadId} has no asset yet (status: ${upload.status}, ageMs: ${ageMs}).`,
            );
          }
        } catch (error) {
          console.error(`Failed to retrieve Mux upload ${uploadId}:`, error);
          await db
            .update(medias)
            .set({
              metadata: {
                ...meta,
                status: "errored",
                error: "Mux upload not found",
              },
            })
            .where(eq(medias.id, media.id));
          muxUpdatedCount += 1;
          continue;
        }
      }

      if (!assetId) continue;

      try {
        const asset = await mux.video.assets.retrieve(assetId);
        const assetPlaybackId = asset.playback_ids?.[0]?.id;
        if (assetPlaybackId) playbackId = assetPlaybackId;
        await db
          .update(medias)
          .set({
            fileKey: assetId,
            url: playbackId
              ? `https://stream.mux.com/${playbackId}.m3u8`
              : media.url,
            metadata: {
              ...meta,
              assetId,
              uploadId: uploadId ?? meta.uploadId,
              playbackId,
              status: asset.status,
              duration: asset.duration ?? meta.duration,
              aspectRatio: asset.aspect_ratio ?? meta.aspectRatio,
            },
          })
          .where(eq(medias.id, media.id));
        muxUpdatedCount += 1;
      } catch (error) {
        console.error(`Failed to sync Mux media ${media.id}:`, error);
      }
    }

    await createAuditLog(
      "MEDIA_SYNC",
      undefined,
      `Synchronized filesystem. Added ${addedCount} files. Synced ${muxUpdatedCount} Mux items.`,
    );

    revalidatePath("/admin");
    const muxSuffix =
      muxUpdatedCount > 0
        ? ` Status ${muxUpdatedCount} video Mux diperbarui.`
        : "";
    return {
      success: true,
      message: `Sinkronisasi selesai. ${addedCount} file baru ditambahkan.${muxSuffix}`,
      addedCount,
      muxUpdatedCount,
    };
  } catch (error: unknown) {
    console.error("Sync error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal sinkronisasi: " + message };
  }
}
