"use server";

import { MEDIA_CAPS, kindFromMediaType } from "@/config/media";
import { PERMISSIONS } from "@/config/permissions";
import { mediaFolders, medias } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { checkPermission, getSession } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { ActionState, DBMediaFolder, UploadResult } from "@/types";
import { asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Cloudinary stays a pure blob store: every upload lands in this one Cloudinary
// folder for tidiness. The library's folder STRUCTURE lives in the media_folders
// table (the single source of truth) — not in Cloudinary's asset-folders.
const ROOT_FOLDER = "uploads";

// Vercel functions cap request bodies at ~4.5MB, so files go directly from
// the browser to Cloudinary with a signature from signMediaUpload().

const toMimeType = (
  type: "image" | "video" | "document" | "audio" | "other",
  format: string | undefined,
): string => {
  if (!format) return "application/octet-stream";
  const normalized = format.toLowerCase();
  if (type === "image")
    return `image/${normalized === "jpg" ? "jpeg" : normalized}`;
  if (type === "video") return `video/${normalized}`;
  if (type === "audio") return `audio/${normalized}`;
  if (normalized === "pdf") return "application/pdf";
  return "application/octet-stream";
};

const AUDIO_FORMATS = new Set([
  "mp3",
  "m4a",
  "aac",
  "ogg",
  "oga",
  "wav",
  "flac",
  "wma",
  "opus",
]);

// Classify a Cloudinary resource into our media_type enum. Audio is checked
// first because Cloudinary serves audio through its video pipeline
// (resource_type === "video"), so it must be distinguished by format.
function classifyMediaType(
  resourceType: string,
  format: string | undefined,
): "image" | "video" | "document" | "audio" | "other" {
  const fmt = (format ?? "").toLowerCase();
  if (AUDIO_FORMATS.has(fmt)) return "audio";
  if (resourceType === "image") return "image";
  if (resourceType === "video") return "video";
  if (fmt === "pdf") return "document";
  return "other";
}

const cloudinaryResourceType = (
  type: "image" | "video" | "document" | "audio" | "other",
): "image" | "video" | "raw" =>
  type === "video" || type === "audio"
    ? "video"
    : type === "image"
      ? "image"
      : "raw";

// ==========================================
// Folders (first-class records in media_folders)
// ==========================================

function isValidFolderName(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= 255 &&
    !name.includes("/") &&
    !name.includes("..")
  );
}

export async function getFolders(): Promise<DBMediaFolder[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    return await db.select().from(mediaFolders).orderBy(asc(mediaFolders.path));
  } catch (error) {
    console.error("Get folders error:", error);
    return [];
  }
}

export async function createFolder(
  name: string,
  parentId: number | null,
): Promise<ActionState & { id?: number }> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const cleanName = name.trim();
    if (!isValidFolderName(cleanName)) {
      return { message: "Nama folder tidak valid" };
    }

    let path = cleanName;
    if (parentId != null) {
      const [parent] = await db
        .select()
        .from(mediaFolders)
        .where(eq(mediaFolders.id, parentId))
        .limit(1);
      if (!parent) return { message: "Folder induk tidak ditemukan" };
      path = `${parent.path}/${cleanName}`;
    }

    const [existing] = await db
      .select({ id: mediaFolders.id })
      .from(mediaFolders)
      .where(eq(mediaFolders.path, path))
      .limit(1);
    if (existing)
      return { message: "Folder dengan nama itu sudah ada di sini" };

    const [created] = await db
      .insert(mediaFolders)
      .values({ name: cleanName, parentId, path })
      .returning({ id: mediaFolders.id });

    await createAuditLog(
      "MEDIA_FOLDER_CREATE",
      created.id,
      `Created folder: ${path}`,
    );
    revalidatePath("/admin");
    return { success: true, message: "Folder berhasil dibuat", id: created.id };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal membuat folder: " + message };
  }
}

