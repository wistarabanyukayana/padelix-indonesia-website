"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Upload, Image as ImageIcon, X, Library, ChevronDown, ChevronUp, Search } from "lucide-react";
import { AppImage } from "@/components/general/AppImage";
import Link from "next/link";
import { ActionState, DBCategory, CategoryFormProps, DBMedia } from "@/types";
import { MediaSelector } from "./MediaSelector";
import { MediaDetailsModal } from "./MediaDetailsModal";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { toast } from "sonner";
import { getDisplayUrl } from "@/lib/utils";

export function CategoryForm({ action, initialData, categories, allMedias }: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  
  // Details Modal State
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  // Slug Logic
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!initialData?.slug) {
        const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(newSlug);
    }
  };

  // Image Logic
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleCancelUpload = () => {
    if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
        setIsUploading(false);
        toast.info("Unggahan dibatalkan");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        
        const uploadPromise = new Promise<DBMedia>((resolve, reject) => {
            xhr.open("POST", "/api/media/upload");
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.onerror = () => reject(new Error("Network error"));
            xhr.onabort = () => reject("ABORTED");
            xhr.send(formData);
        });

        const result = await uploadPromise;
        xhrRef.current = null;
        setIsUploading(false);
        
        if (result.url) {
            setImageUrl(result.url);
        }
    } catch (error) {
        if (error === 'ABORTED') return;
        setIsUploading(false);
        xhrRef.current = null;
        console.error("Upload error:", error);
        toast.error("Gagal mengunggah gambar.");
    }
  };

  // Tree Logic for Parent Selection
  const [parentId, setParentId] = useState<number | null>(initialData?.parentId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildTreeNodes = (list: DBCategory[], pId: number | null = null): TreeNode[] => {
    return list
      .filter(c => c.parentId === pId && c.id !== initialData?.id) // Prevent self-selection
      .map(c => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(list, c.id),
        data: c
      }));
  };

  const treeNodes = [
    { id: "root", label: "-- Tanpa Parent --", value: null },
    ...buildTreeNodes(categories)
  ];

  const selectedCategory = categories.find(c => c.id === parentId);

  const renderLabel = (node: TreeNode) => {
    const isSelected = parentId === (node.id === "root" ? null : node.id);
    return (
        <button
            type="button"
            onClick={() => { 
                setParentId(node.id === "root" ? null : node.id as number); 
                setIsDropdownOpen(false); 
            }}
            className={`flex items-center gap-2 w-full p-1 rounded text-sm text-left hover:bg-neutral-100 transition-all ${isSelected ? 'text-brand-green font-bold' : 'text-neutral-700'}`}
        >
            <span>{node.label}</span>
        </button>
    );
  };

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      
      {/* Hidden input for image & parentId */}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />

      <MediaDetailsModal 
        isOpen={!!detailMedia} 
        onClose={() => setDetailMedia(null)} 
        media={detailMedia}
      />

      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-neutral-900">Informasi Kategori</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Nama Kategori</label>
            <input 
                name="name" 
                value={name} 
                onChange={handleNameChange} 
                className="p-2 border rounded" 
                required 
            />
            {state?.error?.name && <p className="text-red-500 text-sm">{state.error.name[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Slug (Otomatis)</label>
            <input 
                name="slug" 
                value={slug} 
                readOnly 
                className="p-2 border rounded bg-neutral-100 text-neutral-500 cursor-not-allowed" 
            />
            {state?.error?.slug && <p className="text-red-500 text-sm">{state.error.slug[0]}</p>}
          </div>

          <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
            <label className="text-sm font-bold text-neutral-700">Parent Kategori (Opsional)</label>
            <div 
                className="p-2 border rounded flex justify-between items-center cursor-pointer bg-white"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <span className="text-sm text-neutral-700">
                    {parentId ? selectedCategory?.name : "-- Tanpa Parent --"}
                </span>
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto p-2">
                    <CollapsibleTree 
                        nodes={treeNodes} 
                        renderLabel={renderLabel} 
                        defaultExpanded={true}
                    />
                </div>
            )}
          </div>
          {state?.error?.parentId && <p className="text-red-500 text-sm">{state.error.parentId[0]}</p>}

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Deskripsi</label>
            <textarea name="description" defaultValue={initialData?.description ?? ""} className="p-2 border rounded h-24 text-sm" />
            {state?.error?.description && <p className="text-red-500 text-sm">{state.error.description[0]}</p>}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Gambar Kategori</label>
            <div className="flex flex-col sm:flex-row gap-6 items-start p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                <div 
                    className={`relative w-32 h-32 flex-shrink-0 rounded-lg bg-white border border-neutral-200 shadow-inner overflow-hidden flex items-center justify-center group/preview ${imageUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                        if (!imageUrl) return;
                        const fullMedia = allMedias.find(m => m.url === imageUrl);
                        if (fullMedia) setDetailMedia(fullMedia);
                    }}
                >
                    {imageUrl ? (
                        <>
                            <AppImage 
                                src={getDisplayUrl(allMedias.find(m => m.url === imageUrl) || { url: imageUrl, type: 'image' })} 
                                alt="Preview" 
                                fill 
                                className="object-cover" 
                            />
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setImageUrl(""); }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/preview:opacity-100 transition-opacity z-10"
                                title="Hapus Gambar"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <Search size={24} className="text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-300">
                            <ImageIcon size={32} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-2">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            <span className="text-[10px] text-white font-bold uppercase">Uploading...</span>
                            <button 
                                type="button" 
                                onClick={handleCancelUpload}
                                className="mt-1 text-[8px] text-white font-black uppercase bg-red-600 px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-1 w-full flex flex-col gap-4 justify-center h-full pt-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-neutral-600">Visual Representasi Kategori</p>
                        <p className="text-xs text-neutral-400">Gambar ini akan ditampilkan pada halaman produk dan navigasi utama.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <MediaSelector 
                            allMedias={allMedias} 
                            onSelect={(m) => setImageUrl(m.url)}
                            trigger={
                                <Button type="button" variant="outline" className="gap-2 bg-white border-neutral-200 text-neutral-700 hover:text-brand-green hover:border-brand-green">
                                    <Library size={18}/> 
                                    <span>Pilih dari Library</span>
                                </Button>
                            }
                        />
                        <div className="relative">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                                    e.target.value = '';
                                }}
                            />
                            <Button type="button" variant="outline" disabled={isUploading} className="gap-2 bg-white border-neutral-200 text-neutral-700 hover:text-brand-green hover:border-brand-green">
                                <Upload size={18}/> 
                                <span>{isUploading ? "Mengunggah..." : "Upload Baru"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {state?.error?.imageUrl && <p className="text-red-500 text-sm font-bold mt-1">{state.error.imageUrl[0]}</p>}
          </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/categories">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Kategori"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/categories" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
                <X size={16} /> Batal
            </Link>
            <Button variant="dark" size="lg" type="submit" disabled={isPending} className="shadow-lg shadow-brand-green/20 px-8">
                <Save size={18} className="mr-2" />
                {isPending ? "Simpan..." : "Simpan"}
            </Button>
        </div>
      </div>
    </form>
  );
}
