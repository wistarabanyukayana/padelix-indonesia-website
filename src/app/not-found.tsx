import { AppImage } from "@/components/general/AppImage";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        <AppImage
          src="/assets/padelix-wordmark-v2.webp"
          alt="Padelix Indonesia"
          width={192}
          height={48}
          disableLoadingAnimation
          className="h-10 w-40 object-contain opacity-20 sm:h-12 sm:w-48"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-9xl font-black tracking-tighter text-brand-green">
            404
          </h1>
        </div>
      </div>

      <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 uppercase">
        Halaman Tidak Ditemukan
      </h2>
      <p className="mb-12 max-w-md font-medium text-neutral-500">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan. Mari
        kembali ke jalur yang benar.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/">
          <Button variant="dark" size="lg" className="px-12">
            Kembali ke Beranda
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" className="px-12">
            Lihat Produk
          </Button>
        </Link>
      </div>

      <div className="mt-20 flex flex-col items-center gap-2 opacity-30">
        <p className="text-[10px] font-black tracking-[0.3em] text-neutral-400 uppercase">
          Padel Starts Here.
        </p>
      </div>
    </div>
  );
}
