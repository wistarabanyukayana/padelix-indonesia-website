"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Upload, Save, X, Search, ChevronDown, ChevronUp, Library, Play } from "lucide-react";
import { uploadFile, deleteMedia } from "@/actions/media";
import { AppImage } from "@/components/general/AppImage";
import Link from "next/link";
import { ActionState, DBCategory, MediaUI, ProductVariantUI, ProductSpecUI, ProductFormProps, DBMedia } from "@/types";

import { createMuxUpload, getMuxMediaByUploadId } from "@/actions/mux";
import { MediaSelector } from "./MediaSelector";
import { MediaDetailsModal } from "./MediaDetailsModal";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { useRef } from "react";
import { toast } from "sonner";
import { getDisplayUrl, parseMetadata } from "@/lib/utils";

export function ProductForm({ action, initialData, categories, brands, allMedias, currentFolder }: ProductFormProps & { currentFolder?: string | null }) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  
  // Details Modal State
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pendingMediaIdRef = useRef<number | null>(null);

  const handleCancelUpload = async () => {
    if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
        
        // Clean up DB record
        if (pendingMediaIdRef.current) {
            await deleteMedia(pendingMediaIdRef.current);
            pendingMediaIdRef.current = null;
        }

        setUploadingIndex(null);
        setUploadProgress(0);
        toast.info("Unggahan dibatalkan");
    }
  };
  
  // Category Selection Logic
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.categoryId || null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildTreeNodes = (list: DBCategory[], pId: number | null = null): TreeNode[] => {
    return list
      .filter(c => c.parentId === pId)
      .map(c => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(list, c.id),
      }));
  };

  const treeNodes = [
    { id: "root", label: "-- Pilih Kategori --", value: null },
    ...buildTreeNodes(categories)
  ];

  const selectedCategory = categories.find(c => c.id === categoryId);

  const renderCategoryLabel = (node: TreeNode) => {
    const isSelected = categoryId === (node.id === "root" ? null : node.id);
    return (
        <button
            type="button"
            onClick={() => { 
                setCategoryId(node.id === "root" ? null : node.id as number); 
                setIsCategoryDropdownOpen(false); 
            }}
            className={`flex items-center gap-2 w-full p-1 rounded text-sm text-left hover:bg-neutral-100 transition-all ${isSelected ? 'text-brand-green font-bold' : 'text-neutral-700'}`}
        >
            <span>{node.label}</span>
        </button>
    );
  };
  
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

  // --- Local State for Nested Data ---
  
  // Medias
  const [medias, setMedias] = useState<MediaUI[]>(initialData?.medias || []);
  const addMedia = () => {
    setMedias([...medias, { id: 0, url: "", type: "image", isPrimary: medias.length === 0, sortOrder: medias.length + 1, altText: null }]);
  };

  const addMediaFromLibrary = (media: DBMedia) => {
    if (medias.some(m => m.id === media.id)) {
        toast.error("Media ini sudah ada di daftar.");
        return;
    }
    setMedias([...medias, { 
        id: media.id, 
        url: media.url, 
        type: media.type as MediaUI["type"], 
        metadata: parseMetadata(media.metadata),
        isPrimary: medias.length === 0, 
        sortOrder: medias.length + 1, 
        altText: null 
    }]);
  };

  const updateMedia = <K extends keyof MediaUI>(index: number, field: K, value: MediaUI[K]) => {
    const newMedias = [...medias];
    newMedias[index][field] = value;

    if (field === 'isPrimary' && value === true) {
        newMedias.forEach((m, i) => { if (i !== index) m.isPrimary = false; });
    }
    setMedias(newMedias);
  };
  const removeMedia = (index: number) => {
    setMedias(medias.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingIndex(index);
    setUploadProgress(0);

    try {
        if (file.type.startsWith("video/")) {
            // --- Mux Video Flow ---
            const uploadInfo = await createMuxUpload(file.name, currentFolder);
            
            // Link record ID for potential cleanup
            const initialRecord = await getMuxMediaByUploadId(uploadInfo.id);
            if (initialRecord) pendingMediaIdRef.current = initialRecord.id;

            // Perform the actual upload to Mux
            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;
            xhr.open('PUT', uploadInfo.url);
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            };

            const uploadPromise = new Promise<DBMedia>((resolve, reject) => {
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(JSON.parse(xhr.response)) : reject(new Error('Mux upload failed'));
                xhr.onerror = () => reject(new Error('Mux upload error'));
                xhr.onabort = () => reject('ABORTED');
            });

            xhr.send(file);
            await uploadPromise;
            xhrRef.current = null;
            pendingMediaIdRef.current = null;

            let mediaRecord = null;
            let attempts = 0;
            // Poll for the DB record to be updated with asset ID (by webhook)
            while(attempts < 10) {
                try {
                    mediaRecord = await getMuxMediaByUploadId(uploadInfo.id);
                    if (mediaRecord && mediaRecord.url) break; // Linked and has URL
                    attempts++;
                    await new Promise(r => setTimeout(r, 2000));
                } catch {
                    attempts++;
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            if (mediaRecord) {
                const newMedias = [...medias];
                newMedias[index].url = mediaRecord.url;
                newMedias[index].id = mediaRecord.id;
                newMedias[index].type = "video";
                newMedias[index].metadata = parseMetadata(mediaRecord.metadata);
                setMedias(newMedias);
            }
        } else {
            // --- Local Image/Doc Flow ---
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadFile(formData);
            if (result.url && result.id) {
                const newMedias = [...medias];
                newMedias[index].url = result.url;
                newMedias[index].id = result.id;
                newMedias[index].metadata = null;
                if (file.type.startsWith("image/")) newMedias[index].type = "image";
                else newMedias[index].type = "document";
                setMedias(newMedias);
            } else if (result.error) {
                toast.error(result.error);
            }
        }
    } catch (error) {
        if (error === 'ABORTED') return;
        console.error("Upload error:", error);
        toast.error("Gagal mengunggah file. Silakan coba lagi.");
    } finally {
        setUploadingIndex(null);
        setUploadProgress(0);
    }
  };

  // Variants
  const [variants, setVariants] = useState<ProductVariantUI[]>(initialData?.variants || []);
  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", priceAdjustment: 0, stock: 0, isUnlimited: false }]);
  };
  const updateVariant = (index: number, field: keyof ProductVariantUI, value: string | boolean | number | null) => {
    const newVariants = [...variants];
    if (field === 'name') newVariants[index].name = value as string;
    if (field === 'sku') newVariants[index].sku = value as string | null;
    if (field === 'priceAdjustment') newVariants[index].priceAdjustment = value as string | number;
    if (field === 'stock') newVariants[index].stock = value as string | number;
    if (field === 'isUnlimited') newVariants[index].isUnlimited = value as boolean;
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Specs
  const [specs, setSpecs] = useState<ProductSpecUI[]>(initialData?.specs || []);
  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };
  const updateSpec = (index: number, field: keyof ProductSpecUI, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };


  // Filter out empty data before submission
  const cleanMedias = medias.filter(m => m.id !== 0);
  const cleanVariants = variants.filter(v => v.name && v.name.trim() !== "");
  const cleanSpecs = specs.filter(s => s.key && s.key.trim() !== "" && s.value && s.value.trim() !== "");

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      
      {/* Hidden inputs for nested data */}
      <input type="hidden" name="medias" value={JSON.stringify(cleanMedias)} />
      <input type="hidden" name="variants" value={JSON.stringify(cleanVariants)} />
      <input type="hidden" name="specs" value={JSON.stringify(cleanSpecs)} />

      <MediaDetailsModal 
        isOpen={!!detailMedia} 
        onClose={() => setDetailMedia(null)} 
        media={detailMedia}
      />

      {/* --- Section 1: General Info --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-neutral-900">Informasi Umum</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Nama Produk</label>
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

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Deskripsi (Mendukung HTML)</label>
            <textarea name="description" defaultValue={initialData?.description ?? ""} className="p-2 border rounded h-32 font-mono text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Harga Dasar (IDR)</label>
            <input type="number" name="basePrice" defaultValue={initialData?.basePrice} className="p-2 border rounded" required min="0" />
            {state?.error?.basePrice && <p className="text-red-500 text-sm">{state.error.basePrice[0]}</p>}
          </div>

          <div className="flex flex-col gap-2 relative" ref={categoryDropdownRef}>
            <label className="text-sm font-bold text-neutral-700">Kategori</label>
            <input type="hidden" name="categoryId" value={categoryId ?? ""} />
            <div 
                className="p-2 border rounded flex justify-between items-center cursor-pointer bg-white"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
                <span className="text-sm text-neutral-700">
                    {categoryId ? selectedCategory?.name : "-- Pilih Kategori --"}
                </span>
                {isCategoryDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-60 overflow-y-auto p-2">
                    <CollapsibleTree 
                        nodes={treeNodes} 
                        renderLabel={renderCategoryLabel} 
                        defaultExpanded={true}
                    />
                </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Brand</label>
            <select name="brandId" defaultValue={initialData?.brandId ?? ""} className="p-2 border rounded">
              <option value="">-- Pilih Brand --</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mt-2 md:col-span-2 p-4 bg-neutral-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" value="true" defaultChecked={initialData?.isActive} className="w-4 h-4 accent-brand-green" />
              <span className="text-sm font-medium text-neutral-700">Aktif (Tampil di web)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" value="true" defaultChecked={initialData?.isFeatured} className="w-4 h-4 accent-brand-green" />
              <span className="text-sm font-medium text-neutral-700">Featured (Unggulan)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="showPrice" value="true" defaultChecked={initialData?.showPrice ?? true} className="w-4 h-4 accent-brand-green" />
              <span className="text-sm font-medium text-neutral-700">Tampilkan Harga</span>
            </label>
          </div>
        </div>
      </div>

      {/* --- Section 2: Medias --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">Media Produk</h2>
          <MediaSelector 
            allMedias={allMedias} 
            onSelect={addMediaFromLibrary} 
            trigger={<Button type="button" variant="outline" size="sm" className="flex items-center gap-2"><Search size={14}/> Library</Button>}
          />
        </div>
        
        <div className="space-y-4 mb-4">
          {medias.map((m, idx) => (
            <div key={idx} className="flex flex-col gap-4 p-4 bg-neutral-50 rounded border border-neutral-100 relative">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                 {/* Preview */}
                 <div 
                    className={`relative w-24 h-24 flex-shrink-0 rounded bg-white border border-neutral-200 overflow-hidden flex items-center justify-center ${m.id !== 0 ? 'cursor-pointer group/preview' : ''}`}
                    onClick={() => {
                        if (m.id === 0) return;
                        const fullMedia = allMedias.find(am => am.id === m.id);
                        if (fullMedia) setDetailMedia(fullMedia);
                    }}
                 >
                    {m.url ? (
                        <>
                            <AppImage src={getDisplayUrl(m)} alt="Preview" fill className="object-cover" />
                            {m.type !== 'image' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <Play size={20} className="text-white fill-white opacity-80" />
                                </div>
                            )}
                            {m.id !== 0 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                    <Search size={20} className="text-white" />
                                </div>
                            )}
                        </>
                    ) : (
                        <ImageIcon className="text-neutral-300" size={24} />
                    )}
                    {uploadingIndex === idx && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            {uploadProgress > 0 && (
                                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}
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

                 {/* Inputs */}
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                     <div className="md:col-span-8 flex flex-col gap-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Aksi Media</label>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    accept="*/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleFileUpload(idx, e.target.files[0]);
                                        e.target.value = '';
                                    }}
                                />
                                <Button type="button" size="sm" variant="outline" className="gap-2 bg-white" disabled={uploadingIndex === idx}>
                                    <Upload size={14} /> 
                                    <span>{uploadingIndex === idx ? "Mengunggah..." : "Upload Baru"}</span>
                                </Button>
                            </div>
                            <MediaSelector 
                                allMedias={allMedias} 
                                onSelect={(media) => {
                                    const newMedias = [...medias];
                                    newMedias[idx].id = media.id;
                                    newMedias[idx].url = media.url;
                                    newMedias[idx].type = media.type as MediaUI["type"];
                                    setMedias(newMedias);
                                }} 
                                trigger={
                                    <Button type="button" size="sm" variant="outline" className="gap-2 bg-white">
                                        <Library size={14}/> 
                                        <span>Ganti dari Library</span>
                                    </Button>
                                }
                            />
                        </div>
                        {m.url && <p className="text-[10px] text-neutral-400 truncate max-w-xs">{m.url}</p>}
                     </div>
                     <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Urutan</label>
                        <input 
                            type="number" 
                            value={m.sortOrder ?? 0} 
                            onChange={(e) => updateMedia(idx, 'sortOrder', parseInt(e.target.value))}
                            className="p-2 border rounded text-sm w-full" 
                        />
                     </div>
                     <div className="md:col-span-2 flex items-center pt-0 md:pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name={`primaryMedia-${idx}`} 
                                checked={m.isPrimary ?? false} 
                                onChange={() => updateMedia(idx, 'isPrimary', true)}
                                className="w-4 h-4 accent-brand-green"
                            />
                            <span className="text-xs font-bold text-neutral-700 uppercase">Utama</span>
                        </label>
                     </div>
                 </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-200 self-end" 
                onClick={() => removeMedia(idx)}
              >
                <Trash2 size={14} className="mr-2"/> Hapus
              </Button>
            </div>
          ))}
          {medias.length === 0 && <p className="text-sm text-neutral-400 italic text-center py-4">Belum ada media.</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button type="button" size="sm" variant="outline" onClick={addMedia} className="w-full border-dashed"><Plus size={14} className="mr-1"/> Tambah Media (Upload Baru)</Button>
            <MediaSelector 
                allMedias={allMedias} 
                onSelect={addMediaFromLibrary} 
                trigger={<Button type="button" size="sm" variant="outline" className="w-full border-dashed"><Search size={14} className="mr-1"/> Pilih dari Library</Button>}
            />
        </div>
      </div>

      {/* --- Section 3: Variants --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-neutral-900">Varian Produk</h2>
        </div>

        <div className="space-y-4 mb-4">
            {variants.map((v, idx) => (
                 <div key={idx} className="flex flex-col gap-3 p-4 bg-neutral-50 rounded border border-neutral-100 relative">
                     <button type="button" onClick={() => removeVariant(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={18} />
                     </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Nama Varian</label>
                            <input value={v.name ?? ""} onChange={(e) => updateVariant(idx, 'name', e.target.value)} placeholder="Contoh: Merah, XL, Standard" className="p-2 border rounded text-sm"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">SKU</label>
                            <input value={v.sku ?? ""} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU-123" className="p-2 border rounded text-sm"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Penyesuaian Harga (+/-)</label>
                            <input type="number" value={v.priceAdjustment ?? 0} onChange={(e) => updateVariant(idx, 'priceAdjustment', parseFloat(e.target.value))} className="p-2 border rounded text-sm"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Stok</label>
                            <div className="flex gap-2">
                                <input type="number" value={v.stock ?? 0} onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value))} className="p-2 border rounded text-sm flex-1" disabled={v.isUnlimited} />
                                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                                    <input type="checkbox" checked={v.isUnlimited ?? false} onChange={(e) => updateVariant(idx, 'isUnlimited', e.target.checked)} className="w-4 h-4 accent-brand-green" />
                                    <span className="text-xs font-medium">Unlimited</span>
                                </label>
                            </div>
                        </div>
                     </div>
                 </div>
            ))}
             {variants.length === 0 && <p className="text-sm text-neutral-400 italic text-center py-4">Tidak ada varian (Menggunakan harga dasar).</p>}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addVariant} className="w-full border-dashed"><Plus size={14} className="mr-1"/> Tambah Varian</Button>
      </div>

      {/* --- Section 4: Specifications --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-neutral-900">Spesifikasi Teknis</h2>
        </div>
        <div className="space-y-3 mb-4">
            {specs.map((s, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 bg-neutral-50 rounded border border-neutral-100 relative group">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase md:hidden mb-1 block">Label</label>
                        <input value={s.key ?? ""} onChange={(e) => updateSpec(idx, 'key', e.target.value)} placeholder="Contoh: Berat" className="p-2 border rounded text-sm w-full bg-white" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase md:hidden mb-1 block">Nilai</label>
                        <input value={s.value ?? ""} onChange={(e) => updateSpec(idx, 'value', e.target.value)} placeholder="Contoh: 350g" className="p-2 border rounded text-sm w-full bg-white" />
                    </div>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-200 h-9 w-9 p-0 md:self-center self-end" 
                        onClick={() => removeSpec(idx)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
            {specs.length === 0 && <p className="text-sm text-neutral-400 italic text-center py-4">Belum ada spesifikasi.</p>}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addSpec} className="w-full border-dashed"><Plus size={14} className="mr-1"/> Tambah Spesifikasi</Button>
      </div>

      {/* --- Desktop Save Button (Standard) --- */}
      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/products">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>

      {/* --- Mobile Floating Save Bar --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/products" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
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