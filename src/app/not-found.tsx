import { CourtLines } from "@/components/public/CourtLines";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-court-950 p-6 text-center text-white">
      <div className="bg-mesh absolute inset-0" aria-hidden />
      <CourtLines />

      <div className="relative flex flex-col items-center">
        <span className="kicker mb-6 justify-center text-brand-green">
          Bola Keluar Lapangan
        </span>
        <h1 className="font-display text-[10rem] leading-none tracking-tight text-brand-green sm:text-[14rem]">
          404
        </h1>

        <h2 className="display-3 mb-4 text-white">Halaman Tidak Ditemukan</h2>
        <p className="mb-12 max-w-md font-medium text-neutral-400">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          Mari kembali ke jalur yang benar.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/">
            <Button variant="primary" size="lg" className="px-12">
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="border-white/70 px-12 text-white hover:border-white hover:bg-white hover:text-neutral-900"
            >
              Lihat Produk
            </Button>
          </Link>
        </div>

        <p className="mt-20 text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">
          Padel Starts Here.
        </p>
      </div>
    </div>
  );
}
