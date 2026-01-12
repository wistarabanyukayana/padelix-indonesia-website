"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Upload, Image as ImageIcon, X, Library, Search } from "lucide-react";
import { AppImage } from "@/components/general/AppImage";
import Link from "next/link";
import { ActionState, BrandFormProps, DBMedia } from "@/types";
import { MediaSelector } from "./MediaSelector";
import { MediaDetailsModal } from "./MediaDetailsModal";
import { toast } from "sonner";
import { getDisplayUrl } from "@/lib/utils";

export function BrandForm({ action, initialData, allMedias }: BrandFormProps) {
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

  // Logo Logic
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
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
                }
                else {
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
            setLogoUrl(result.url);
        }
    } catch (error) {
        if (error === 'ABORTED') return;
        setIsUploading(false);
        xhrRef.current = null;
        console.error("Upload error:", error);
        toast.error("Gagal mengunggah logo.");
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-8 w-full pb-32">
      <input type="hidden" name="logoUrl" value={logoUrl || ""} />

      <MediaDetailsModal 
        isOpen={!!detailMedia} 
        onClose={() => setDetailMedia(null)} 
        media={detailMedia}
      />

      <div className="bg-white p-6 rounded-brand shadow-sm border border-neutral-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-neutral-900">Informasi Brand</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">Nama Brand</label>
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
            <label className="text-sm font-bold text-neutral-700">Website</label>
            <input name="website" defaultValue={initialData?.website ?? ""} className="p-2 border rounded" placeholder="https://example.com" />
            {state?.error?.website && <p className="text-red-500 text-sm">{state.error.website[0]}</p>}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Logo Brand</label>
            <div className="flex flex-col sm:flex-row gap-6 items-start p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                <div 
                    className={`relative w-32 h-32 flex-shrink-0 rounded-lg bg-white border border-neutral-200 shadow-inner overflow-hidden flex items-center justify-center group/preview ${logoUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                        if (!logoUrl) return;
                        const fullMedia = allMedias.find(m => m.url === logoUrl);
                        if (fullMedia) setDetailMedia(fullMedia);
                    }}
                >
                    {logoUrl ? (
                        <>
                            <AppImage 
                                src={getDisplayUrl(allMedias.find(m => m.url === logoUrl) || { url: logoUrl, type: 'image' })} 
                                alt="Preview" 
                                fill 
                                className="object-contain p-3" 
                            />
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setLogoUrl(""); }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover/preview:opacity-100 transition-opacity z-10"
                                title="Hapus Logo"
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
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Logo</span>
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
                        <p className="text-sm font-bold text-neutral-600">Pilih Identitas Brand</p>
                        <p className="text-xs text-neutral-400">Gunakan logo dengan latar belakang transparan (SVG/PNG) untuk hasil terbaik.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <MediaSelector 
                            allMedias={allMedias} 
                            onSelect={(m) => setLogoUrl(m.url)}
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
          </div>
      </div>
      </div>

      <div className="hidden md:flex justify-end gap-4 border-t border-neutral-200 pt-8">
        <Link href="/admin/brands">
          <Button variant="outline" size="lg">Batal</Button>
        </Link>
        <Button variant="dark" size="lg" type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Brand"}
        </Button>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-neutral-200 p-4 z-40 flex justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="w-full flex items-center justify-between gap-4 px-4">
            <Link href="/admin/brands" className="text-sm font-bold text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors">
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