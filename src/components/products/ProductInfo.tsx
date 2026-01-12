"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ProductInfoProps } from "@/types";

import { siteConfig } from "@/config/site";

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    (product.variants.length > 0 ? product.variants[0].id : null) ?? null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Calculate Display Price
  const basePrice = Number(product.basePrice);
  const adjustment = selectedVariant ? Number(selectedVariant.priceAdjustment) : 0;
  const finalPrice = basePrice + adjustment;

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(finalPrice);

  // WhatsApp Message
  const variantText = selectedVariant ? ` (Varian: ${selectedVariant.name})` : "";
  const whatsappMessage = `Halo Padelix, saya tertarik dengan produk ${product.name}${variantText}. Bisakah saya mendapatkan info lebih lanjut?`;
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
            {product.categoryName && (
                <span className="bg-brand-light text-brand-green px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-brand-green/20">
                    {product.parentCategoryName ? `${product.parentCategoryName} > ${product.categoryName}` : product.categoryName}
                </span>
            )}
            {product.brandName && (
                <span className="bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-neutral-200">
                    {product.brandName}
                </span>
            )}
        </div>

        <div className="flex flex-col gap-2">
            <h1 className="h1 text-neutral-900 leading-tight">{product.name}</h1>
            {product.showPrice ? (
            <div className="flex flex-col gap-1">
                <p className="text-3xl font-black text-brand-green tracking-tight">{formattedPrice}</p>
                {selectedVariant && Number(selectedVariant.priceAdjustment) !== 0 && (
                <p className="text-sm text-neutral-500 font-medium italic">
                    (Harga dasar: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(basePrice)} + {selectedVariant.name})
                </p>
                )}
            </div>
            ) : (
            <p className="text-3xl font-black text-brand-green tracking-tight">Hubungi Kami</p>
            )}
        </div>
      </div>

      {/* Variants Selector */}
      {product.variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
            Pilih Varian
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id ?? null)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedVariantId === variant.id
                    ? "bg-brand-green text-white border-brand-green shadow-md"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-green hover:text-brand-green"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="prose prose-lg text-neutral-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: product.description || "" }}
      />

      {/* Specs Table */}
      {product.specs.length > 0 && (
        <div className="bg-neutral-50 p-6 rounded-brand">
          <h3 className="subheading mb-4 text-neutral-900">Spesifikasi</h3>
          <div className="flex flex-col gap-3">
            {product.specs.map((spec, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b border-neutral-200 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-bold text-neutral-500 text-sm sm:text-base">{spec.key}</span>
                <span className="font-bold text-neutral-900 text-sm sm:text-base sm:text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link href={whatsappLink} target="_blank">
          <Button
            size="lg"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Pesan via WhatsApp
          </Button>
        </Link>
      </div>
    </div>
  );
}