"use client";

import { deleteMedia, uploadFile } from "@/actions/media";
import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import {
  ActionState,
  DBCategory,
  DBMedia,
  MediaUI,
  ProductFormProps,
  ProductSpecUI,
  ProductVariantUI,
} from "@/types";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  Library,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import { createMuxUpload, getMuxMediaByUploadId } from "@/actions/mux";
import { useActionFeedback } from "@/components/admin/general/useActionFeedback";
import { useFormDirty } from "@/components/admin/general/useFormDirty";
import { useNewItemToast } from "@/components/admin/general/useNewItemToast";
import { MediaDetailsModal } from "@/components/admin/medias/MediaDetailsModal";
import { MediaSelector } from "@/components/admin/medias/MediaSelector";
import { CollapsibleTree, TreeNode } from "@/components/ui/CollapsibleTree";
import { getDisplayUrl, handleUploadError, parseMetadata } from "@/lib/utils";
import { useRef } from "react";
import { toast } from "sonner";

export function ProductForm({
  action,
  initialData,
  categories,
  brands,
  allMedias,
  currentFolder,
}: ProductFormProps & { currentFolder?: string | null }) {
  const isNew = !initialData?.id;
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ActionState,
  );
  const { hasNew, clearNewParam } = useNewItemToast("Produk berhasil dibuat");
  const formRef = useRef<HTMLFormElement>(null);

  // Details Modal State
  const [detailMedia, setDetailMedia] = useState<DBMedia | null>(null);

  useActionFeedback(state, isPending, {
    newItem: { hasNew, clearNewParam },
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const isUploading = uploadingIndex !== null;
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mobileActionsIndex, setMobileActionsIndex] = useState<number | null>(
    null,
  );
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
  const [categoryId, setCategoryId] = useState<number | null>(
    initialData?.categoryId || null,
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [brandId, setBrandId] = useState<number | null>(
    initialData?.brandId || null,
  );
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBrandDropdownOpen(false);
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
      .filter((c) => c.parentId === pId)
      .map((c) => ({
        id: c.id,
        label: c.name,
        children: buildTreeNodes(list, c.id),
      }));
  };

  const treeNodes = [
    { id: "root", label: "-- Pilih Kategori --", value: null },
    ...buildTreeNodes(categories),
  ];

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedBrand = brands.find((b) => b.id === brandId);

  const renderCategoryLabel = (node: TreeNode) => {
    const isSelected = categoryId === (node.id === "root" ? null : node.id);
    return (
      <button
        type="button"
        onClick={() => {
          setCategoryId(node.id === "root" ? null : (node.id as number));
          setIsCategoryDropdownOpen(false);
        }}
        className={`flex w-full items-center gap-2 rounded py-1.5 pr-2 pl-1.5 text-left text-sm transition-all hover:bg-neutral-100 ${isSelected ? "font-bold text-brand-green" : "text-neutral-700"}`}
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
      const newSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(newSlug);
    }
  };

  // --- Local State for Nested Data ---

  // Medias
  const normalizeMedias = (items: MediaUI[]) => {
    const sorted = [...items].sort((a, b) => {
      const aOrder = a.sortOrder ?? 0;
      const bOrder = b.sortOrder ?? 0;
      return aOrder - bOrder;
    });
    return sorted.map((media, idx) => ({
      ...media,
      sortOrder: idx + 1,
    }));
  };

  const [medias, setMedias] = useState<MediaUI[]>(() =>
    normalizeMedias(initialData?.medias || []),
  );

  useEffect(() => {
    if (initialData?.medias) {
      setMedias(normalizeMedias(initialData.medias));
    }
  }, [initialData?.medias]);

  const addMediaFromFiles = async (files: FileList) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const baseIndex = medias.length;
    const placeholders: MediaUI[] = list.map((file, idx) => ({
      id: 0,
      url: "",
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
          ? "audio"
          : "image",
      isPrimary: baseIndex === 0 && idx === 0,
      sortOrder: baseIndex + idx + 1,
      altText: null,
    }));

    setMedias([...medias, ...placeholders]);

    for (let i = 0; i < list.length; i += 1) {
      // Sequential uploads to keep progress state sane
      await handleFileUpload(baseIndex + i, list[i]);
    }
  };

  const addMediaFromLibrary = (media: DBMedia | DBMedia[]) => {
    const list = Array.isArray(media) ? media : [media];
    const existingIds = new Set(medias.map((m) => m.id));
    const newItems: MediaUI[] = [];

    list.forEach((item) => {
      if (existingIds.has(item.id)) return;
      newItems.push({
        id: item.id,
        url: item.url,
        type: item.type as MediaUI["type"],
        metadata: parseMetadata(item.metadata),
        isPrimary: false,
        sortOrder: 0,
        altText: null,
      });
    });

    if (newItems.length === 0) {
      toast.error("Media ini sudah ada di daftar.");
      return;
    }

    const baseLength = medias.length;
    const merged = [
      ...medias,
      ...newItems.map((item, idx) => ({
        ...item,
        isPrimary: baseLength === 0 && idx === 0,
        sortOrder: baseLength + idx + 1,
      })),
    ];

    setMedias(merged);
  };

  const updateMedia = <K extends keyof MediaUI>(
    index: number,
    field: K,
    value: MediaUI[K],
  ) => {
    const newMedias = [...medias];
    newMedias[index][field] = value;

    if (field === "isPrimary" && value === true) {
      const [primary] = newMedias.splice(index, 1);
      newMedias.forEach((m) => {
        m.isPrimary = false;
      });
      primary.isPrimary = true;
      newMedias.unshift(primary);
      setMedias(normalizePrimaryOrder(newMedias));
      return;
    }
    setMedias(newMedias);
  };

  const normalizePrimaryOrder = (items: MediaUI[]) => {
    if (items.length === 0) return items;
    const primaryIndex = items.findIndex((m) => m.isPrimary);
    if (primaryIndex > 0) {
      const [primary] = items.splice(primaryIndex, 1);
      items.unshift(primary);
    }
    items.forEach((media, idx) => {
      media.sortOrder = idx + 1;
      media.isPrimary = idx === 0;
    });
    return items;
  };

  const reorderMedia = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const newMedias = [...medias];
    const [moved] = newMedias.splice(fromIndex, 1);
    newMedias.splice(toIndex, 0, moved);
    setMedias(normalizePrimaryOrder(newMedias));
  };

  const moveMediaToOrder = (fromIndex: number, targetOrder: number) => {
    const maxOrder = medias.length;
    const nextOrder = Math.min(Math.max(targetOrder, 1), maxOrder);
    reorderMedia(fromIndex, nextOrder - 1);
  };
  const removeMedia = (index: number) => {
    const filtered = medias.filter((_, i) => i !== index);
    setMedias(normalizePrimaryOrder(normalizeMedias(filtered)));
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;
    setUploadingIndex(index);
    setUploadProgress(0);

    try {
      if (file.type.startsWith("video/")) {
        // --- Mux Video Flow ---
        const uploadInfo = await createMuxUpload(
          file.name,
          currentFolder,
          file.size,
        );
        if ("error" in uploadInfo) {
          toast.error(uploadInfo.error);
          return;
        }

        // Link record ID for potential cleanup
        const initialRecord = await getMuxMediaByUploadId(uploadInfo.id);
        if (initialRecord) pendingMediaIdRef.current = initialRecord.id;

        // Perform the actual upload to Mux
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", uploadInfo.url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        const uploadPromise = new Promise<DBMedia>((resolve, reject) => {
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve(JSON.parse(xhr.response))
              : reject(new Error("Mux upload failed"));
          xhr.onerror = () => reject(new Error("Mux upload error"));
          xhr.onabort = () => reject("ABORTED");
        });

        xhr.send(file);
        await uploadPromise;
        xhrRef.current = null;
        pendingMediaIdRef.current = null;

        let mediaRecord = null;
        let attempts = 0;
        // Poll for the DB record to be updated with asset ID (by webhook)
        while (attempts < 10) {
          try {
            mediaRecord = await getMuxMediaByUploadId(uploadInfo.id);
            if (mediaRecord && mediaRecord.url) break; // Linked and has URL
            attempts++;
            await new Promise((r) => setTimeout(r, 2000));
          } catch {
            attempts++;
            await new Promise((r) => setTimeout(r, 2000));
          }
        }

        if (mediaRecord) {
          setMedias((prev) => {
            if (!prev[index]) return prev;
            const next = [...prev];
            next[index] = {
              ...next[index],
              url: mediaRecord.url,
              id: mediaRecord.id,
              type: "video",
              metadata: parseMetadata(mediaRecord.metadata),
            };
            return next;
          });
        }
      } else {
        // --- Local Image/Doc Flow ---
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData);
        const url = result.url;
        const id = result.id;
        if (url !== undefined && id !== undefined) {
          setMedias((prev) => {
            if (!prev[index]) return prev;
            const next = [...prev];
            next[index] = {
              ...next[index],
              url,
              id,
              metadata: null,
              type: file.type.startsWith("image/") ? "image" : "document",
            };
            return next;
          });
        } else if (result.error) {
          toast.error(result.error);
        }
      }
    } catch (error) {
      if (error === "ABORTED") return;
      const message = handleUploadError(
        error,
        "Gagal mengunggah file. Silakan coba lagi.",
        { suppressPattern: /Sesi berakhir/i },
      );
      toast.error(message);
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  };

  // Variants
  const [variants, setVariants] = useState<ProductVariantUI[]>(
    initialData?.variants || [],
  );
  const addVariant = () => {
    setVariants([
      ...variants,
      { name: "", sku: "", priceAdjustment: 0, stock: 0, isUnlimited: false },
    ]);
  };
  const updateVariant = (
    index: number,
    field: keyof ProductVariantUI,
    value: string | boolean | number | null,
  ) => {
    const newVariants = [...variants];
    if (field === "name") newVariants[index].name = value as string;
    if (field === "sku") newVariants[index].sku = value as string | null;
    if (field === "priceAdjustment")
      newVariants[index].priceAdjustment = value as string | number;
    if (field === "stock") newVariants[index].stock = value as string | number;
    if (field === "isUnlimited")
      newVariants[index].isUnlimited = value as boolean;
    setVariants(newVariants);
  };
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Specs
  const [specs, setSpecs] = useState<ProductSpecUI[]>(initialData?.specs || []);

  const { isDirty } = useFormDirty(formRef, {
    resetDeps: [initialData],
    watchDeps: [categoryId, brandId, medias, variants, specs],
  });
  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };
  const updateSpec = (
    index: number,
    field: keyof ProductSpecUI,
    value: string,
  ) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Filter out empty data before submission
  const cleanMedias = medias.filter((m) => m.id !== 0);
  const cleanVariants = variants.filter((v) => v.name && v.name.trim() !== "");
  const cleanSpecs = specs.filter(
    (s) => s.key && s.key.trim() !== "" && s.value && s.value.trim() !== "",
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-8 pb-32"
    >
      {/* Hidden inputs for nested data */}
      <input type="hidden" name="medias" value={JSON.stringify(cleanMedias)} />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(cleanVariants)}
      />
      <input type="hidden" name="specs" value={JSON.stringify(cleanSpecs)} />

      <MediaDetailsModal
        isOpen={!!detailMedia}
        onClose={() => setDetailMedia(null)}
        media={detailMedia}
      />

      {/* --- Section 1: General Info --- */}
      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">Informasi Umum</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">
              Nama Produk
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
              Deskripsi (Mendukung HTML)
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description ?? ""}
              className="h-32 rounded border p-2.5 font-mono text-sm md:text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-700">
              Harga Dasar (IDR)
            </label>
            <input
              type="number"
              name="basePrice"
              defaultValue={initialData?.basePrice}
              className="rounded border p-2.5 text-sm md:text-base"
              required
              min="0"
            />
            {state?.error?.basePrice && (
              <p className="text-sm text-red-500">{state.error.basePrice[0]}</p>
            )}
          </div>

          <div
            className="relative flex flex-col gap-2"
            ref={categoryDropdownRef}
          >
            <label className="text-sm font-bold text-neutral-700">
              Kategori
            </label>
            <input type="hidden" name="categoryId" value={categoryId ?? ""} />
            <div
              className="flex cursor-pointer items-center justify-between rounded border bg-white p-2.5 text-sm md:text-base"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="text-sm text-neutral-700 md:text-base">
                {categoryId ? selectedCategory?.name : "-- Pilih Kategori --"}
              </span>
              {isCategoryDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded border bg-white p-2 shadow-lg">
                <CollapsibleTree
                  nodes={treeNodes}
                  renderLabel={renderCategoryLabel}
                  defaultExpanded={true}
                  rowClassName="gap-0"
                  toggleClassName="py-0.5 pl-0.5 pr-0"
                  indentSize={24}
                />
              </div>
            )}
          </div>

          <div className="relative flex flex-col gap-2" ref={brandDropdownRef}>
            <label className="text-sm font-bold text-neutral-700">Brand</label>
            <input type="hidden" name="brandId" value={brandId ?? ""} />
            <div
              className="flex cursor-pointer items-center justify-between rounded border bg-white p-2.5 text-sm md:text-base"
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            >
              <span className="text-sm text-neutral-700 md:text-base">
                {brandId ? selectedBrand?.name : "-- Pilih Brand --"}
              </span>
              {isBrandDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
            {isBrandDropdownOpen && (
              <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded border bg-white p-2 shadow-lg">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBrandId(null);
                      setIsBrandDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-all hover:bg-neutral-100 ${!brandId ? "font-bold text-brand-green" : "text-neutral-700"}`}
                  >
                    -- Pilih Brand --
                  </button>
                  {brands.map((b) => {
                    const isSelected = brandId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setBrandId(b.id);
                          setIsBrandDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-all hover:bg-neutral-100 ${isSelected ? "font-bold text-brand-green" : "text-neutral-700"}`}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-4 rounded-lg bg-neutral-50 p-4 md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={initialData?.isActive}
                className="h-4 w-4 accent-brand-green"
              />
              <span className="text-sm font-medium text-neutral-700">
                Aktif (Tampil di web)
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                value="true"
                defaultChecked={initialData?.isFeatured}
                className="h-4 w-4 accent-brand-green"
              />
              <span className="text-sm font-medium text-neutral-700">
                Tampil di Depan
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="showPrice"
                value="true"
                defaultChecked={initialData?.showPrice ?? true}
                className="h-4 w-4 accent-brand-green"
              />
              <span className="text-sm font-medium text-neutral-700">
                Tampilkan Harga
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* --- Section 2: Medias --- */}
      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Media Produk</h2>
            <p className="text-xs text-neutral-500">
              Thumbnail selalu berada di urutan pertama.
            </p>
          </div>
          <MediaSelector
            allMedias={allMedias}
            onSelect={addMediaFromLibrary}
            multiple
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Search size={14} /> Library
              </Button>
            }
          />
        </div>

        <div className="mb-4 space-y-4">
          {medias.map((m, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col gap-4 rounded border border-neutral-100 bg-neutral-50 p-4 ${dragIndex === idx ? "ring-2 ring-brand-green/40" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverIndex(idx);
              }}
              onDragLeave={() => {
                setDragOverIndex(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const from =
                  dragIndex ?? Number(event.dataTransfer.getData("text/plain"));
                if (Number.isNaN(from)) return;
                reorderMedia(from, idx);
                setDragIndex(null);
                setDragOverIndex(null);
              }}
            >
              {dragOverIndex === idx &&
                dragIndex !== null &&
                dragIndex !== idx && (
                  <div className="absolute -top-1 right-4 left-4 h-0.5 rounded-full bg-brand-green" />
                )}
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-bold text-neutral-500">
                      {idx + 1}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={medias.length}
                      value={m.sortOrder ?? idx + 1}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isNaN(next)) return;
                        moveMediaToOrder(idx, next);
                      }}
                      className="w-14 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-600"
                      aria-label="Urutan media"
                    />
                    <button
                      type="button"
                      className="inline-flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                      draggable
                      onDragStart={(event) => {
                        setDragIndex(idx);
                        event.dataTransfer.setData("text/plain", String(idx));
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      title="Geser urutan"
                    >
                      <GripVertical size={18} />
                    </button>
                  </div>
                </div>
                {/* Preview */}
                <div
                  className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white ${m.id !== 0 ? "group/preview cursor-pointer" : ""}`}
                  onClick={() => {
                    if (m.id === 0) return;
                    const fullMedia = allMedias.find((am) => am.id === m.id);
                    if (fullMedia) setDetailMedia(fullMedia);
                  }}
                >
                  {m.url ? (
                    <>
                      <AppImage
                        src={getDisplayUrl(m)}
                        alt="Preview"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      {m.type !== "image" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Play
                            size={20}
                            className="fill-white text-white opacity-80"
                          />
                        </div>
                      )}
                      {m.id !== 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/preview:opacity-100">
                          <Search size={20} className="text-white" />
                        </div>
                      )}
                    </>
                  ) : (
                    <ImageIcon className="text-neutral-300" size={24} />
                  )}
                  {uploadingIndex === idx && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {uploadProgress > 0 && (
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
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

                {/* Inputs */}
                <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-12">
                  <div className="flex flex-col gap-2 md:col-span-8">
                    <label className="text-xs font-bold text-neutral-500 uppercase">
                      Aksi Media
                    </label>
                    <div className="hidden flex-wrap gap-2 md:flex">
                      <div className="relative">
                        <input
                          type="file"
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                          accept="*/*"
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              handleFileUpload(idx, e.target.files[0]);
                            e.target.value = "";
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-white"
                          disabled={uploadingIndex === idx}
                        >
                          <Upload size={14} />
                          <span>
                            {uploadingIndex === idx
                              ? "Mengunggah..."
                              : "Upload Baru"}
                          </span>
                        </Button>
                      </div>
                      <MediaSelector
                        allMedias={allMedias}
                        onSelect={(media) => {
                          const selected = Array.isArray(media)
                            ? media[0]
                            : media;
                          if (!selected) return;
                          const newMedias = [...medias];
                          newMedias[idx].id = selected.id;
                          newMedias[idx].url = selected.url;
                          newMedias[idx].type =
                            selected.type as MediaUI["type"];
                          setMedias(newMedias);
                        }}
                        trigger={
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-white"
                          >
                            <Library size={14} />
                            <span>Ganti dari Library</span>
                          </Button>
                        }
                      />
                    </div>
                    <div className="md:hidden">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700"
                        onClick={() => {
                          setMobileActionsIndex(
                            mobileActionsIndex === idx ? null : idx,
                          );
                        }}
                      >
                        Edit Media
                      </button>
                      {mobileActionsIndex === idx && (
                        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
                          <div className="relative">
                            <input
                              type="file"
                              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                              accept="*/*"
                              onChange={(e) => {
                                if (e.target.files?.[0])
                                  handleFileUpload(idx, e.target.files[0]);
                                e.target.value = "";
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="w-full gap-2 bg-white"
                              disabled={uploadingIndex === idx}
                            >
                              <Upload size={14} />
                              <span>
                                {uploadingIndex === idx
                                  ? "Mengunggah..."
                                  : "Upload Baru"}
                              </span>
                            </Button>
                          </div>
                          <MediaSelector
                            allMedias={allMedias}
                            onSelect={(media) => {
                              const selected = Array.isArray(media)
                                ? media[0]
                                : media;
                              if (!selected) return;
                              const newMedias = [...medias];
                              newMedias[idx].id = selected.id;
                              newMedias[idx].url = selected.url;
                              newMedias[idx].type =
                                selected.type as MediaUI["type"];
                              setMedias(newMedias);
                              setMobileActionsIndex(null);
                            }}
                            trigger={
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full gap-2 bg-white"
                              >
                                <Library size={14} />
                                <span>Pilih dari Library</span>
                              </Button>
                            }
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full border-red-200 text-red-600"
                            onClick={() => {
                              removeMedia(idx);
                              setMobileActionsIndex(null);
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>
                    {m.url && (
                      <p className="max-w-xs truncate text-[10px] text-neutral-400">
                        {m.url}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center pt-0 md:col-span-2 md:pt-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`primaryMedia-${idx}`}
                        checked={m.isPrimary ?? false}
                        onChange={() => updateMedia(idx, "isPrimary", true)}
                        className="h-4 w-4 accent-brand-green"
                      />
                      <span className="text-xs font-bold text-neutral-700 uppercase">
                        Thumbnail
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden self-end border-red-200 text-red-500 md:inline-flex"
                onClick={() => removeMedia(idx)}
              >
                <Trash2 size={14} className="mr-2" /> Hapus
              </Button>
            </div>
          ))}
          {medias.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400 italic">
              Belum ada media.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              accept="*/*"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) addMediaFromFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full border-dashed"
            >
              <Plus size={14} className="mr-1" /> Tambah Media (Upload Baru)
            </Button>
          </div>
          <MediaSelector
            allMedias={allMedias}
            onSelect={addMediaFromLibrary}
            multiple
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-dashed"
              >
                <Search size={14} className="mr-1" /> Pilih dari Library
              </Button>
            }
          />
        </div>
      </div>

      {/* --- Section 3: Variants --- */}
      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">Varian Produk</h2>
        </div>

        <div className="mb-4 space-y-4">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="relative flex flex-col gap-3 rounded border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    Nama Varian
                  </label>
                  <input
                    value={v.name ?? ""}
                    onChange={(e) => updateVariant(idx, "name", e.target.value)}
                    placeholder="Contoh: Merah, XL, Standard"
                    className="rounded border p-2.5 text-sm md:text-base"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    SKU
                  </label>
                  <input
                    value={v.sku ?? ""}
                    onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                    placeholder="SKU-123"
                    className="rounded border p-2.5 text-sm md:text-base"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    Penyesuaian Harga (+/-)
                  </label>
                  <input
                    type="number"
                    value={v.priceAdjustment ?? 0}
                    onChange={(e) =>
                      updateVariant(
                        idx,
                        "priceAdjustment",
                        parseFloat(e.target.value),
                      )
                    }
                    className="rounded border p-2.5 text-sm md:text-base"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    Stok
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={v.stock ?? 0}
                      onChange={(e) =>
                        updateVariant(idx, "stock", parseInt(e.target.value))
                      }
                      className="flex-1 rounded border p-2.5 text-sm md:text-base"
                      disabled={v.isUnlimited}
                    />
                    <label className="flex cursor-pointer items-center gap-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={v.isUnlimited ?? false}
                        onChange={(e) =>
                          updateVariant(idx, "isUnlimited", e.target.checked)
                        }
                        className="h-4 w-4 accent-brand-green"
                      />
                      <span className="text-xs font-medium">Unlimited</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400 italic">
              Tidak ada varian (Menggunakan harga dasar).
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addVariant}
          className="w-full border-dashed"
        >
          <Plus size={14} className="mr-1" /> Tambah Varian
        </Button>
      </div>

      {/* --- Section 4: Specifications --- */}
      <div className="rounded-brand border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold text-neutral-900">
            Spesifikasi Teknis
          </h2>
        </div>
        <div className="mb-4 space-y-3">
          {specs.map((s, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-start gap-3 rounded border border-neutral-100 bg-neutral-50 p-3 md:flex-row md:items-center"
            >
              <div className="w-full flex-1">
                <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase md:hidden">
                  Label
                </label>
                <input
                  value={s.key ?? ""}
                  onChange={(e) => updateSpec(idx, "key", e.target.value)}
                  placeholder="Contoh: Berat"
                  className="w-full rounded border bg-white p-2.5 text-sm md:text-base"
                />
              </div>
              <div className="w-full flex-1">
                <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase md:hidden">
                  Nilai
                </label>
                <input
                  value={s.value ?? ""}
                  onChange={(e) => updateSpec(idx, "value", e.target.value)}
                  placeholder="Contoh: 350g"
                  className="w-full rounded border bg-white p-2.5 text-sm md:text-base"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-9 self-end border-red-200 p-0 text-red-500 md:self-center"
                onClick={() => removeSpec(idx)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {specs.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-400 italic">
              Belum ada spesifikasi.
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addSpec}
          className="w-full border-dashed"
        >
          <Plus size={14} className="mr-1" /> Tambah Spesifikasi
        </Button>
      </div>

      {/* --- Desktop Save Button (Standard) --- */}
      <div className="hidden justify-end gap-4 border-t border-neutral-200 pt-8 md:flex">
        <Link href="/admin/products">
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
                ? "Buat Produk Baru"
                : "Simpan"
              : isNew
                ? "Buat Produk Baru"
                : "Simpan Produk"}
        </Button>
      </div>

      {/* --- Mobile Floating Save Bar --- */}
      <div
        data-admin-sticky
        className="fixed right-0 bottom-0 left-0 z-40 flex justify-center border-t border-neutral-200 bg-white/80 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      >
        <div className="flex w-full max-w-4xl items-center justify-between gap-4 px-4">
          <Link
            href="/admin/products"
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
            {isPending ? "Simpan..." : isNew ? "Buat Produk Baru" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}
