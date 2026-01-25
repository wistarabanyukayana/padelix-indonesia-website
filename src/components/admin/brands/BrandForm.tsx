"use client";

import { useFormDirty } from "@/components/admin/general/useFormDirty";
import { useNewItemToast } from "@/components/admin/general/useNewItemToast";
import { MediaDetailsModal } from "@/components/admin/medias/MediaDetailsModal";
import { MediaSelector } from "@/components/admin/medias/MediaSelector";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { getDisplayUrl } from "@/lib/utils";
import { ActionState, BrandFormProps, DBMedia } from "@/types";
import {
  Image as ImageIcon,
  Library,
  Save,
  Search,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function BrandForm({ action, initialData, allMedias }: BrandFormProps) {
  const isNew = !initialData?.id;
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ActionState,
  );
  const { hasNew, clearNewParam } = useNewItemToast("Brand berhasil dibuat");
  const lastToastRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Slug Logic
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!initialData?.slug) {
      const newSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(newSlug);
    }
  };

  // Logo Logic
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const { isDirty } = useFormDirty(formRef, {
    resetDeps: [initialData],
    watchDeps: [logoUrl],
  });
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
        setLogoUrl(result.url);
      }
    } catch (error) {
      if (error === "ABORTED") return;
      setIsUploading(false);
      xhrRef.current = null;
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah logo.");
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-8 pb-32"
    >
      <input type="hidden" name="logoUrl" value={logoUrl || ""} />

      <MediaDetailsModal
        isOpen={!!detailMedia}
        onClose={() => setDetailMedia(null)}
        media={detailMedia}
      />

      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">
            Informasi Brand
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">
              Nama Brand
            </label>
            <input
              name="name"
              value={name}
              onChange={handleNameChange}
              className="rounded border p-2.5 text-sm md:text-base"
              required
            />
            {state?.error?.name && (
              <p className="text-sm text-red-500">{state.error.name[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">
              Slug (Otomatis)
            </label>
            <input
              name="slug"
              value={slug}
              readOnly
              className="cursor-not-allowed rounded border bg-neutral-100 p-2.5 text-sm text-neutral-500 md:text-base"
            />
            {state?.error?.slug && (
              <p className="text-sm text-red-500">{state.error.slug[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">
              Website
            </label>
            <input
              name="website"
              defaultValue={initialData?.website ?? ""}
              className="rounded border p-2.5 text-sm md:text-base"
              placeholder="https://example.com"
            />
            {state?.error?.website && (
              <p className="text-sm text-red-500">{state.error.website[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">
              Logo Brand
            </label>
            <div className="flex flex-col items-start gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row">
              <div
                className={`group/preview relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-inner ${logoUrl ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (!logoUrl) return;
                  const fullMedia = allMedias.find((m) => m.url === logoUrl);
                  if (fullMedia) setDetailMedia(fullMedia);
                }}
              >
                {logoUrl ? (
                  <>
                    <AppImage
                      src={getDisplayUrl(
                        allMedias.find((m) => m.url === logoUrl) || {
                          url: logoUrl,
                          type: "image",
                        },
                      )}
                      alt="Preview"
                      fill
                      className="object-contain p-3"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoUrl("");
                      }}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1.5 text-white opacity-100 shadow-lg transition-opacity md:opacity-0 md:group-hover/preview:opacity-100"
                      title="Hapus Logo"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/preview:opacity-100">
                      <Search size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-300">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      No Logo
                    </span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-[10px] font-bold text-white uppercase">
                      Uploading...
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="mt-1 rounded bg-red-600 px-2 py-0.5 text-[8px] font-black text-white uppercase transition-colors hover:bg-red-700"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
              <div className="flex h-full w-full flex-1 flex-col justify-center gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-neutral-600">
                    Pilih Identitas Brand
                  </p>
                  <p className="text-xs text-neutral-400">
                    Gunakan logo dengan latar belakang transparan (SVG/PNG)
                    untuk hasil terbaik.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MediaSelector
                    allMedias={allMedias}
                    onSelect={(m) => {
                      const selected = Array.isArray(m) ? m[0] : m;
                      if (!selected) return;
                      setLogoUrl(selected.url);
                    }}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 border-neutral-200 bg-white text-neutral-700 hover:border-brand-green hover:text-brand-green"
                      >
                        <Library size={18} />
                        <span>Pilih dari Library</span>
                      </Button>
                    }
                  />
                  <div className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          handleFileUpload(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                      className="gap-2 border-neutral-200 bg-white text-neutral-700 hover:border-brand-green hover:text-brand-green"
                    >
                      <Upload size={18} />
                      <span>
                        {isUploading ? "Mengunggah..." : "Upload Baru"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden justify-end gap-4 border-t border-neutral-200 pt-8 md:flex">
        <Link href="/admin/brands">
          <Button variant="outline" size="lg">
            {isDirty ? "Batal" : "Kembali"}
          </Button>
        </Link>
        <Button
          variant="dark"
          size="lg"
          type="submit"
          disabled={isPending || !isDirty || isUploading}
        >
          {isPending
            ? "Menyimpan..."
            : isDirty
              ? isNew
                ? "Buat Brand Baru"
                : "Simpan"
              : isNew
                ? "Buat Brand Baru"
                : "Simpan Brand"}
        </Button>
      </div>

      <div
        data-admin-sticky
        className="fixed right-0 bottom-0 left-0 z-40 flex justify-center border-t border-neutral-200 bg-white/80 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      >
        <div className="flex w-full items-center justify-between gap-4 px-4">
          <Link
            href="/admin/brands"
            className="flex items-center gap-1 text-sm font-bold text-neutral-500 transition-colors hover:text-neutral-700"
          >
            <X size={16} /> {isDirty ? "Batal" : "Kembali"}
          </Link>
          <Button
            variant="dark"
            size="md"
            type="submit"
            disabled={isPending || !isDirty || isUploading}
            className="shadow-lg shadow-brand-green/20"
          >
            <Save size={16} className="mr-2" />
            {isPending ? "Simpan..." : isNew ? "Buat Brand Baru" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
