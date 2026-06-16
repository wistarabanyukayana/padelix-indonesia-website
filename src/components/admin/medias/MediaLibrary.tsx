"use client";

import {
  createFolder,
  deleteFolder,
  deleteMedia,
  getFolders,
  renameFolder,
  updateMediaFolder,
} from "@/actions/media";
import { FolderDialog } from "@/components/admin/medias/FolderDialog";
import { MediaDetailsModal } from "@/components/admin/medias/MediaDetailsModal";
import { MediaUploadButton } from "@/components/admin/medias/MediaUploadButton";
import { MoveMediaDialog } from "@/components/admin/medias/MoveMediaDialog";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DBMedia, DBMediaFolder } from "@/types";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  FileText,
  Filter,
  Folder,
  FolderPlus,
  Music,
  Pencil,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getDisplayUrl } from "@/lib/utils";
import { toast } from "sonner";

interface MediaLibraryProps {
  initialMedias: DBMedia[];
  onSelect?: (media: DBMedia | DBMedia[]) => void;
  allowSelection?: boolean;
  selectionMode?: "single" | "multiple";
  stickyOffset?: string;
}

const TYPE_ORDER: Record<string, number> = {
  image: 0,
  video: 1,
  audio: 2,
  document: 3,
  other: 4,
};

