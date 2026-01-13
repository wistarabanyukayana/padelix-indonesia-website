"use client";

import { MediaMetadata } from "@/types";
import { useState, useMemo, useEffect } from "react";
import { DBMedia } from "@/types";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { Play, FileText, Music, Search, Filter, Folder, ChevronRight, FolderPlus, RefreshCcw, Check, Trash2 } from "lucide-react";
import { deleteMedia, updateMediaFolder, syncFileSystemMedias, createPhysicalFolder, getPhysicalFolders, deletePhysicalFolder } from "@/actions/media";
import { syncMuxAssetStatus } from "@/actions/mux";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { FolderDialog } from "./FolderDialog";
import { MoveMediaDialog } from "./MoveMediaDialog";
import { MediaDetailsModal } from "./MediaDetailsModal";
import { MediaUploadButton } from "./MediaUploadButton";

import { toast } from "sonner";
import { getDisplayUrl } from "@/lib/utils";

interface MediaLibraryProps {
  initialMedias: DBMedia[];
  onSelect?: (media: DBMedia) => void;
  allowSelection?: boolean;
}

// Helper to ensure we have a clean object and handle any legacy stringified or corrupted data
const parseMetadata = (val: unknown): MediaMetadata => {
    if (!val) return {};
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return {}; }
    }
    // Handle "spread-string" corruption (object with keys "0", "1"...)
    if (typeof val === 'object' && val !== null && '0' in val && '1' in val) {
        try {
            const parts: string[] = [];
            const obj = val as Record<string, string>;
            Object.keys(obj).forEach(k => {
                if (!isNaN(Number(k))) parts[parts.length] = obj[k];
            });
            const recovered = parts.join('');
            const parsed = JSON.parse(recovered);
            
            const final = { ...parsed };
            Object.keys(obj).forEach(k => {
                if (isNaN(Number(k))) final[k] = obj[k];
            });
            return final;
        } catch { 
            return val as MediaMetadata; 
        }
    }
    return val as MediaMetadata;
};

