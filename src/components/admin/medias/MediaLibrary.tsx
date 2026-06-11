"use client";

import {
  createPhysicalFolder,
  deleteMedia,
  deletePhysicalFolder,
  getPhysicalFolders,
  syncCloudinaryMedias,
  updateMediaFolder,
} from "@/actions/media";
import { FolderDialog } from "@/components/admin/medias/FolderDialog";
import { MediaDetailsModal } from "@/components/admin/medias/MediaDetailsModal";
import { MediaUploadButton } from "@/components/admin/medias/MediaUploadButton";
import { MoveMediaDialog } from "@/components/admin/medias/MoveMediaDialog";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { DBMedia, MediaMetadata } from "@/types";
import {
  Check,
  ChevronRight,
  FileText,
  Filter,
  Folder,
  FolderPlus,
  Music,
  Play,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getDisplayUrl } from "@/lib/utils";
import { toast } from "sonner";

interface MediaLibraryProps {
  initialMedias: DBMedia[];
  onSelect?: (media: DBMedia | DBMedia[]) => void;
  allowSelection?: boolean;
  selectionMode?: "single" | "multiple";
  stickyOffset?: string;
}

// Helper to ensure we have a clean object and handle any legacy stringified or corrupted data
const parseMetadata = (val: unknown): MediaMetadata => {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  // Handle "spread-string" corruption (object with keys "0", "1"...)
  if (typeof val === "object" && val !== null && "0" in val && "1" in val) {
    try {
      const parts: string[] = [];
      const obj = val as Record<string, string>;
      Object.keys(obj).forEach((k) => {
        if (!isNaN(Number(k))) parts[parts.length] = obj[k];
      });
      const recovered = parts.join("");
      const parsed = JSON.parse(recovered);

      const final = { ...parsed };
      Object.keys(obj).forEach((k) => {
        if (isNaN(Number(k))) final[k] = obj[k];
      });
      return final;
    } catch {
      return val as MediaMetadata;
    }
  }
  return val as MediaMetadata;
};