export async function renameFolder(
  id: number,
  name: string,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const cleanName = name.trim();
    if (!isValidFolderName(cleanName)) {
      return { message: "Nama folder tidak valid" };
    }

    const [folder] = await db
      .select()
      .from(mediaFolders)
      .where(eq(mediaFolders.id, id))
      .limit(1);
    if (!folder) return { message: "Folder tidak ditemukan" };

    const oldPath = folder.path;
    const parentPath =
      folder.parentId != null ? oldPath.slice(0, oldPath.lastIndexOf("/")) : "";
    const newPath = parentPath ? `${parentPath}/${cleanName}` : cleanName;

    if (newPath === oldPath) {
      return { success: true, message: "Tidak ada perubahan" };
    }

    const [dupe] = await db
      .select({ id: mediaFolders.id })
      .from(mediaFolders)
      .where(eq(mediaFolders.path, newPath))
      .limit(1);
    if (dupe) return { message: "Folder dengan nama itu sudah ada di sini" };

    // Rename the folder itself.
    await db
      .update(mediaFolders)
      .set({ name: cleanName, path: newPath, updatedAt: new Date() })
      .where(eq(mediaFolders.id, id));

    // Re-path every descendant: swap the old path prefix for the new one.
    await db
      .update(mediaFolders)
      .set({
        path: sql`${newPath} || substring(${mediaFolders.path} from ${oldPath.length + 1})`,
        updatedAt: new Date(),
      })
      .where(sql`${mediaFolders.path} LIKE ${oldPath + "/%"}`);

    await createAuditLog(
      "MEDIA_FOLDER_RENAME",
      id,
      `Renamed folder: ${oldPath} → ${newPath}`,
    );
    revalidatePath("/admin");
    return { success: true, message: "Folder berhasil diganti namanya" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal mengganti nama folder: " + message };
  }
}

export async function deleteFolder(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const [folder] = await db
      .select()
      .from(mediaFolders)
      .where(eq(mediaFolders.id, id))
      .limit(1);
    if (!folder) return { message: "Folder tidak ditemukan" };

    // Block when non-empty: refuse if it has subfolders or media.
    const [child] = await db
      .select({ id: mediaFolders.id })
      .from(mediaFolders)
      .where(eq(mediaFolders.parentId, id))
      .limit(1);
    if (child) {
      return {
        message:
          "Folder tidak kosong (berisi subfolder). Hapus atau pindahkan isinya dulu.",
      };
    }

    const [media] = await db
      .select({ id: medias.id })
      .from(medias)
      .where(eq(medias.folderId, id))
      .limit(1);
    if (media) {
      return {
        message:
          "Folder tidak kosong (berisi media). Hapus atau pindahkan isinya dulu.",
      };
    }

    await db.delete(mediaFolders).where(eq(mediaFolders.id, id));
    await createAuditLog(
      "MEDIA_FOLDER_DELETE",
      id,
      `Deleted folder: ${folder.path}`,
    );
    revalidatePath("/admin");
    return { success: true, message: "Folder berhasil dihapus" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal menghapus folder: " + message };
  }
}

// ==========================================
// Uploads
// ==========================================

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/**
 * Issues signed parameters for a direct browser → Cloudinary upload. Everything
 * lands in the single ROOT_FOLDER on Cloudinary; the library's folder is tracked
 * separately in the DB via registerUploadedMedia(folderId).
 */
export async function signMediaUpload(): Promise<
  SignedUploadParams | { error: string }
> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder: ROOT_FOLDER, timestamp },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      timestamp,
      signature,
      folder: ROOT_FOLDER,
    };
  } catch (error: unknown) {
    console.error("Sign upload error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal menyiapkan upload";
    return { error: message };
  }
}

/**
 * Records a finished direct upload in the medias table. The public_id is
 * verified against Cloudinary's Admin API — the DB row is built from the
 * canonical resource, not from client-supplied values. The library folder is
 * the DB folderId passed in (validated), not anything parsed from Cloudinary.
 */
