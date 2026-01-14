"use server";

import { mux } from "@/lib/mux";
import { db } from "@/lib/db";
import { medias } from "@/db/schema";
import { getSession, checkPermission } from "@/lib/auth";
import { MediaMetadata } from "@/types";
import { eq, sql } from "drizzle-orm";
import { PERMISSIONS } from "@/config/permissions";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

export async function createMuxUpload(filename: string, folder?: string | null, fileSize?: number) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
      },
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
    });

    // Create a "pending" record in medias table immediately
    await db.insert(medias).values({
      name: filename,
      fileKey: upload.id, // Temporary key until asset is created
      type: "video",
      provider: "mux",
      mimeType: "video/mux",
      fileSize: typeof fileSize === "number" ? fileSize : 0,
      url: "", // Will be updated when asset is created
      metadata: {
        uploadId: upload.id,
        status: "uploading",
        folder: folder || null,
      },
    }).$returningId();

    await createAuditLog("MEDIA_UPLOAD_INIT", undefined, `Initiated Mux upload: ${filename}`);

    return {
      id: upload.id,
      url: upload.url,
    };
  } catch (error) {
    console.error("Mux upload creation error:", error);
    throw new Error("Failed to create Mux upload");
  }
}

export async function getMuxMediaByUploadId(uploadId: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await checkPermission(PERMISSIONS.MANAGE_MEDIA);
        const result = await db.select().from(medias).where(eq(medias.fileKey, uploadId)).limit(1);
        if (!result.length) {
            // Check if it's already transitioned to assetId
            const resultByMeta = await db.select().from(medias).where(sql`JSON_EXTRACT(${medias.metadata}, '$.uploadId') = ${uploadId}`).limit(1);
            return resultByMeta[0] || null;
        }
        return result[0];
    } catch (error) {
        console.error("Get Mux media error:", error);
        return null;
    }
}

export async function syncMuxAssetStatus(mediaId: number) {
  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const media = await db.select().from(medias).where(eq(medias.id, mediaId)).limit(1);
    if (!media.length || media[0].provider !== "mux") return;

    let meta: MediaMetadata = {};
    try {
        meta = typeof media[0].metadata === 'string' ? JSON.parse(media[0].metadata) : (media[0].metadata as MediaMetadata || {});
    } catch (e) {
        console.error("Failed to parse metadata for sync", e);
    }

    if (!meta?.assetId) return;

    const asset = await mux.video.assets.retrieve(meta.assetId);
    
    await db.update(medias).set({
        metadata: {
            ...meta,
            status: asset.status,
            duration: asset.duration,
            aspectRatio: asset.aspect_ratio,
        }
    }).where(eq(medias.id, mediaId));

    await createAuditLog("MEDIA_SYNC_MUX", mediaId, `Synced Mux status for media ID: ${mediaId}. New status: ${asset.status}`);

    revalidatePath("/admin", "layout");
    return asset.status;
  } catch (error) {
    console.error("Mux sync error:", error);
  }
}