export function MediaLibrary({
  initialMedias,
  onSelect,
  allowSelection = false,
  selectionMode = "single",
  stickyOffset,
}: MediaLibraryProps) {
  const [medias, setMedias] = useState<DBMedia[]>(initialMedias);
  const [physicalFolders, setPhysicalFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const breadcrumbRef = useRef<HTMLDivElement>(null);

  // Selection State (Admin Mode)
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedMedias, setSelectedMedias] = useState<Set<number>>(new Set());

  // Dialog States
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [mediaToMove, setMediaToMove] = useState<DBMedia | null>(null);
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useEffect(() => {
    // Only update if data actually changed to avoid cascading renders
    setMedias((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(initialMedias)) return prev;
      return initialMedias;
    });

    // Sync detail modal if open
    if (detailMedia) {
      setDetailMedia((prev) => {
        if (!prev) return null;
        const updated = initialMedias.find((m) => m.id === prev.id);
        if (!updated || JSON.stringify(updated) === JSON.stringify(prev))
          return prev;
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMedias]);

  useEffect(() => {
    const container = breadcrumbRef.current;
    if (!container) return;
    const raf = requestAnimationFrame(() => {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentFolder]);

  // Clear selection on folder change
  useEffect(() => {
    setSelectedFolders((prev) => (prev.size === 0 ? prev : new Set()));
    setSelectedMedias((prev) => (prev.size === 0 ? prev : new Set()));
  }, [currentFolder]);

  // Load physical folders on mount
  useEffect(() => {
    const loadFolders = async () => {
      const folders = await getPhysicalFolders();
      setPhysicalFolders(folders);
    };
    loadFolders();
  }, []);

  // Helper to get folder for a media based on its physical URL OR metadata override
  const getMediaFolder = (m: DBMedia): string | null => {
    const meta = parseMetadata(m.metadata);
    if (meta?.folder) return meta.folder;

    const url = m.url;
    let relativePath = "";

    if (url.startsWith("/uploads/")) {
      relativePath = url.replace("/uploads/", "");
    } else {
      return null;
    }

    const parts = relativePath.split("/").filter(Boolean);
    if (parts.length > 1) {
      return parts.slice(0, -1).join("/");
    }

    return null; // Root
  };

  // Derived: All unique folders (DB + Physical)
  const allFolders = useMemo(() => {
    const folders = new Set<string>();

    // Add DB folders
    medias.forEach((m) => {
      const f = getMediaFolder(m);
      if (f) {
        // Add all parent paths as well
        const parts = f.split("/");
        for (let i = 1; i <= parts.length; i++) {
          folders.add(parts.slice(0, i).join("/"));
        }
      }
    });

    // Add Physical folders
    physicalFolders.forEach((f) => {
      // Ensure standard format (no leading slash, forward slashes)
      const normalized = f.replace(/\\/g, "/");
      const parts = normalized.split("/");
      for (let i = 1; i <= parts.length; i++) {
        folders.add(parts.slice(0, i).join("/"));
      }
    });

    return Array.from(folders).sort();
  }, [medias, physicalFolders]);

  // Derived: Folders to show in current view
  const visibleFolders = useMemo(() => {
    if (search) return [];
    return allFolders.filter((f) => {
      if (!currentFolder) return !f.includes("/");
      return (
        f.startsWith(currentFolder + "/") &&
        f.split("/").length === currentFolder.split("/").length + 1
      );
    });
  }, [allFolders, currentFolder, search]);

  const filteredMedias = medias.filter((m) => {
    const folder = getMediaFolder(m);
    const inCurrentFolder = search ? true : folder === currentFolder;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return inCurrentFolder && matchesSearch && matchesType;
  });
  const sortedMedias = [...filteredMedias].sort((a, b) => {
    const normalizeDate = (value: Date | string | null) => {
      if (!value) return 0;
      const raw = value instanceof Date ? value.toISOString() : value;
      const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`;
      return new Date(normalized).getTime();
    };
    let valueA: string | number = 0;
    let valueB: string | number = 0;
    switch (sortKey) {
      case "created":
        valueA = normalizeDate(a.createdAt);
        valueB = normalizeDate(b.createdAt);
        break;
      case "updated":
        valueA = normalizeDate(a.updatedAt);
        valueB = normalizeDate(b.updatedAt);
        break;
      case "name":
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
    }
    if (valueA < valueB) return sortDir === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id: number) => {
    if (
      !confirm("Apakah Anda yakin ingin menghapus media ini secara permanen?")
    )
      return;

    const result = await deleteMedia(id);
    if (result.success) {
      setMedias(medias.filter((m) => m.id !== id));
      toast.success("Media berhasil dihapus");
      router.refresh();
    } else {
      toast.error(result.message || "Gagal menghapus media");
    }
  };

  const handleBatchDelete = async () => {
    const folderCount = selectedFolders.size;
    const mediaCount = selectedMedias.size;
    const total = folderCount + mediaCount;

    if (total === 0) return;
    if (!confirm(`Hapus ${total} item yang dipilih? (Folder harus kosong)`))
      return;

    let successCount = 0;
    const errors: string[] = [];

    // Delete Medias
    for (const id of Array.from(selectedMedias)) {
      const res = await deleteMedia(id);
      if (res.success) {
        setMedias((prev) => prev.filter((m) => m.id !== id));
        successCount++;
      } else {
        errors.push(`Media #${id}: ${res.message}`);
      }
    }

    // Delete Folders
    for (const path of Array.from(selectedFolders)) {
      const res = await deletePhysicalFolder(path);
      if (res.success) {
        setPhysicalFolders((prev) => prev.filter((p) => p !== path));
        successCount++;
      } else {
        errors.push(`Folder ${path}: ${res.message}`);
      }
    }

    setSelectedFolders(new Set());
    setSelectedMedias(new Set());

    if (successCount > 0)
      toast.success(`Berhasil menghapus ${successCount} item.`);
    if (errors.length > 0)
      toast.error(`Gagal menghapus beberapa item: ${errors[0]}`);
    router.refresh();
  };

  const toggleFolderSelection = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedFolders);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setSelectedFolders(newSet);
  };

  const toggleMediaSelection = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSet = new Set(selectedMedias);

    if (allowSelection) {
      if (selectionMode === "multiple") {
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
      } else {
        // Single selection for picker mode
        if (newSet.has(id)) newSet.clear();
        else {
          newSet.clear();
          newSet.add(id);
        }
      }
    } else {
      // Multi selection for admin mode
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
    }
    setSelectedMedias(newSet);
  };

  const handleSync = async () => {
    setIsRefreshing(true);
    const result = await syncCloudinaryMedias();
    const folders = await getPhysicalFolders();
    setPhysicalFolders(folders);
    setIsRefreshing(false);

    if (result.success) {
      toast.success(result.message || "Sinkronisasi berhasil");
      router.refresh();
    } else if (result.message) {
      toast.error(result.message);
    }
  };

  const handleMoveConfirm = async (targetFolder: string | null) => {
    if (!mediaToMove) return;
    const result = await updateMediaFolder(mediaToMove.id, targetFolder);
    if (result.success) {
      toast.success("Media berhasil dipindahkan");
      router.refresh();
    } else {
      toast.error(result.message || "Gagal memindahkan media");
    }
    setMediaToMove(null);
  };

  const handleCreateFolder = async (name: string) => {
    const fullPath = currentFolder ? `${currentFolder}/${name}` : name;

    const result = await createPhysicalFolder(fullPath);

    if (result.success) {
      toast.success(result.message || "Folder berhasil dibuat");
      setPhysicalFolders((prev) => [...prev, fullPath]);
      // Do not auto-navigate to keep user in context
      // setCurrentFolder(fullPath);
    } else {
      toast.error(result.message || "Gagal membuat folder");
    }
  };

  const handleMediaClick = (m: DBMedia) => {
    if (allowSelection) {
      toggleMediaSelection(m.id);
    } else {
      setDetailMedia(m);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMedias.size === 0) return;
    if (!onSelect) return;

    if (selectionMode === "multiple") {
      const selectedList = medias.filter((m) => selectedMedias.has(m.id));
      if (selectedList.length > 0) {
        onSelect(selectedList);
        setSelectedMedias(new Set());
      }
      return;
    }

    const selectedId = Array.from(selectedMedias)[0];
    const selectedMedia = medias.find((m) => m.id === selectedId);
    if (selectedMedia) {
      onSelect(selectedMedia);
      setSelectedMedias(new Set());
    }
  };

  return (
    <div className="relative flex min-h-125 flex-col gap-6">
      <FolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreate={handleCreateFolder}
        currentPath={currentFolder}
      />

      <MoveMediaDialog
        isOpen={!!mediaToMove}
        onClose={() => setMediaToMove(null)}
        onMove={handleMoveConfirm}
        existingFolders={allFolders}
        currentFolder={currentFolder}
      />

      <MediaDetailsModal
        isOpen={!!detailMedia}
        onClose={() => setDetailMedia(null)}
        media={detailMedia}
        onDelete={handleDelete}
        onMove={setMediaToMove}
      />

      <div
        className="sticky z-20 -mx-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 transition-all duration-300 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: stickyOffset ?? "var(--app-header-height, 0px)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="w-full">
              <div
                ref={breadcrumbRef}
                className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold whitespace-nowrap text-neutral-400"
              >
                <button
                  onClick={() => setCurrentFolder(null)}
                  className={`flex items-center gap-1 transition-colors hover:text-brand-green ${!currentFolder ? "text-brand-green" : ""}`}
                >
                  <Folder size={14} /> Root
                </button>
                {currentFolder?.split("/").map((part, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <ChevronRight size={12} className="shrink-0" />
                    <button
                      onClick={() =>
                        setCurrentFolder(arr.slice(0, i + 1).join("/"))
                      }
                      className={`transition-colors hover:text-brand-green ${i === arr.length - 1 ? "text-brand-green" : ""}`}
                    >
                      {part}
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
              <div className="flex w-full items-center justify-between gap-2 md:w-auto">
                <Filter className="w-16 text-neutral-400 sm:w-8 md:w-4" />
                <select
                  className="w-full min-w-30 cursor-pointer rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 md:w-auto md:text-base"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
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
                >
                  <option value="name">Urutkan: Nama</option>
                  <option value="created">Urutkan: Dibuat</option>
                  <option value="updated">Urutkan: Diubah</option>
                </select>
                <select
                  className="w-full cursor-pointer rounded-lg border bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 sm:w-auto md:text-base"
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>

              <div className="flex w-full items-center justify-around gap-2 md:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isRefreshing}
                  className="w-full gap-2 border-neutral-200 text-neutral-600 lg:w-auto"
                >
                  <RefreshCcw
                    size={16}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline md:hidden lg:inline">
                    Sinkron Assets
                  </span>
                </Button>
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
                <MediaUploadButton currentFolder={currentFolder} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredMedias.length === 0 && visibleFolders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-24 text-center">
          <Folder size={48} className="mx-auto mb-4 text-neutral-100" />
          <p className="font-medium text-neutral-400">
            Folder ini masih kosong.
          </p>
          {currentFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentFolder(null)}
              className="mt-4"
            >
              Kembali ke Root
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {/* Folders */}
          {visibleFolders.map((f) => {
            const isSelected = selectedFolders.has(f);
            return (
              <div
                key={f}
                onClick={() => setCurrentFolder(f)}
                className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border p-4 transition-all ${isSelected ? "border-brand-green bg-brand-light/10 ring-2 ring-brand-green ring-offset-2" : "border-neutral-200 bg-white hover:border-brand-green hover:shadow-md"} `}
              >
                {!allowSelection && (
                  <div
                    className={`absolute top-2 right-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
                  >
                    <button
                      onClick={(e) => toggleFolderSelection(f, e)}
                      className={`rounded-full border p-1 transition-colors ${isSelected ? "border-brand-green bg-brand-green text-white" : "border-neutral-200 bg-white text-neutral-400 hover:border-brand-green"}`}
                    >
                      <Check
                        size={14}
                        className={isSelected ? "stroke-[3px]" : ""}
                      />
                    </button>
                  </div>
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
                <span className="w-full truncate text-center text-xs font-bold tracking-tighter text-neutral-600">
                  {f.split("/").pop()}
                </span>
              </div>
            );
          })}

          {/* Medias */}
          {sortedMedias.map((m) => {
            const isSelected = selectedMedias.has(m.id);

            return (
              <div
                key={m.id}
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
                  className={`absolute top-2 right-2 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
                >
                  <button
                    onClick={(e) => toggleMediaSelection(m.id, e)}
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
