import "dotenv/config";
import { eq } from "drizzle-orm";
import { mediaFolders, medias } from "../src/db/schema";
import { db } from "../src/lib/db";

// One-time migration of the legacy metadata.folder path strings into the new
// first-class media_folders table, setting medias.folder_id. Idempotent: it
// skips media that already have a folder_id (new uploads) and reuses existing
// folder rows. Run AFTER applying the media_folders migration:
//   pnpm db:backfill-folders

type MetaShape = { folder?: string | null } | null;

function isValidFolderSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment.length <= 255 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("..")
  );
}

function normalizeLegacyFolderPath(folderPath: string): string | null {
  const segments = folderPath
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments[0] === "uploads") segments.shift();
  if (segments.length === 0) return null;
  if (segments.some((segment) => !isValidFolderSegment(segment))) return null;

  return segments.join("/");
}

// Ensure every folder along `path` exists (creating parents as needed) and
// return the leaf folder's id. Paths are cached to avoid repeat lookups.
async function ensureFolder(
  path: string,
  cache: Map<string, number>,
): Promise<number> {
  const segments = path.split("/").filter(Boolean);
  let parentId: number | null = null;
  let currentPath = "";

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;

    const cached = cache.get(currentPath);
    if (cached != null) {
      parentId = cached;
      continue;
    }

    const [existing] = await db
      .select({ id: mediaFolders.id })
      .from(mediaFolders)
      .where(eq(mediaFolders.path, currentPath))
      .limit(1);

    let id: number;
    if (existing) {
      id = existing.id;
    } else {
      const [created] = await db
        .insert(mediaFolders)
        .values({ name: segment, parentId, path: currentPath })
        .returning({ id: mediaFolders.id });
      id = created.id;
      console.log(`  + folder ${currentPath}`);
    }

    cache.set(currentPath, id);
    parentId = id;
  }

  return parentId!;
}

async function backfill() {
  console.log("📁 Backfilling media folders...");
  const rows = await db.select().from(medias);
  const cache = new Map<string, number>();
  let linked = 0;
  let skipped = 0;

  for (const m of rows) {
    if (m.folderId != null) continue; // already assigned (e.g. new uploads)
    const meta = m.metadata as MetaShape;
    const folderPath = meta?.folder
      ? normalizeLegacyFolderPath(meta.folder)
      : null;
    if (!folderPath) continue;

    try {
      const folderId = await ensureFolder(folderPath, cache);
      await db.update(medias).set({ folderId }).where(eq(medias.id, m.id));
      linked++;
    } catch (error) {
      skipped++;
      console.warn(`  ! skipped media #${m.id} (${folderPath})`, error);
    }
  }

  console.log(
    `✅ Done. Linked ${linked} media into ${cache.size} folders. Skipped ${skipped}.`,
  );
  process.exit(0);
}

backfill().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
