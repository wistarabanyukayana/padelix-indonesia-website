"use server";

import { PERMISSIONS } from "@/config/permissions";
import { medias } from "@/db/schema";
import { checkPermission, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mux } from "@/lib/mux";
import { ActionState, MediaMetadata } from "@/types";
import { eq, sql } from "drizzle-orm";

import { createAuditLog } from "@/lib/audit";
import { parseMetadata } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type MuxUploadResponse =
  | {
      id: string;
      url: string;
    }
  | {
      error: string;
    };

export async function createMuxUpload(
  filename: string,
  folder?: string | null,
  fileSize?: number,
): Promise<MuxUploadResponse> {
  const session = await getSession();
  if (!session) {
    return { error: "Sesi berakhir, silakan login kembali" };
  }

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
      },
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
    });

    // Create a "pending" record in medias table immediately
    await db
      .insert(medias)
      .values({
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
      })
      .$returningId();

    await createAuditLog(
      "MEDIA_UPLOAD_INIT",
      undefined,
      `Initiated Mux upload: ${filename}`,
    );

    return {
      id: upload.id,
      url: upload.url,
    };
  } catch (error) {
    console.error("Mux upload creation error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat upload Mux";
    return { error: message };
  }
}

export async function getMuxMediaByUploadId(uploadId: string) {
  const session = await getSession();
  if (!session) return null;

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);
    const result = await db
      .select()
      .from(medias)
      .where(eq(medias.fileKey, uploadId))
      .limit(1);
    if (!result.length) {
      // Check if it's already transitioned to assetId
      const resultByMeta = await db
        .select()
        .from(medias)
        .where(
          sql`JSON_EXTRACT(${medias.metadata}, '$.uploadId') = ${uploadId}`,
        )
        .limit(1);
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
    const media = await db
      .select()
      .from(medias)
      .where(eq(medias.id, mediaId))
      .limit(1);
    if (!media.length || media[0].provider !== "mux") return;

    let meta: MediaMetadata = {};
    try {
      meta =
        typeof media[0].metadata === "string"
          ? JSON.parse(media[0].metadata)
          : (media[0].metadata as MediaMetadata) || {};
    } catch (e) {
      console.error("Failed to parse metadata for sync", e);
    }

    if (!meta?.assetId) return;

    const asset = await mux.video.assets.retrieve(meta.assetId);

    await db
      .update(medias)
      .set({
        metadata: {
          ...meta,
          status: asset.status,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
        },
      })
      .where(eq(medias.id, mediaId));

    await createAuditLog(
      "MEDIA_SYNC_MUX",
      mediaId,
      `Synced Mux status for media ID: ${mediaId}. New status: ${asset.status}`,
    );

    revalidatePath("/admin");
    return asset.status;
  } catch (error) {
    console.error("Mux sync error:", error);
  }
}

export async function scanMuxAssets(): Promise<
  ActionState & {
    insertedCount?: number;
    updatedCount?: number;
    skippedCount?: number;
    totalCount?: number;
  }
> {
  const session = await getSession();
  if (!session) return { message: "Sesi berakhir, silakan login kembali" };

  try {
    await checkPermission(PERMISSIONS.MANAGE_MEDIA);

    const existingMux = await db
      .select({
        id: medias.id,
        name: medias.name,
        fileKey: medias.fileKey,
        url: medias.url,
        metadata: medias.metadata,
      })
      .from(medias)
      .where(eq(medias.provider, "mux"));

    const byAssetId = new Map<string, (typeof existingMux)[number]>();
    const byUploadId = new Map<string, (typeof existingMux)[number]>();

    existingMux.forEach((media) => {
      const meta = parseMetadata(media.metadata);
      if (typeof meta.assetId === "string" && meta.assetId) {
        byAssetId.set(meta.assetId, media);
      }
      if (typeof media.fileKey === "string" && media.fileKey) {
        byAssetId.set(media.fileKey, media);
      }
      const uploadId =
        typeof meta.uploadId === "string" ? meta.uploadId : undefined;
      if (uploadId) {
        byUploadId.set(uploadId, media);
      }
    });

    let insertedCount = 0;
    let updatedCount = 0;
    let totalCount = 0;

    const assets = mux.video.assets.list({ limit: 100 });
    for await (const asset of assets) {
      totalCount += 1;
      const assetId = asset.id;
      const uploadId = asset.upload_id ?? undefined;
      const playbackId = asset.playback_ids?.[0]?.id ?? undefined;

      const displayName =
        (typeof asset.passthrough === "string" && asset.passthrough.trim()) ||
        asset.meta?.title ||
        asset.id;

      const baseMeta: MediaMetadata = {
        assetId,
        playbackId,
        status: asset.status,
        duration: asset.duration,
        aspectRatio: asset.aspect_ratio,
        uploadId,
      };

      const url = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : "";

      const existing =
        byAssetId.get(assetId) || (uploadId && byUploadId.get(uploadId));

      if (!existing) {
        await db.insert(medias).values({
          name: displayName,
          fileKey: assetId,
          type: "video",
          provider: "mux",
          mimeType: "video/mux",
          fileSize: 0,
          url,
          metadata: baseMeta,
        });
        insertedCount += 1;
        continue;
      }

      const currentMeta = parseMetadata(existing.metadata);
      const nextMeta: MediaMetadata = {
        ...currentMeta,
        ...baseMeta,
      };

      const metaChanged =
        JSON.stringify(currentMeta) !== JSON.stringify(nextMeta);
      const fileKeyChanged = existing.fileKey !== assetId;
      const urlChanged = playbackId ? existing.url !== url : false;
      const nameChanged =
        displayName && existing.name !== displayName && existing.name !== "";

      if (metaChanged || fileKeyChanged || urlChanged || nameChanged) {
        await db
          .update(medias)
          .set({
            name: nameChanged ? displayName : existing.name,
            fileKey: assetId,
            url: urlChanged ? url : existing.url,
            metadata: nextMeta,
          })
          .where(eq(medias.id, existing.id));
        updatedCount += 1;
      }
    }

    const skippedCount = totalCount - insertedCount - updatedCount;

    await createAuditLog(
      "MEDIA_SYNC_MUX_SCAN",
      undefined,
      `Mux scan: ${insertedCount} added, ${updatedCount} updated, ${skippedCount} skipped.`,
    );

    revalidatePath("/admin");
    return {
      success: true,
      message: `Mux sync selesai. ${insertedCount} asset baru ditambahkan, ${updatedCount} diperbarui.`,
      insertedCount,
      updatedCount,
      skippedCount,
      totalCount,
    };
  } catch (error: unknown) {
    console.error("Mux scan error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return { message: "Gagal sync Mux: " + message };
  }
}
