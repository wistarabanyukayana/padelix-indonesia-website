"use client";

import "@/app/globals.css";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-white">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
          <div className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold tracking-widest text-red-600 uppercase">
            Terjadi Kesalahan
          </div>
          <h1 className="text-3xl font-black text-neutral-900">
            Maaf, ada masalah di sistem kami
          </h1>
          <p className="max-w-lg text-sm text-neutral-600">
            Silakan coba lagi atau kembali ke halaman utama. Jika masalah masih
            terjadi, hubungi tim Padelix.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="dark" size="lg" onClick={() => reset()}>
              Coba Lagi
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
