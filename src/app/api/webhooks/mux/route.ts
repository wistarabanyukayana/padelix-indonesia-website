import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { mux } from "@/lib/mux";
import { MediaMetadata } from "@/types";
import { createAuditLog } from "@/lib/audit";

/**
 * Mux Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("mux-signature");

    if (process.env.MUX_WEBHOOK_SECRET && !signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify signature if secret is provided
    if (process.env.MUX_WEBHOOK_SECRET && signature) {
        try {
            mux.webhooks.verifySignature(body, { "mux-signature": signature }, process.env.MUX_WEBHOOK_SECRET);
        } catch {
            console.error("[Mux Webhook] Signature verification failed");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    }

    const payload = JSON.parse(body);
    const { type, data } = payload;

    console.log(`[Mux Webhook] Received event: ${type}`);

    // Helper to ensure we have a clean object and prevent double-stringification
    const ensureObject = (val: unknown): MediaMetadata => {
        if (!val) return {};
        if (typeof val === 'string') {
            try { return JSON.parse(val) as MediaMetadata; } catch { return {}; }
        }
        // Handle "spread-string" corruption (object with keys "0", "1"...)
        if (typeof val === 'object' && val !== null && '0' in val && '1' in val) {
            console.warn("[Mux Webhook] Detected corrupted indexed-string metadata, attempting recovery");
            try {
                // Only join values where keys are numeric
                const parts: string[] = [];
                const obj = val as Record<string, string>;
                Object.keys(obj).forEach(k => {
                    if (!isNaN(Number(k))) parts[parts.length] = obj[k];
                });
                const recovered = parts.join('');
                const parsed = JSON.parse(recovered) as MediaMetadata;
                
                // Merge with any existing valid non-numeric keys (like status, duration)
                const final = { ...parsed };
                Object.keys(obj).forEach(k => {
                    if (isNaN(Number(k))) final[k] = obj[k];
                });
                return final;
            } catch { return val as MediaMetadata; }
        }
        return val as MediaMetadata;
    };

    // Unified ID lookup logic
    const assetId = data.asset_id || data.id;
    const uploadId = data.upload_id || (type.startsWith('video.upload') ? data.id : null);

    // Try finding by Asset ID first, then fallback to Upload ID
    let mediaRecord = null;
    if (assetId) {
        const res = await db.select().from(medias).where(eq(medias.fileKey, assetId)).limit(1);
        mediaRecord = res[0];
    }
    
    if (!mediaRecord && uploadId) {
        const res = await db.select().from(medias).where(eq(medias.fileKey, uploadId)).limit(1);
        mediaRecord = res[0];
    }

    if (!mediaRecord) {
        // If it's a delete event and we don't have it, just ignore
        if (type === "video.asset.deleted") return NextResponse.json({ received: true });
        
        console.warn(`[Mux Webhook] No media found for Asset:${assetId} / Upload:${uploadId}`);
        return NextResponse.json({ received: true });
    }

    console.log(`[Mux Webhook] Processing event: ${type} for media ID: ${mediaRecord.id}`);
    await createAuditLog(`WEBHOOK_MUX_${type.replace(/\./g, '_').toUpperCase()}`, mediaRecord.id, `Processing Mux event: ${type}`);

    const currentMeta = ensureObject(mediaRecord.metadata);

    // 1. Handle Linking Upload to Asset
    if (type === "video.upload.asset_created" || type === "video.asset.created") {
        const playbackId = data.playback_ids?.[0]?.id || currentMeta.playbackId;
        
        await db.update(medias).set({
            fileKey: assetId, // Promote to permanent asset ID
            url: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : mediaRecord.url,
            metadata: {
                ...currentMeta,
                assetId: assetId,
                uploadId: uploadId || currentMeta.uploadId,
                playbackId: playbackId,
                status: data.status || currentMeta.status,
            }
        }).where(eq(medias.id, mediaRecord.id));
        
        console.log(`[Mux Webhook] Linked media ${mediaRecord.id} to asset ${assetId}`);
    }

    // 2. Handle Status Updates
    if (type === "video.asset.ready" || type === "video.asset.errored") {
        const playbackId = data.playback_ids?.[0]?.id || currentMeta.playbackId;

        await db.update(medias).set({
            fileKey: assetId,
            url: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : mediaRecord.url,
            metadata: {
                ...currentMeta,
                status: data.status,
                duration: data.duration ?? currentMeta.duration,
                aspectRatio: data.aspect_ratio ?? currentMeta.aspectRatio,
                playbackId: playbackId,
                error: data.errors ? JSON.stringify(data.errors) : undefined
            }
        }).where(eq(medias.id, mediaRecord.id));

        console.log(`[Mux Webhook] Media ${mediaRecord.id} is now ${data.status}`);
    }

    // 3. Handle Deletion
    if (type === "video.asset.deleted") {
        await db.delete(medias).where(eq(medias.id, mediaRecord.id));
        console.log(`[Mux Webhook] Deleted media ${mediaRecord.id} due to Mux deletion`);
    }

    // Force revalidation of all admin paths
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/media");
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mux Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
