"use client";

import { Button } from "@/components/ui/Button";
import { ProductInfoProps } from "@/types";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import Link from "next/link";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { trackMetaEvent } from "@/lib/metaPixel";

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    (product.variants.length > 0 ? product.variants[0].id : null) ?? null,
  );

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  // Calculate Display Price
  const basePrice = Number(product.basePrice);
  const adjustment = selectedVariant
    ? Number(selectedVariant.priceAdjustment)
    : 0;
  const finalPrice = basePrice + adjustment;

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(finalPrice);

  // WhatsApp Message
  const variantText = selectedVariant
    ? ` (Varian: ${selectedVariant.name})`
    : "";
  const whatsappMessage = `Halo Padelix, saya tertarik dengan produk ${product.name}${variantText}. Bisakah saya mendapatkan info lebih lanjut?`;
  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: product.name,
      content_type: "product",
      content_ids: [product.id],
    });
  }, [product.id, product.name]);

  // Hide the global WhatsApp FAB while this page is visible (it overlaps the
  // page's own CTAs). Done via effect rather than CSS :has(): Next keeps
  // visited pages hidden in the DOM (Activity), so the sticky bar node would
  // keep a :has() selector matched after navigating away. Activity unmounts
  // effects when hiding the page, so the cleanup runs at the right time.
  useEffect(() => {
    document.body.classList.add("has-product-sticky-bar");
    return () => document.body.classList.remove("has-product-sticky-bar");
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-24 lg:pb-0">
      <div className="flex flex-col gap-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {product.categoryName && (
            <span className="rounded-full border border-brand-green/20 bg-brand-light px-3 py-1 text-xs font-black tracking-widest text-brand-green uppercase">
              {product.parentCategoryName
                ? `${product.parentCategoryName} > ${product.categoryName}`
                : product.categoryName}
            </span>
          )}
          {product.brandName && (
            <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-black tracking-widest text-neutral-500 uppercase">
              {product.brandName}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="h1 leading-tight text-neutral-900">{product.name}</h1>
          {product.showPrice ? (
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-black tracking-tight text-brand-green">
                {formattedPrice}
              </p>
              {selectedVariant &&
                Number(selectedVariant.priceAdjustment) !== 0 && (
                  <p className="text-sm font-medium text-neutral-500 italic">
                    (Harga dasar:{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(basePrice)}{" "}
                    + {selectedVariant.name})
                  </p>
                )}
            </div>
          ) : (
            <p className="text-3xl font-black tracking-tight text-brand-green">
              Hubungi Kami
            </p>
          )}
        </div>
      </div>

      {/* Variants Selector */}
      {product.variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
            Pilih Varian
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id ?? null)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  selectedVariantId === variant.id
                    ? "border-brand-green bg-brand-green text-white shadow-md"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-green hover:text-brand-green"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="prose prose-lg leading-relaxed text-neutral-600"
        dangerouslySetInnerHTML={{ __html: product.description || "" }}
      />

      {/* Specs Table */}
      {product.specs.length > 0 && (
        <div className="rounded-brand bg-neutral-50 p-6">
          <h3 className="subheading mb-4 text-neutral-900">Spesifikasi</h3>
          <div className="flex flex-col gap-3">
            {product.specs.map((spec, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-b border-neutral-200 pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4"
              >
                <span className="text-sm font-bold text-neutral-500 sm:text-base">
                  {spec.key}
                </span>
                <span className="text-sm font-bold text-neutral-900 sm:text-right sm:text-base">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 hidden lg:block">
        <Link href={whatsappLink} target="_blank">
          <Button
            size="lg"
            onClick={() => trackMetaEvent("Contact")}
            className="w-full bg-[#25D366] text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-[#20ba5a] hover:shadow-2xl"
          >
            Pesan via WhatsApp
          </Button>
        </Link>
      </div>

      {/* Mobile sticky order bar (hides the global WhatsApp FAB via the
          body class above) */}
      <div className="product-sticky-bar fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-neutral-200 bg-white/95 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-bold text-neutral-500">
            {product.name}
          </span>
          <span className="text-lg font-black tracking-tight text-neutral-900">
            {product.showPrice ? formattedPrice : "Hubungi Kami"}
          </span>
        </div>
        <Link
          href={whatsappLink}
          target="_blank"
          onClick={() => trackMetaEvent("Contact")}
          className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#20ba5a] active:scale-95"
        >
          <SiWhatsapp size={16} />
          Pesan
        </Link>
      </div>
    </div>
  );
}