type GridItem =
  | { kind: "folder"; folder: DBMediaFolder }
  | { kind: "media"; media: DBMedia };

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export function MediaLibrary({
  initialMedias,
  onSelect,
  allowSelection = false,
  selectionMode = "single",
  stickyOffset,
}: MediaLibraryProps) {
  const [medias, setMedias] = useState<DBMedia[]>(initialMedias);
  const [folders, setFolders] = useState<DBMediaFolder[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const router = useRouter();

  // Selection State (Admin Mode)
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(
    new Set(),
  );
  const [selectedMedias, setSelectedMedias] = useState<Set<number>>(new Set());

  // Dialog States
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [mediaToMove, setMediaToMove] = useState<DBMedia | null>(null);
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);
  const [folderToRename, setFolderToRename] = useState<DBMediaFolder | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [confirm, setConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync optimistic local state after router.refresh() supplies fresh server props.
    setMedias((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(initialMedias)) return prev;
      return initialMedias;
    });

    if (detailMedia) {
      setDetailMedia((prev) => {
        if (!prev) return null;
        const updated = initialMedias.find((m) => m.id === prev.id);
        if (!updated || JSON.stringify(updated) === JSON.stringify(prev))
          return prev;
        return updated;
      });
    }
  }, [initialMedias, detailMedia]);

  const reloadFolders = async () => {
    const next = await getFolders();
    setFolders(next);
    return next;
  };

  // Load folders on mount.
  useEffect(() => {
    let isMounted = true;

    getFolders().then((next) => {
      if (isMounted) setFolders(next);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const goToFolder = (folderId: number | null) => {
    setCurrentFolderId(folderId);
    setSelectedFolders((prev) => (prev.size === 0 ? prev : new Set()));
    setSelectedMedias((prev) => (prev.size === 0 ? prev : new Set()));
  };

  const foldersById = useMemo(() => {
    const map = new Map<number, DBMediaFolder>();
    folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [folders]);

  // Breadcrumb chain: Root → … → current.
  const ancestors = useMemo(() => {
    const chain: DBMediaFolder[] = [];
    let cur =
      currentFolderId != null ? foldersById.get(currentFolderId) : undefined;
    while (cur) {
      chain.unshift(cur);
      cur = cur.parentId != null ? foldersById.get(cur.parentId) : undefined;
    }
    return chain;
  }, [currentFolderId, foldersById]);

  // Per-folder aggregates (recursive, includes subfolders): total bytes for the
  // size sort + tile summary, and the most-recent created/updated timestamps of
  // the folder's CONTENTS for date sorts. Like Drive/Dropbox, a folder's date
  // reflects its content's activity; an empty folder falls back to its own row.
  const folderAgg = useMemo(() => {
    const norm = (value: Date | string | null) => {
      if (!value) return 0;
      const raw = value instanceof Date ? value.toISOString() : value;
      const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
      return new Date(normalized).getTime();
    };
    const directBytes = new Map<number, number>();
    const directCreated = new Map<number, number>();
    const directUpdated = new Map<number, number>();
    for (const m of medias) {
      if (m.folderId == null) continue;
      directBytes.set(
        m.folderId,
        (directBytes.get(m.folderId) ?? 0) + (m.fileSize ?? 0),
      );
      directCreated.set(
        m.folderId,
        Math.max(directCreated.get(m.folderId) ?? 0, norm(m.createdAt)),
      );
      directUpdated.set(
        m.folderId,
        Math.max(directUpdated.get(m.folderId) ?? 0, norm(m.updatedAt)),
      );
    }
    const childrenMap = new Map<number | null, DBMediaFolder[]>();
    for (const f of folders) {
      const arr = childrenMap.get(f.parentId) ?? [];
      arr.push(f);
      childrenMap.set(f.parentId, arr);
    }
    type Agg = { bytes: number; created: number; updated: number };
    const agg = new Map<number, Agg>();
    const compute = (f: DBMediaFolder): Agg => {
      const cached = agg.get(f.id);
      if (cached) return cached;
      let bytes = directBytes.get(f.id) ?? 0;
      let created = directCreated.get(f.id) ?? 0;
      let updated = directUpdated.get(f.id) ?? 0;
      for (const c of childrenMap.get(f.id) ?? []) {
        const ca = compute(c);
        bytes += ca.bytes;
        created = Math.max(created, ca.created);
        updated = Math.max(updated, ca.updated);
      }
      // Empty folder (no content): fall back to the folder row's own timestamps.
      if (created === 0) created = norm(f.createdAt);
      if (updated === 0) updated = norm(f.updatedAt);
      const res = { bytes, created, updated };
      agg.set(f.id, res);
      return res;
    };
    folders.forEach(compute);
    return agg;
  }, [medias, folders]);

  // Direct item count per folder (subfolders + media) for the tile summary.
  const folderItemCount = useMemo(() => {
    const count = new Map<number, number>();
    for (const f of folders) {
      if (f.parentId != null)
        count.set(f.parentId, (count.get(f.parentId) ?? 0) + 1);
    }
    for (const m of medias) {
      if (m.folderId != null)
        count.set(m.folderId, (count.get(m.folderId) ?? 0) + 1);
    }
    return count;
  }, [folders, medias]);

  const dirMul = sortDir === "asc" ? 1 : -1;

  const visibleFolders = useMemo(
    () => (search ? [] : folders.filter((f) => f.parentId === currentFolderId)),
    [folders, currentFolderId, search],
  );

  const filteredMedias = medias.filter((m) => {
    const inCurrentFolder = search
      ? true
      : (m.folderId ?? null) === currentFolderId;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return inCurrentFolder && matchesSearch && matchesType;
  });

  // Folders and media are sorted together in ONE stream — folders follow the
  // active sort like any item, not pinned to the top.
  const gridItems = useMemo(() => {
    const normalizeDate = (value: Date | string | null) => {
      if (!value) return 0;
      const raw = value instanceof Date ? value.toISOString() : value;
      const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
      return new Date(normalized).getTime();
    };
    const items: GridItem[] = [
      ...visibleFolders.map((folder) => ({ kind: "folder" as const, folder })),
      ...filteredMedias.map((media) => ({ kind: "media" as const, media })),
    ];
    const nameOf = (it: GridItem) =>
      it.kind === "folder" ? it.folder.name : it.media.name;
    const sizeOf = (it: GridItem) =>
      it.kind === "folder"
        ? (folderAgg.get(it.folder.id)?.bytes ?? 0)
        : (it.media.fileSize ?? 0);
    const dateOf = (it: GridItem, field: "created" | "updated") =>
      it.kind === "folder"
        ? (folderAgg.get(it.folder.id)?.[field] ?? 0)
        : normalizeDate(
            field === "created" ? it.media.createdAt : it.media.updatedAt,
          );
    // Folders share one rank for the type sort (they have no media type), so
    // they group together and still move as a block with the direction toggle.
    const typeRankOf = (it: GridItem) =>
      it.kind === "folder" ? -1 : (TYPE_ORDER[it.media.type] ?? 9);

    const cmp = (a: GridItem, b: GridItem) => {
      switch (sortKey) {
        case "size":
          return (sizeOf(a) - sizeOf(b)) * dirMul;
        case "created":
          return (dateOf(a, "created") - dateOf(b, "created")) * dirMul;
        case "updated":
          return (dateOf(a, "updated") - dateOf(b, "updated")) * dirMul;
        case "type":
          return (
            (typeRankOf(a) - typeRankOf(b)) * dirMul ||
            nameOf(a).localeCompare(nameOf(b))
          );
        case "name":
        default:
          return nameOf(a).localeCompare(nameOf(b)) * dirMul;
      }
    };
    return items.sort(cmp);
  }, [visibleFolders, filteredMedias, sortKey, dirMul, folderAgg]);

  const handleDelete = (id: number) => {
    setConfirm({
      message: "Hapus media ini secara permanen?",
      onConfirm: async () => {
        const result = await deleteMedia(id);
        if (result.success) {
          setMedias((prev) => prev.filter((m) => m.id !== id));
          toast.success("Media berhasil dihapus");
          router.refresh();
        } else {
          toast.error(result.message || "Gagal menghapus media");
        }
      },
    });
  };

  const handleBatchDelete = () => {
    const total = selectedFolders.size + selectedMedias.size;
    if (total === 0) return;
    setConfirm({
      message: `Hapus ${total} item terpilih? Folder harus kosong.`,
      onConfirm: async () => {
        let successCount = 0;
        const errors: string[] = [];

        for (const id of Array.from(selectedMedias)) {
          const res = await deleteMedia(id);
          if (res.success) {
            setMedias((prev) => prev.filter((m) => m.id !== id));
            successCount++;
          } else {
            errors.push(res.message || `Media #${id}`);
          }
        }
        for (const id of Array.from(selectedFolders)) {
          const res = await deleteFolder(id);
          if (res.success) successCount++;
          else errors.push(res.message || `Folder #${id}`);
        }

        setSelectedFolders(new Set());
        setSelectedMedias(new Set());
        await reloadFolders();
        if (successCount > 0)
          toast.success(`Berhasil menghapus ${successCount} item.`);
        if (errors.length > 0) toast.error(errors[0]);
        router.refresh();
      },
    });
  };

  const toggleFolderSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMediaSelection = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedMedias((prev) => {
      const next = new Set(prev);
      if (allowSelection && selectionMode === "single") {
        next.clear();
        if (!prev.has(id)) next.add(id);
      } else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMoveConfirm = async (targetFolderId: number | null) => {
    if (!mediaToMove) return;
    const result = await updateMediaFolder(mediaToMove.id, targetFolderId);
    if (result.success) {
      setMedias((prev) =>
        prev.map((m) =>
          m.id === mediaToMove.id ? { ...m, folderId: targetFolderId } : m,
        ),
      );
      toast.success("Media berhasil dipindahkan");
      router.refresh();
    } else {
      toast.error(result.message || "Gagal memindahkan media");
    }
    setMediaToMove(null);
  };

  const handleCreateFolder = async (name: string) => {
    const result = await createFolder(name, currentFolderId);
    if (result.success) {
      toast.success(result.message || "Folder berhasil dibuat");
      await reloadFolders();
    } else {
      toast.error(result.message || "Gagal membuat folder");
    }
  };

  const submitRename = async () => {
    if (!folderToRename) return;
    const result = await renameFolder(folderToRename.id, renameValue.trim());
    if (result.success) {
      toast.success(result.message || "Folder diperbarui");
      await reloadFolders();
    } else {
      toast.error(result.message || "Gagal mengganti nama folder");
    }
    setFolderToRename(null);
  };

  const handleMediaClick = (m: DBMedia) => {
    if (allowSelection) toggleMediaSelection(m.id);
    else setDetailMedia(m);
  };

  const handleConfirmSelection = () => {
    if (selectedMedias.size === 0 || !onSelect) return;
    if (selectionMode === "multiple") {
      const list = medias.filter((m) => selectedMedias.has(m.id));
      if (list.length > 0) {
        onSelect(list);
        setSelectedMedias(new Set());
      }
      return;
    }
    const selected = medias.find((m) => selectedMedias.has(m.id));
    if (selected) {
      onSelect(selected);
      setSelectedMedias(new Set());
    }
  };

  const currentFolder =
    currentFolderId != null ? foldersById.get(currentFolderId) : undefined;

  return (
    <div className="relative flex min-h-125 flex-col gap-6">
      <FolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreate={handleCreateFolder}
        currentPath={currentFolder?.path ?? null}
      />

      <MoveMediaDialog
        key={mediaToMove?.id ?? "move-media"}
        isOpen={!!mediaToMove}
        onClose={() => setMediaToMove(null)}
        onMove={handleMoveConfirm}
        folders={folders}
        currentFolderId={mediaToMove?.folderId ?? null}
      />

      <MediaDetailsModal
        isOpen={!!detailMedia}
        onClose={() => setDetailMedia(null)}
        media={detailMedia}
        folderPath={
          detailMedia?.folderId != null
            ? (foldersById.get(detailMedia.folderId)?.path ?? null)
            : null
        }
        onDelete={handleDelete}
        onMove={setMediaToMove}
      />

      {/* Rename folder dialog */}
      <Modal
        isOpen={!!folderToRename}
        onClose={() => setFolderToRename(null)}
        title="Ganti Nama Folder"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (renameValue.trim()) submitRename();
          }}
          className="flex flex-col gap-4"
        >
          <input
            autoFocus
            type="text"
            className="rounded-lg border p-2.5 text-sm md:text-base"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFolderToRename(null)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={!renameValue.trim()}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm dialog (replaces native confirm) */}
      <Modal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        title="Konfirmasi"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-neutral-600">{confirm?.message}</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm(null)}
            >
              Batal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                confirm?.onConfirm();
                setConfirm(null);
              }}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      <div
        className="sticky z-20 -mx-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 transition-all duration-300 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: stickyOffset ?? "var(--app-header-height, 0px)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="w-full">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold whitespace-nowrap text-neutral-400">
                <button
                  onClick={() => goToFolder(null)}
                  className={`flex items-center gap-1 transition-colors hover:text-brand-green ${!currentFolderId ? "text-brand-green" : ""}`}
                >
                  <Folder size={14} /> Root
                </button>
                {ancestors.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <ChevronRight size={12} className="shrink-0" />
                    <button
                      onClick={() => goToFolder(f.id)}
                      className={`transition-colors hover:text-brand-green ${i === ancestors.length - 1 ? "text-brand-green" : ""}`}
                    >
                      {f.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-1 flex-col gap-4">
              <div className="relative w-full">
                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari media..."
                  className="w-full rounded-lg border bg-neutral-50 py-2.5 pr-4 pl-10 text-sm transition-colors outline-none focus:bg-white md:text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-evenly gap-2 align-middle md:flex-row md:justify-between">
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Filter
                  size={16}
                  className="hidden shrink-0 text-neutral-400 sm:block"
                />
                <select
                  className="w-full min-w-30 cursor-pointer rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 md:w-auto md:text-base"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Saring berdasarkan tipe"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="image">Gambar</option>
                  <option value="video">Video</option>
                  <option value="document">Dokumen</option>
                  <option value="audio">Audio</option>
                </select>
                <select
                  className="w-full cursor-pointer rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 sm:w-auto md:text-base"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  aria-label="Urutkan berdasarkan"
                >
                  <option value="name">Urutkan: Nama</option>
                  <option value="created">Urutkan: Tanggal Unggah</option>
                  <option value="updated">Urutkan: Terakhir Diubah</option>
                  <option value="size">Urutkan: Ukuran File</option>
                  <option value="type">Urutkan: Tipe Media</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  title="Ubah arah urutan"
                  aria-label="Ubah arah urutan"
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-white p-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 md:text-base"
                >
                  {sortDir === "asc" ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  <span className="whitespace-nowrap">
                    {sortKey === "name"
                      ? sortDir === "asc"
                        ? "A–Z"
                        : "Z–A"
                      : sortKey === "size"
                        ? sortDir === "asc"
                          ? "Kecil"
                          : "Besar"
                        : sortDir === "asc"
                          ? "Terlama"
                          : "Terbaru"}
                  </span>
                </button>
              </div>

              <div className="flex w-full items-center justify-around gap-2 md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFolderDialogOpen(true)}
                  className="w-full gap-2 border-neutral-200 text-neutral-600 lg:w-auto"
                >
                  <FolderPlus size={16} />
                  <span className="hidden sm:inline md:hidden lg:inline">
                    Folder Baru
                  </span>
                </Button>
                <MediaUploadButton currentFolderId={currentFolderId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {gridItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-24 text-center">
          <Folder size={48} className="mx-auto mb-4 text-neutral-100" />
          <p className="font-medium text-neutral-400">
            Folder ini masih kosong.
          </p>
          {currentFolderId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToFolder(null)}
              className="mt-4"
            >
              Kembali ke Root
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {gridItems.map((item) => {
            if (item.kind === "folder") {
              const f = item.folder;
              const isSelected = selectedFolders.has(f.id);
              const count = folderItemCount.get(f.id) ?? 0;
              return (
                <div
                  key={`folder-${f.id}`}
                  onClick={() => goToFolder(f.id)}
                  className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border p-4 transition-all ${isSelected ? "border-brand-green bg-brand-light/10 ring-2 ring-brand-green ring-offset-2" : "border-neutral-200 bg-white hover:border-brand-green hover:shadow-md"} `}
                >
                  {!allowSelection && (
                    <>
                      <div
                        className={`absolute top-2 right-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-60 md:opacity-0 md:group-hover:opacity-100"}`}
                      >
                        <button
                          onClick={(e) => toggleFolderSelection(f.id, e)}
                          title="Pilih folder"
                          className={`rounded-full border p-1 transition-colors ${isSelected ? "border-brand-green bg-brand-green text-white" : "border-neutral-200 bg-white text-neutral-400 hover:border-brand-green"}`}
                        >
                          <Check
                            size={14}
                            className={isSelected ? "stroke-[3px]" : ""}
                          />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameValue(f.name);
                          setFolderToRename(f);
                        }}
                        title="Ganti nama folder"
                        className="absolute top-2 left-2 z-10 rounded-full border border-neutral-200 bg-white p-1 text-neutral-400 opacity-0 transition-all hover:border-brand-green hover:text-brand-green md:group-hover:opacity-100"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}

                  <div className="relative">
                    <Folder
                      size={56}
                      className={`transition-colors ${isSelected ? "fill-brand-green/20 text-brand-green" : "fill-brand-light stroke-brand-green/20 text-brand-light group-hover:stroke-brand-green/40"}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pt-1">
                      <span className="text-[10px] font-black text-brand-green opacity-40">
                        DIR
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-center">
                    <span className="w-full truncate text-center text-xs font-bold tracking-tighter text-neutral-600">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {count} item ·{" "}
                      {formatBytes(folderAgg.get(f.id)?.bytes ?? 0)}
                    </span>
                  </div>
                </div>
              );
            }

            const m = item.media;
            const isSelected = selectedMedias.has(m.id);

            return (
              <div
                key={`media-${m.id}`}
                className={`group relative aspect-square overflow-hidden rounded-xl border transition-all ${
                  isSelected
                    ? "border-brand-green bg-brand-light/10 ring-2 ring-brand-green ring-offset-2"
                    : allowSelection
                      ? "cursor-pointer border-neutral-200 bg-white shadow-sm hover:ring-2 hover:ring-brand-green hover:ring-offset-2"
                      : "cursor-pointer border-neutral-200 bg-white shadow-sm hover:shadow-md"
                }`}
                onClick={() => handleMediaClick(m)}
              >
                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 right-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-60 md:opacity-0 md:group-hover:opacity-100"}`}
                >
                  <button
                    onClick={(e) => toggleMediaSelection(m.id, e)}
                    title="Pilih media"
                    className={`rounded-full border p-1 transition-colors ${isSelected ? "border-brand-green bg-brand-green text-white" : "border-neutral-200 bg-white text-neutral-400 hover:border-brand-green"}`}
                  >
                    <Check
                      size={14}
                      className={isSelected ? "stroke-[3px]" : ""}
                    />
                  </button>
                </div>

                {/* Media Content */}
                {m.type === "image" || m.type === "video" ? (
                  <div className="relative h-full w-full">
                    <AppImage
                      src={getDisplayUrl(m)}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
                      className="object-cover"
                    />
                    {m.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play
                          size={32}
                          className="fill-white text-white opacity-80"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-transparent p-2 text-center">
                    {m.type === "audio" ? (
                      <Music size={32} className="text-blue-500" />
                    ) : (
                      <FileText size={32} className="text-neutral-400" />
                    )}
                    <span className="line-clamp-1 px-2 text-[10px] font-bold text-neutral-500 uppercase">
                      {m.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      {(selectedFolders.size > 0 || selectedMedias.size > 0) && (
        <div className="animate-in slide-in-from-bottom-4 fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-110 flex -translate-x-1/2 items-center gap-4 rounded-full border border-neutral-200 bg-white px-6 py-3 shadow-xl">
          <span className="text-sm font-bold text-neutral-700">
            {selectedFolders.size + selectedMedias.size} terpilih
          </span>
          <div className="h-4 w-px bg-neutral-200" />

          {allowSelection ? (
            <button
              onClick={handleConfirmSelection}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-brand-green transition-colors hover:bg-brand-light/20"
            >
              <Check size={16} />
              Gunakan Media
            </button>
          ) : (
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={16} />
              Hapus
            </button>
          )}

          <button
            onClick={() => {
              setSelectedFolders(new Set());
              setSelectedMedias(new Set());
            }}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