export async function registerUploadedMedia(
  publicId: string,
  originalFilename: string,
  resourceType: "image" | "video" | "raw",
  folderId: number | null,
): Promise<UploadResult> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const resource = (await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    })) as {
      public_id: string;
      secure_url: string;
      resource_type: string;
      format?: string;
      bytes: number;
      width?: number;
      height?: number;
      duration?: number;
    };

    const type = classifyMediaType(resource.resource_type, resource.format);

    const cap = MEDIA_CAPS[kindFromMediaType(type)];
    if (resource.bytes > cap.maxBytes) {
      // Enforce the size cap server-side: drop the oversized asset again.
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return {
        error: `Ukuran file melebihi batas ${cap.sizeLabel} untuk ${cap.noun}, upload dibatalkan`,
      };
    }

    // Only trust a folderId that actually exists; otherwise fall back to Root.
    let resolvedFolderId: number | null = null;
    if (folderId != null) {
      const [folder] = await db
        .select({ id: mediaFolders.id })
        .from(mediaFolders)
        .where(eq(mediaFolders.id, folderId))
        .limit(1);
      resolvedFolderId = folder ? folder.id : null;
    }

    const name =
      originalFilename ||
      resource.public_id.split("/").pop() ||
      resource.public_id;

    const [result] = await db
      .insert(medias)
      .values({
        folderId: resolvedFolderId,
        name,
        fileKey: resource.public_id,
        type,
        provider: "cloudinary",
        mimeType: toMimeType(type, resource.format),
        fileSize: resource.bytes,
        url: resource.secure_url,
        metadata: {
          width: resource.width,
          height: resource.height,
          duration: resource.duration,
        },
      })
      .returning({ id: medias.id });

    await createAuditLog(
      "MEDIA_UPLOAD",
      result.id,
      `Uploaded file: ${name} (cloudinary)`,
    );

    // ponytail: no revalidatePath here — this fires per-file mid-edit on the
    // product/portfolio forms and was wiping their unsaved local media state
    // via router refresh. Callers that need a fresh list (media library)
    // already call router.refresh() themselves.
    return { url: resource.secure_url, id: result.id };
  } catch (error: unknown) {
    console.error("Register upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan tidak dikenal";
    return { error: "Gagal menyimpan media: " + message };
  }
}

// ==========================================
// Media
// ==========================================

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

    if (media.provider === "cloudinary") {
      const resourceType = cloudinaryResourceType(media.type);
      // Verify the asset is actually gone before deleting the DB row — a silent
      // failure would orphan the Cloudinary asset and waste free-tier storage.
      try {
        const res = (await cloudinary.uploader.destroy(media.fileKey, {
          resource_type: resourceType,
        })) as { result?: string };
        if (res.result !== "ok" && res.result !== "not found") {
          return {
            message: `Gagal menghapus aset di Cloudinary (${res.result ?? "unknown"}). Coba lagi.`,
          };
        }
      } catch (err) {
        console.error("Failed to delete Cloudinary asset:", err);
        return {
          message: "Gagal menghapus aset di Cloudinary. Coba lagi nanti.",
        };
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
  folderId: number | null,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const [media] = await db
      .select()
      .from(medias)
      .where(eq(medias.id, id))
      .limit(1);
    if (!media) return { message: "Media tidak ditemukan" };

    if (folderId != null) {
      const [folder] = await db
        .select({ id: mediaFolders.id })
        .from(mediaFolders)
        .where(eq(mediaFolders.id, folderId))
        .limit(1);
      if (!folder) return { message: "Folder tujuan tidak ditemukan" };
    }

    // The Cloudinary asset stays put — only the library's logical folder moves.
    await db
      .update(medias)
      .set({ folderId, updatedAt: new Date() })
      .where(eq(medias.id, id));

    await createAuditLog("MEDIA_MOVE", id, `Moved media ${media.name}`);
    revalidatePath("/admin");
    return { success: true, message: "Media berhasil dipindahkan" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal memindahkan media: " + message };
  }
}
