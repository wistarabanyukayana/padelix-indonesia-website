"use server";

import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/config/media";
import { PERMISSIONS } from "@/config/permissions";
import { medias } from "@/db/schema";
import { createAuditLog } from "@/lib/audit";
import { checkPermission, getSession } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { parseMetadata } from "@/lib/utils";
import { ActionState, UploadResult } from "@/types";
import { desc, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// All admin uploads live under this Cloudinary folder, mirroring the old
// public/uploads directory. The DB metadata->>'folder' keeps the relative
// folder path (without this prefix) — that is what the media library filters
// on. Folders themselves are Cloudinary folders, not DB records.
const ROOT_FOLDER = "uploads";

// Vercel functions cap request bodies at ~4.5MB, so files go directly from
// the browser to Cloudinary with a signature from signMediaUpload().

const toRelativeFolder = (publicId: string): string | null => {
  const segments = publicId.split("/");
  segments.pop(); // drop the filename
  if (segments[0] === ROOT_FOLDER) segments.shift();
  return segments.length ? segments.join("/") : null;
};

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

export async function getPhysicalFolders(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const folders: string[] = [];

    const scan = async (path: string, relativeBase: string) => {
      const result = (await cloudinary.api.sub_folders(path)) as {
        folders?: { name: string; path: string }[];
      };
      for (const folder of result.folders ?? []) {
        const relativePath = relativeBase
          ? `${relativeBase}/${folder.name}`
          : folder.name;
        folders.push(relativePath);
        await scan(folder.path, relativePath);
      }
    };

    await scan(ROOT_FOLDER, "");
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

    // Validate path (basic security to prevent path tricks)
    if (folderPath.includes("..") || folderPath.startsWith("/")) {
      return { message: "Nama folder tidak valid" };
    }

    await cloudinary.api.create_folder(`${ROOT_FOLDER}/${folderPath}`);
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

    // Refuse if any media row still lives in this folder (or a subfolder)
    const occupied = await db
      .select({ id: medias.id })
      .from(medias)
      .where(
        or(
          sql`${medias.metadata}->>'folder' = ${folderPath}`,
          sql`${medias.metadata}->>'folder' LIKE ${folderPath + "/%"}`,
        ),
      )
      .limit(1);
    if (occupied.length > 0) {
      return {
        message:
          "Folder tidak kosong. Harap hapus atau pindahkan isinya terlebih dahulu.",
      };
    }

    await cloudinary.api.delete_folder(`${ROOT_FOLDER}/${folderPath}`);
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

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/**
 * Issues signed parameters for a direct browser → Cloudinary upload.
 * The signature only authorizes uploading into the requested folder at the
 * issued timestamp (valid for 1 hour, enforced by Cloudinary).
 */
export async function signMediaUpload(
  folder?: string | null,
): Promise<SignedUploadParams | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const targetFolder = folder ? `${ROOT_FOLDER}/${folder}` : ROOT_FOLDER;
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder: targetFolder, timestamp },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      timestamp,
      signature,
      folder: targetFolder,
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
 * canonical resource, not from client-supplied values.
 */
export async function registerUploadedMedia(
  publicId: string,
  originalFilename: string,
  resourceType: "image" | "video" | "raw",
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

    let type: "image" | "video" | "document" | "audio" | "other" = "other";
    if (resource.resource_type === "image") type = "image";
    else if (resource.resource_type === "video") type = "video";
    else if (resource.format === "pdf") type = "document";

    const maxBytes = type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (resource.bytes > maxBytes) {
      // Enforce the size cap server-side: drop the oversized asset again.
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      const maxLabel = type === "video" ? "100MB" : "20MB";
      return {
        error: `Ukuran file melebihi batas ${maxLabel}, upload dibatalkan`,
      };
    }

    const name =
      originalFilename ||
      resource.public_id.split("/").pop() ||
      resource.public_id;

    const [result] = await db
      .insert(medias)
      .values({
        name,
        fileKey: resource.public_id,
        type,
        provider: "cloudinary",
        mimeType: toMimeType(type, resource.format),
        fileSize: resource.bytes,
        url: resource.secure_url,
        metadata: {
          folder: toRelativeFolder(resource.public_id),
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

    revalidatePath("/admin");
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
      const resourceType =
        media.type === "video" || media.type === "audio"
          ? "video"
          : media.type === "image"
            ? "image"
            : "raw";
      try {
        await cloudinary.uploader.destroy(media.fileKey, {
          resource_type: resourceType,
        });
      } catch (err) {
        console.error("Failed to delete Cloudinary asset:", err);
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

    // Cloudinary asset stays where it is — the URL keeps serving. Only the
    // library's logical folder (DB metadata) changes.
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

/**
 * Reconciles the medias table with what actually exists in Cloudinary under
 * the uploads folder — the replacement for the old filesystem sync.
 */
export async function syncCloudinaryMedias(): Promise<
  ActionState & { addedCount?: number }
> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const existing = await db
      .select({ fileKey: medias.fileKey })
      .from(medias);
    const existingKeys = new Set(existing.map((m) => m.fileKey));

    let addedCount = 0;

    type CloudinaryResource = {
      public_id: string;
      secure_url: string;
      resource_type: string;
      format?: string;
      bytes: number;
      width?: number;
      height?: number;
      duration?: number;
    };

    for (const resourceType of ["image", "video", "raw"] as const) {
      let nextCursor: string | undefined;
      do {
        const page = (await cloudinary.api.resources({
          type: "upload",
          resource_type: resourceType,
          prefix: `${ROOT_FOLDER}/`,
          max_results: 500,
          next_cursor: nextCursor,
        })) as { resources: CloudinaryResource[]; next_cursor?: string };

        for (const resource of page.resources) {
          if (existingKeys.has(resource.public_id)) continue;

          let type: "image" | "video" | "document" | "audio" | "other" =
            "other";
          if (resource.resource_type === "image") type = "image";
          else if (resource.resource_type === "video") type = "video";
          else if (resource.format === "pdf") type = "document";

          await db.insert(medias).values({
            name: resource.public_id.split("/").pop() || resource.public_id,
            fileKey: resource.public_id,
            type,
            provider: "cloudinary",
            mimeType: toMimeType(type, resource.format),
            fileSize: resource.bytes,
            url: resource.secure_url,
            metadata: {
              folder: toRelativeFolder(resource.public_id),
              width: resource.width,
              height: resource.height,
              duration: resource.duration,
            },
          });
          existingKeys.add(resource.public_id);
          addedCount++;
        }

        nextCursor = page.next_cursor;
      } while (nextCursor);
    }

    await createAuditLog(
      "MEDIA_SYNC",
      undefined,
      `Synchronized Cloudinary. Added ${addedCount} files.`,
    );

    revalidatePath("/admin");
    return {
      success: true,
      message: `Sinkronisasi selesai. ${addedCount} file baru ditambahkan.`,
      addedCount,
    };
  } catch (error: unknown) {
    console.error("Sync error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal sinkronisasi: " + message };
  }
}
