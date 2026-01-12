"use server";

import { db } from "@/lib/db";
import { medias } from "@/db/schema";
import { writeFile, mkdir, unlink, readdir, stat } from "fs/promises";
import { join } from "path";
import { ActionState, UploadResult, MediaMetadata } from "@/types";
import { getSession, checkPermission } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { mux } from "@/lib/mux";
import { PERMISSIONS } from "@/config/permissions";
import { revalidatePath } from "next/cache";
import { parseMetadata } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";

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
          const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
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

export async function createPhysicalFolder(folderPath: string): Promise<ActionState> {
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
    await createAuditLog("MEDIA_FOLDER_CREATE", undefined, `Created folder: ${folderPath}`);

    revalidatePath("/admin", "layout");
    return { success: true, message: "Folder berhasil dibuat" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal membuat folder: " + message };
  }
}

export async function deletePhysicalFolder(folderPath: string): Promise<ActionState> {
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
        return { message: "Folder tidak kosong. Harap hapus atau pindahkan isinya terlebih dahulu." };
    }

    // Delete folder (using rmdir since it must be empty)
    const { rmdir } = await import("fs/promises");
    await rmdir(fullPath);
    await createAuditLog("MEDIA_FOLDER_DELETE", undefined, `Deleted folder: ${folderPath}`);

    revalidatePath("/admin", "layout");
    return { success: true, message: "Folder berhasil dihapus" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
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
    else if (file.type === "application/pdf" || file.type.includes("msword") || file.type.includes("officedocument")) type = "document";

    if (file.size > 50 * 1024 * 1024) { // Increased to 50MB
        return { error: "Ukuran file maksimal 50MB" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${safeName}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    // Create record in medias table
    const [result] = await db.insert(medias).values({
      name: file.name,
      fileKey: filename,
      type: type,
      provider: "local",
      mimeType: file.type,
      fileSize: file.size,
      url: fileUrl,
      metadata: folder ? { folder } : null,
    }).$returningId();

    await createAuditLog("MEDIA_UPLOAD", result.id, `Uploaded file: ${file.name} (local)`);

    revalidatePath("/admin", "layout");
    return { url: fileUrl, id: result.id };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
    return { error: "Gagal mengunggah file: " + message };
  }
}

export async function deleteMedia(id: number): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const mediaResult = await db.select().from(medias).where(eq(medias.id, id)).limit(1);
    const media = mediaResult[0];

    if (!media) return { message: "Media tidak ditemukan" };

    if (media.provider === "local") {
      const filepath = join(process.cwd(), "public", media.url.startsWith('/') ? media.url.substring(1) : media.url);
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
    revalidatePath("/admin", "layout");
    return { success: true, message: "Media berhasil dihapus" };
  } catch (error: unknown) {
    console.error("Delete media error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
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

export async function updateMediaFolder(id: number, folder: string | null): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const mediaResult = await db.select().from(medias).where(eq(medias.id, id)).limit(1);
    const media = mediaResult[0];

    if (!media) return { message: "Media tidak ditemukan" };

    const currentMeta = parseMetadata(media.metadata);
    
    await db.update(medias).set({
        metadata: {
            ...currentMeta,
            folder: folder || null
        }
    }).where(eq(medias.id, id));

    await createAuditLog("MEDIA_MOVE", id, `Moved media ${media.name} to folder: ${folder || 'Root'}`);

    revalidatePath("/admin", "layout");
    return { success: true, message: "Media berhasil dipindahkan" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal memindahkan media: " + message };
  }
}

export async function syncFileSystemMedias(): Promise<ActionState & { addedCount?: number }> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    
    const publicDir = join(process.cwd(), "public");
    const foldersToSync = ["uploads"];
    let addedCount = 0;

    // Fetch all existing media URLs once
    const existingMedias = await db.select({ url: medias.url }).from(medias);
    const existingUrls = new Set(existingMedias.map(m => m.url));

    const scanDir = async (relativeDir: string) => {
      const fullPath = join(publicDir, relativeDir);
      const entries = await readdir(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryRelativePath = join(relativeDir, entry.name);
        const url = `/${entryRelativePath.replace(/\\/g, '/')}`;
        
        if (entry.isDirectory()) {
          await scanDir(entryRelativePath);
        } else {
          // Check against set instead of DB query
          if (!existingUrls.has(url)) {
            const fileStat = await stat(join(publicDir, entryRelativePath));
            
            const ext = entry.name.split('.').pop()?.toLowerCase();
            let type: "image" | "video" | "document" | "audio" | "other" = "other";
            if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) type = "image";
            else if (["mp4", "webm", "ogg"].includes(ext || "")) type = "video";
            else if (["pdf", "doc", "docx"].includes(ext || "")) type = "document";
            else if (["mp3", "wav"].includes(ext || "")) type = "audio";

            let folder: string | null = null;
            const normalizedPath = relativeDir.replace(/\\/g, '/');
            if (normalizedPath.startsWith("uploads/")) folder = normalizedPath.replace("uploads/", "");
            else if (normalizedPath === "uploads") folder = null;
            else folder = normalizedPath;

            if (folder === "") folder = null;

            await db.insert(medias).values({
              name: entry.name,
              fileKey: url,
              type: type,
              provider: "local",
              mimeType: `${type}/${ext}`,
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

    await createAuditLog("MEDIA_SYNC", undefined, `Synchronized filesystem. Added ${addedCount} files.`);

    revalidatePath("/admin", "layout");
    return { success: true, message: `Sinkronisasi selesai. ${addedCount} file baru ditambahkan.`, addedCount };
  } catch (error: unknown) {
    console.error("Sync error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal sinkronisasi: " + message };
  }
}