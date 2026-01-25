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

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || siteConfig.description,
    image: productImage ? [productImage] : undefined,
    brand: product.brandName
      ? { "@type": "Brand", name: product.brandName }
      : undefined,
  };

  if (product.showPrice) {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.basePrice?.toString?.() ?? undefined,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    };
  }

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
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd, breadcrumbJsonLd]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      {/* Breadcrumb / Back */}
      <div className="border-b border-neutral-200 bg-brand-light px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-neutral-500 uppercase hover:text-brand-green"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>

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
    </main>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
