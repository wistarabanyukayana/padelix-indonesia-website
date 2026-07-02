import { ProductInfo } from "@/components/public/products/ProductInfo";
import { ProductMediaGallery } from "@/components/public/products/ProductMediaGallery";
import { siteConfig } from "@/config/site";
import { getProductBySlug } from "@/data/public";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      alternates: { canonical: "/products" },
    };
  }

  const image = product.medias?.[0]?.url
    ? product.medias[0].url.startsWith("http")
      ? product.medias[0].url
      : `${siteConfig.url}${product.medias[0].url}`
    : siteConfig.ogImage;

  return {
    title: product.name,
    description: product.description || siteConfig.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description || siteConfig.description,
      url: `${siteConfig.url}/products/${product.slug}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description || siteConfig.description,
      images: [image],
    },
  };
}

async function ProductDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const productImage = product.medias?.[0]?.url
    ? product.medias[0].url.startsWith("http")
      ? product.medias[0].url
      : `${siteConfig.url}${product.medias[0].url}`
    : undefined;

  const productJsonLd = product.showPrice
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || siteConfig.description,
        image: productImage ? [productImage] : undefined,
        brand: product.brandName
          ? { "@type": "Brand", name: product.brandName }
          : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: product.basePrice?.toString?.() ?? undefined,
          availability: "https://schema.org/InStock",
          url: `${siteConfig.url}/products/${product.slug}`,
        },
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produk",
        item: `${siteConfig.url}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteConfig.url}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [productJsonLd, breadcrumbJsonLd].filter(Boolean),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row lg:gap-20 lg:py-20">
        {/* Images */}
        <div className="w-full lg:w-1/2">
          <ProductMediaGallery
            medias={product.medias}
            productName={product.name}
          />
        </div>

        {/* Info */}
        <div className="w-full lg:w-1/2">
          <ProductInfo product={product} />
        </div>
      </div>
    </>
  );
}

/* Mirrors the product layout while the data streams in */
function ProductDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row lg:gap-20 lg:py-20">
      <div className="w-full lg:w-1/2">
        <div className="aspect-square w-full animate-pulse rounded-brand bg-neutral-100" />
        <div className="mt-4 grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col gap-6 lg:w-1/2">
        <div className="flex gap-2">
          <div className="h-6 w-28 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="h-10 w-4/5 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-8 w-2/5 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-2 flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="mt-4 hidden h-14 w-full animate-pulse rounded-brand bg-neutral-100 lg:block" />
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb renders instantly — only the product data streams */}
      <div className="border-b border-neutral-200 bg-brand-light px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase transition-colors hover:text-lime-600"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent params={params} />
      </Suspense>
    </main>
  );
}
