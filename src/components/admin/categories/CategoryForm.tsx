"use client";

import { useActionFeedback } from "@/components/admin/general/useActionFeedback";
import { useFormDirty } from "@/components/admin/general/useFormDirty";
import { useNewItemToast } from "@/components/admin/general/useNewItemToast";
import { MediaDetailsModal } from "@/components/admin/medias/MediaDetailsModal";
import { MediaSelector } from "@/components/admin/medias/MediaSelector";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { getDisplayUrl, handleUploadError } from "@/lib/utils";
import { ActionState, CategoryFormProps, DBCategory, DBMedia } from "@/types";
import {
  ChevronDown,
  ChevronUp,
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

export function CategoryForm({
  action,
  initialData,
  categories,
  allMedias,
}: CategoryFormProps) {
  const isNew = !initialData?.id;
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ActionState,
  );
  const { hasNew, clearNewParam } = useNewItemToast("Kategori berhasil dibuat");
  const formRef = useRef<HTMLFormElement>(null);

  // Details Modal State
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useActionFeedback(state, isPending, {
    newItem: { hasNew, clearNewParam },
  });

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
          const payload = xhr.responseText
            ? (JSON.parse(xhr.responseText) as
                | { ok: true; data: DBMedia }
                | { ok: false; error: { message: string } })
            : null;
          if (xhr.status >= 200 && xhr.status < 300) {
            if (payload && "ok" in payload && payload.ok) {
              resolve(payload.data);
              return;
            }
            if (payload && "error" in payload) {
              reject(new Error(payload.error.message));
              return;
            }
            reject(new Error("Upload gagal."));
            return;
          }
          if (payload && "error" in payload) {
            reject(new Error(payload.error.message));
            return;
          }
          reject(new Error(xhr.statusText || "Upload gagal."));
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
      if (error === "ABORTED") return;
      setIsUploading(false);
      xhrRef.current = null;
      const message = handleUploadError(error, "Gagal mengunggah gambar.", {
        suppressPattern: /Sesi berakhir/i,
      });
      toast.error(message);
    }
  };

  // Tree Logic for Parent Selection
  const [parentId, setParentId] = useState<number | null>(
    initialData?.parentId || null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isDirty } = useFormDirty(formRef, {
    resetDeps: [initialData],
    watchDeps: [parentId, imageUrl],
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildTreeNodes = (
    list: DBCategory[],
    pId: number | null = null,
  ): TreeNode[] => {
    return list
      .filter((c) => c.parentId === pId && c.id !== initialData?.id) // Prevent self-selection
      .map((c) => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(list, c.id),
        data: c,
      }));
  };

  const treeNodes = [
    { id: "root", label: "-- Tanpa Parent --", value: null },
    ...buildTreeNodes(categories),
  ];

  const selectedCategory = categories.find((c) => c.id === parentId);

  const renderLabel = (node: TreeNode) => {
    const isSelected = parentId === (node.id === "root" ? null : node.id);
    return (
      <button
        type="button"
        onClick={() => {
          setParentId(node.id === "root" ? null : (node.id as number));
          setIsDropdownOpen(false);
        }}
        className={`flex w-full items-center gap-2 rounded py-1.5 pr-2 pl-1.5 text-left text-sm transition-all hover:bg-neutral-100 ${isSelected ? "font-bold text-brand-green" : "text-neutral-700"}`}
      >
        <span>{node.label}</span>
      </button>
    );
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-8 pb-32"
    >
      {/* Hidden input for image & parentId */}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />

      <MediaDetailsModal
        isOpen={!!detailMedia}
        onClose={() => setDetailMedia(null)}
        media={detailMedia}
      />

      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">
            Informasi Kategori
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">
              Nama Kategori
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

          <div className="relative flex flex-col gap-2" ref={dropdownRef}>
            <label className="text-sm font-bold text-neutral-700">
              Parent Kategori (Opsional)
            </label>
            <div
              className="flex cursor-pointer items-center justify-between rounded border bg-white p-2.5 text-sm md:text-base"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-sm text-neutral-700 md:text-base">
                {parentId ? selectedCategory?.name : "-- Tanpa Parent --"}
              </span>
              {isDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded border bg-white p-2 shadow-lg">
                <CollapsibleTree
                  nodes={treeNodes}
                  renderLabel={renderLabel}
                  defaultExpanded={true}
                  rowClassName="gap-0"
                  toggleClassName="py-0.5 pl-0.5 pr-0"
                  indentSize={24}
                />
              </div>
            )}
          </div>
          {state?.error?.parentId && (
            <p className="text-sm text-red-500">{state.error.parentId[0]}</p>
          )}

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">
              Deskripsi (Opsional)
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description ?? ""}
              className="h-24 rounded border p-2.5 text-sm md:text-base"
            />
            {state?.error?.description && (
              <p className="text-sm text-red-500">
                {state.error.description[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">
              Gambar Kategori (Opsional)
            </label>
            <div className="flex flex-col items-start gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row">
              <div
                className={`group/preview relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-inner ${imageUrl ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (!imageUrl) return;
                  const fullMedia = allMedias.find((m) => m.url === imageUrl);
                  if (fullMedia) setDetailMedia(fullMedia);
                }}
              >
                {imageUrl ? (
                  <>
                    <AppImage
                      src={getDisplayUrl(
                        allMedias.find((m) => m.url === imageUrl) || {
                          url: imageUrl,
                          type: "image",
                        },
                      )}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl("");
                      }}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-500 p-1.5 text-white opacity-100 shadow-lg transition-opacity md:opacity-0 md:group-hover/preview:opacity-100"
                      title="Hapus Gambar"
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
                      No Image
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
                    Visual Representasi Kategori
                  </p>
                  <p className="text-xs text-neutral-400">
                    Gambar ini akan ditampilkan pada halaman produk dan navigasi
                    utama.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <MediaSelector
                    allMedias={allMedias}
                    onSelect={(m) => {
                      const selected = Array.isArray(m) ? m[0] : m;
                      if (!selected) return;
                      setImageUrl(selected.url);
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
            {state?.error?.imageUrl && (
              <p className="mt-1 text-sm font-bold text-red-500">
                {state.error.imageUrl[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      <div className="hidden justify-end gap-4 border-t border-neutral-200 pt-8 md:flex">
        <Link href="/admin/categories">
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
                ? "Buat Kategori Baru"
                : "Simpan"
              : isNew
                ? "Buat Kategori Baru"
                : "Simpan Kategori"}
        </Button>
      </div>

      {/* Mobile Floating Save Bar */}
      <div
        data-admin-sticky
        className="fixed right-0 bottom-0 left-0 z-40 flex justify-center border-t border-neutral-200 bg-white/80 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      >
        <div className="flex w-full items-center justify-between gap-4 px-4">
          <Link
            href="/admin/categories"
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
            {isPending ? "Simpan..." : isNew ? "Buat Kategori Baru" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
