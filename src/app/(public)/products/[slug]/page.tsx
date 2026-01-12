import { getProductBySlug } from "@/data/public";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductMediaGallery } from "@/components/products/ProductMediaGallery";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb / Back */}
      <div className="bg-brand-light py-4 px-6 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <Link href="/products" className="text-sm font-bold text-neutral-500 hover:text-brand-green uppercase tracking-widest flex items-center gap-2">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
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