import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppImage } from "@/components/general/AppImage";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-48 h-48 mb-8">
        <AppImage
          src="/assets/padelix-word-with-transparent-background.svg"
          alt="Padelix Indonesia"
          fill
          className="object-contain opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-9xl font-black text-brand-green tracking-tighter">404</h1>
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-neutral-900 mb-4 uppercase tracking-tight">Halaman Tidak Ditemukan</h2>
      <p className="text-neutral-500 max-w-md mb-12 font-medium">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan. Mari kembali ke jalur yang benar.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Padel Starts Here.</p>
      </div>
    </div>
  );
}
