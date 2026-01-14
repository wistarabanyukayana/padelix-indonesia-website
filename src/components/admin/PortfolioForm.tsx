"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon, Upload, Save, X, Search, Library, Play } from "lucide-react";
import { uploadFile, deleteMedia } from "@/actions/media";
import { AppImage } from "@/components/general/AppImage";
import Link from "next/link";
import { ActionState, MediaUI, PortfolioFormProps, DBMedia } from "@/types";

import { createMuxUpload, getMuxMediaByUploadId } from "@/actions/mux";
import { MediaSelector } from "./MediaSelector";
import { MediaDetailsModal } from "./MediaDetailsModal";
import { useRef } from "react";
import { toast } from "sonner";
import { getDisplayUrl, parseMetadata } from "@/lib/utils";
import { useNewItemToast } from "./useNewItemToast";

export function PortfolioForm({ action, initialData, allMedias, currentFolder }: PortfolioFormProps) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  const { hasNew, clearNewParam } = useNewItemToast("Portofolio berhasil dibuat");
  const lastToastRef = useRef<string | null>(null);
  
  // Details Modal State
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);

  useEffect(() => {
    if (isPending) lastToastRef.current = null;
  }, [isPending]);

  useEffect(() => {
    if (!state?.message) return;
    const toastKey = `${state.success}-${state.message}`;
    if (lastToastRef.current === toastKey) return;
    lastToastRef.current = toastKey;
    if (state.success) {
      toast.success(state.message);
      if (hasNew) clearNewParam();
    } else {
      toast.error(state.message);
    }
  }, [clearNewParam, hasNew, state]);

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
  
  // Slug Logic
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.slug) {
        const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(newSlug);
    }
  };

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
            const uploadInfo = await createMuxUpload(file.name, currentFolder, file.size);

            // Link record ID for potential cleanup
            const initialRecord = await getMuxMediaByUploadId(uploadInfo.id);
            if (initialRecord) pendingMediaIdRef.current = initialRecord.id;

            const xhr = new XMLHttpRequest();
            xhrRef.current = xhr;
            xhr.open('PUT', uploadInfo.url);
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            };

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error('Mux upload failed'));
                xhr.onerror = () => reject(new Error('Mux upload error'));
                xhr.onabort = () => reject('ABORTED');
            });

            xhr.send(file);
            await uploadPromise;
            xhrRef.current = null;
            pendingMediaIdRef.current = null;

            let finalMediaRecord: DBMedia | null = null;
            let attempts = 0;
            while(attempts < 10) {
                try {
                    finalMediaRecord = await getMuxMediaByUploadId(uploadInfo.id);
                    if (finalMediaRecord && finalMediaRecord.url) break;
                    attempts++;
                    await new Promise(r => setTimeout(r, 2000));
                } catch {
                    attempts++;
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            if (finalMediaRecord) {
                const newMedias = [...medias];
                newMedias[index].url = finalMediaRecord.url;
                newMedias[index].id = finalMediaRecord.id;
                newMedias[index].type = "video";
                newMedias[index].metadata = parseMetadata(finalMediaRecord.metadata);
                setMedias(newMedias);
            }
        } else {
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
        toast.error("Gagal mengunggah file.");
    } finally {
        setUploadingIndex(null);
        setUploadProgress(0);
    }
  };

  const cleanMedias = medias.filter(m => m.id !== 0);

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      
      {/* Hidden inputs for nested data */}
      <input type="hidden" name="medias" value={JSON.stringify(cleanMedias)} />

      <MediaDetailsModal 
        isOpen={!!detailMedia} 
        onClose={() => setDetailMedia(null)} 
        media={detailMedia}
      />

      {/* --- Section 1: General Info --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-2">Informasi Portofolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Judul Proyek</label>
            <input 
                name="title" 
                value={title} 
                onChange={handleTitleChange} 
                className="p-2.5 border rounded text-sm md:text-base" 
                required 
            />
            {state?.error?.title && <p className="text-red-500 text-sm">{state.error.title[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Slug (Otomatis)</label>
            <input 
                name="slug" 
                value={slug} 
                readOnly 
                className="p-2.5 border rounded bg-neutral-100 text-neutral-500 cursor-not-allowed text-sm md:text-base" 
            />
            {state?.error?.slug && <p className="text-red-500 text-sm">{state.error.slug[0]}</p>}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Deskripsi</label>
            <textarea name="description" defaultValue={initialData?.description ?? ""} className="p-2.5 border rounded h-32 font-mono text-sm md:text-base" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Lokasi</label>
            <input name="location" defaultValue={initialData?.location ?? ""} className="p-2.5 border rounded text-sm md:text-base" placeholder="Contoh: Jakarta Selatan" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Tanggal Selesai</label>
            <input type="date" name="completionDate" defaultValue={initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : ''} className="p-2.5 border rounded text-sm md:text-base" />
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 mt-2 md:col-span-2 p-4 bg-neutral-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" value="true" defaultChecked={initialData?.isActive} className="w-4 h-4 accent-brand-green" />
              <span className="text-sm font-medium text-neutral-700">Aktif (Tampil di web)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" value="true" defaultChecked={initialData?.isFeatured} className="w-4 h-4 accent-brand-green" />
              <span className="text-sm font-medium text-neutral-700">Tandai Unggulan</span>
            </label>
          </div>
        </div>
      </div>

      {/* --- Section 2: Medias --- */}
      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">Media Proyek</h2>
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
                            className="p-2.5 border rounded text-sm md:text-base w-full" 
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

      {/* --- Desktop Save Button (Standard) --- */}
      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/portfolios">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Portofolio"}
        </Button>
      </div>

      {/* --- Mobile Floating Save Bar --- */}
      <div data-admin-sticky className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/portfolios" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
                <X size={16} /> Batal
            </Link>
            <Button variant="dark" size="md" type="submit" disabled={isPending} className="shadow-lg shadow-brand-green/20">
                <Save size={16} className="mr-2" />
                {isPending ? "Simpan..." : "Simpan"}
            </Button>
        </div>
      </div>
    </form>
  );
}