export function MediaLibrary({ initialMedias, onSelect, allowSelection = false }: MediaLibraryProps) {
  const [medias, setMedias] = useState<DBMedia[]>(initialMedias);
  const [physicalFolders, setPhysicalFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Selection State (Admin Mode)
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [selectedMedias, setSelectedMedias] = useState<Set<number>>(new Set());

  // Dialog States
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [mediaToMove, setMediaToMove] = useState<DBMedia | null>(null);
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useEffect(() => {
    // Only update if data actually changed to avoid cascading renders
    setMedias(prev => {
        if (JSON.stringify(prev) === JSON.stringify(initialMedias)) return prev;
        return initialMedias;
    });
    
    // Sync detail modal if open
    if (detailMedia) {
        setDetailMedia(prev => {
            if (!prev) return null;
            const updated = initialMedias.find(m => m.id === prev.id);
            if (!updated || JSON.stringify(updated) === JSON.stringify(prev)) return prev;
            return updated;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMedias]);

  // Clear selection on folder change
  useEffect(() => {
    setSelectedFolders(prev => prev.size === 0 ? prev : new Set());
    setSelectedMedias(prev => prev.size === 0 ? prev : new Set());
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
    
    if (url.startsWith('/uploads/')) {
        relativePath = url.replace('/uploads/', '');
    } else {
        return null;
    }

    const parts = relativePath.split('/').filter(Boolean);
    if (parts.length > 1) {
        return parts.slice(0, -1).join('/');
    }
    
    return null; // Root
  };

  // Derived: All unique folders (DB + Physical)
  const allFolders = useMemo(() => {
    const folders = new Set<string>();
    
    // Add DB folders
    medias.forEach(m => {
        const f = getMediaFolder(m);
        if (f) {
            // Add all parent paths as well
            const parts = f.split('/');
            for (let i = 1; i <= parts.length; i++) {
                folders.add(parts.slice(0, i).join('/'));
            }
        }
    });

    // Add Physical folders
    physicalFolders.forEach(f => {
        // Ensure standard format (no leading slash, forward slashes)
        const normalized = f.replace(/\\/g, '/');
        const parts = normalized.split('/');
        for (let i = 1; i <= parts.length; i++) {
            folders.add(parts.slice(0, i).join('/'));
        }
    });

    return Array.from(folders).sort();
  }, [medias, physicalFolders]);

  // Derived: Folders to show in current view
  const visibleFolders = useMemo(() => {
    if (search) return []; 
    return allFolders.filter(f => {
        if (!currentFolder) return !f.includes('/'); 
        return f.startsWith(currentFolder + '/') && f.split('/').length === currentFolder.split('/').length + 1;
    });
  }, [allFolders, currentFolder, search]);

  const filteredMedias = medias.filter((m) => {
    const folder = getMediaFolder(m);
    const inCurrentFolder = search ? true : folder === currentFolder;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return inCurrentFolder && matchesSearch && matchesType;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus media ini secara permanen?")) return;

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
    if (!confirm(`Hapus ${total} item yang dipilih? (Folder harus kosong)`)) return;

    let successCount = 0;
    const errors: string[] = [];

    // Delete Medias
    for (const id of Array.from(selectedMedias)) {
        const res = await deleteMedia(id);
        if (res.success) {
            setMedias(prev => prev.filter(m => m.id !== id));
            successCount++;
        } else {
            errors.push(`Media #${id}: ${res.message}`);
        }
    }

    // Delete Folders
    for (const path of Array.from(selectedFolders)) {
        const res = await deletePhysicalFolder(path);
        if (res.success) {
            setPhysicalFolders(prev => prev.filter(p => p !== path));
            successCount++;
        } else {
             errors.push(`Folder ${path}: ${res.message}`);
        }
    }

    setSelectedFolders(new Set());
    setSelectedMedias(new Set());
    
    if (successCount > 0) toast.success(`Berhasil menghapus ${successCount} item.`);
    if (errors.length > 0) toast.error(`Gagal menghapus beberapa item: ${errors[0]}`);
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
        // Single selection for picker mode for now
        if (newSet.has(id)) newSet.clear();
        else {
            newSet.clear();
            newSet.add(id);
        }
    } else {
        // Multi selection for admin mode
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
    }
    setSelectedMedias(newSet);
  };

  const handleSyncFS = async () => {
    setIsRefreshing(true);
    const result = await syncFileSystemMedias();
    const folders = await getPhysicalFolders();
    setPhysicalFolders(folders);
    setIsRefreshing(false);
    if (result.success) {
        toast.success(result.message || "Sinkronisasi berhasil");
        router.refresh();
    } else {
        toast.error(result.message || "Sinkronisasi gagal");
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
        setPhysicalFolders(prev => [...prev, fullPath]);
        // Do not auto-navigate to keep user in context
        // setCurrentFolder(fullPath);
    } else {
        toast.error(result.message || "Gagal membuat folder");
    }
  };

  const handleSyncMux = async (id: number) => {
    setIsSyncing(id);
    const newStatus = await syncMuxAssetStatus(id);
    setIsSyncing(null);
    
    if (newStatus === 'ready') {
        setMedias(prev => prev.map(m => {
            if (m.id === id) {
                const meta = parseMetadata(m.metadata);
                return {
                    ...m,
                    metadata: {
                        ...meta,
                        status: 'ready'
                    }
                } as DBMedia;
            }
            return m;
        }));
    }
    router.refresh();
  };

  // Auto-poll for processing videos to pick up webhook updates
  useEffect(() => {
    const hasProcessing = medias.some(m => {
        if (m.type !== 'video' || m.provider !== 'mux') return false;
        const meta = parseMetadata(m.metadata);
        return meta?.status !== 'ready';
    });

    if (!hasProcessing) return;

    const interval = setInterval(() => {
        router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [medias, router]);

  const handleMediaClick = (m: DBMedia) => {
    if (allowSelection) {
        toggleMediaSelection(m.id);
    } else {
        setDetailMedia(m);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMedias.size === 0) return;
    const selectedId = Array.from(selectedMedias)[0];
    const selectedMedia = medias.find(m => m.id === selectedId);
    if (selectedMedia && onSelect) {
        onSelect(selectedMedia);
        setSelectedMedias(new Set());
    }
  };

  return (
    <div className="flex flex-col gap-6 relative min-h-[500px]">
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

      {/* Controls - Sticky */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-neutral-50 border-b border-neutral-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
                <button 
                    onClick={() => setCurrentFolder(null)}
                    className={`hover:text-brand-green transition-colors flex items-center gap-1 ${!currentFolder ? 'text-brand-green' : ''}`}
                >
                    <Folder size={14} /> Root
                </button>
                {currentFolder?.split('/').map((part, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                        <ChevronRight size={12} className="shrink-0" />
                        <button 
                            onClick={() => setCurrentFolder(arr.slice(0, i + 1).join('/'))}
                            className={`hover:text-brand-green transition-colors ${i === arr.length - 1 ? 'text-brand-green' : ''}`}
                        >
                            {part}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-3 rounded-xl border border-neutral-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari media..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm bg-neutral-50 focus:bg-white transition-colors outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={16} className="text-neutral-400" />
                        <select
                            className="p-2 border rounded-lg text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-brand-green/20 w-full md:w-auto outline-none cursor-pointer"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="image">Gambar</option>
                            <option value="video">Video</option>
                            <option value="document">Dokumen</option>
                            <option value="audio">Audio</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSyncFS} 
                        disabled={isRefreshing}
                        className="gap-2 text-neutral-600 border-neutral-200"
                    >
                        <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        <span className="hidden lg:inline">Sinkron Assets</span>
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsFolderDialogOpen(true)} 
                        className="gap-2 text-neutral-600 border-neutral-200"
                    >
                        <FolderPlus size={16} />
                        <span className="hidden lg:inline">Folder Baru</span>
                    </Button>
                    <MediaUploadButton currentFolder={currentFolder} />
                </div>
            </div>
        </div>
      </div>

      {/* Grid */}
      {(filteredMedias.length === 0 && visibleFolders.length === 0) ? (
        <div className="text-center py-24 bg-white rounded-xl border border-neutral-200 border-dashed">
          <Folder size={48} className="mx-auto text-neutral-100 mb-4" />
          <p className="text-neutral-400 font-medium">Folder ini masih kosong.</p>
          {currentFolder && (
            <Button variant="outline" size="sm" onClick={() => setCurrentFolder(null)} className="mt-4">
                Kembali ke Root
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
          {/* Folders */}
          {visibleFolders.map(f => {
            const isSelected = selectedFolders.has(f);
            return (
            <div 
                key={f}
                onClick={() => setCurrentFolder(f)}
                className={`group relative aspect-square rounded-xl overflow-hidden border transition-all flex flex-col items-center justify-center gap-3 p-4 cursor-pointer
                    ${isSelected ? 'border-brand-green bg-brand-light/10 ring-2 ring-brand-green ring-offset-2' : 'border-neutral-200 bg-white hover:border-brand-green hover:shadow-md'}
                `}
            >
                {!allowSelection && (
                    <div className={`absolute top-2 right-2 transition-opacity z-10 ${isSelected ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}>
                        <button 
                            onClick={(e) => toggleFolderSelection(f, e)}
                            className={`p-1 rounded-full transition-colors border ${isSelected ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-neutral-400 border-neutral-200 hover:border-brand-green'}`}
                        >
                            <Check size={14} className={isSelected ? "stroke-[3px]" : ""} />
                        </button>
                    </div>
                )}

                <div className="relative">
                    <Folder size={56} className={`transition-colors ${isSelected ? 'text-brand-green fill-brand-green/20' : 'text-brand-light fill-brand-light stroke-brand-green/20 group-hover:stroke-brand-green/40'}`} />
                    <div className="absolute inset-0 flex items-center justify-center pt-1">
                        <span className="text-[10px] font-black text-brand-green opacity-40">DIR</span>
                    </div>
                </div>
                <span className="text-xs font-bold text-neutral-600 tracking-tighter truncate w-full text-center">
                    {f.split('/').pop()}
                </span>
            </div>
          )})}

          {/* Medias */}
          {filteredMedias.map((m) => {
            const meta = parseMetadata(m.metadata);
            
            const isProcessing = m.type === 'video' && m.provider === 'mux' && meta.status !== 'ready';
            const isSelected = selectedMedias.has(m.id);

            return (
                <div
                key={m.id}
                className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                    isSelected 
                    ? "border-brand-green bg-brand-light/10 ring-2 ring-brand-green ring-offset-2" 
                    : allowSelection 
                        ? "cursor-pointer hover:ring-2 hover:ring-brand-green hover:ring-offset-2 shadow-sm border-neutral-200 bg-white" 
                        : "bg-white border-neutral-200 shadow-sm hover:shadow-md cursor-pointer"
                }`}
                onClick={() => !isProcessing && handleMediaClick(m)}
                >
                {/* Selection Checkbox */}
                {!isProcessing && (
                    <div className={`absolute top-2 right-2 transition-opacity z-10 ${isSelected ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}>
                        <button 
                            onClick={(e) => toggleMediaSelection(m.id, e)}
                            className={`p-1 rounded-full transition-colors border ${isSelected ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-neutral-400 border-neutral-200 hover:border-brand-green'}`}
                        >
                            <Check size={14} className={isSelected ? "stroke-[3px]" : ""} />
                        </button>
                    </div>
                )}

                {/* Media Content */}
                {m.type === "image" || (m.type === "video" && meta.status === 'ready') ? (
                    <div className="relative w-full h-full">
                        <AppImage src={getDisplayUrl(m)} alt={m.name} fill className="object-cover" />
                        {m.type === 'video' && !isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                <Play size={32} className="text-white fill-white opacity-80" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent gap-2 p-2 text-center">
                    {m.type === "video" ? (
                        <div className="relative">
                            <Play size={32} className={isProcessing ? "text-neutral-300" : "text-brand-green"} />
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw size={16} className="text-neutral-400 animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : m.type === "audio" ? <Music size={32} className="text-blue-500" /> : 
                    <FileText size={32} className="text-neutral-400" />}
                    <span className="text-[10px] font-bold text-neutral-500 uppercase line-clamp-1 px-2">{m.name}</span>
                    {isProcessing && (
                        <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1 rounded font-black uppercase tracking-tighter">
                            Processing
                        </span>
                    )}
                    </div>
                )}
                
                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center cursor-not-allowed">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase bg-white/80 px-2 py-1 rounded shadow-sm">Wait...</span>
                    </div>
                )}
                
                {/* Mux Sync (Only for stuck videos) */}
                {m.type === 'video' && isProcessing && !allowSelection && (
                    <div className="absolute top-2 right-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 bg-white border-white text-brand-green hover:bg-neutral-100 shadow-sm"
                            onClick={(e) => { e.stopPropagation(); handleSyncMux(m.id); }}
                            disabled={isSyncing === m.id}
                        >
                            <RefreshCw size={12} className={isSyncing === m.id ? "animate-spin" : ""} />
                        </Button>
                    </div>
                )}
                </div>
            )
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      {(selectedFolders.size > 0 || selectedMedias.size > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-neutral-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-[110] animate-in slide-in-from-bottom-4">
            <span className="text-sm font-bold text-neutral-700">
                {selectedFolders.size + selectedMedias.size} terpilih
            </span>
            <div className="h-4 w-px bg-neutral-200" />
            
            {allowSelection ? (
                <button 
                    onClick={handleConfirmSelection}
                    className="flex items-center gap-2 text-brand-green hover:bg-brand-light/20 px-3 py-1.5 rounded-full transition-colors text-sm font-bold"
                >
                    <Check size={16} />
                    Gunakan Media
                </button>
            ) : (
                <button 
                    onClick={handleBatchDelete}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors text-sm font-bold"
                >
                    <Trash2 size={16} />
                    Hapus
                </button>
            )}
            
            <button 
                onClick={() => { setSelectedFolders(new Set()); setSelectedMedias(new Set()); }}
                className="flex items-center gap-2 text-neutral-500 hover:bg-neutral-100 px-3 py-1.5 rounded-full transition-colors text-sm font-bold"
            >
                Batal
            </button>
        </div>
      )}
    </div>
  );
}

