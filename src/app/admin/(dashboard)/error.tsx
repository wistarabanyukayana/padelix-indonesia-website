"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin segment error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold tracking-widest text-red-600 uppercase">
        Admin Error
      </div>
      <h1 className="text-3xl font-black text-neutral-900">
        Ada masalah di halaman admin
      </h1>
      <p className="max-w-lg text-sm text-neutral-600">
        Silakan coba lagi. Jika masih gagal, kembali ke dashboard atau login
        ulang.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="dark" size="lg" onClick={() => reset()}>
          Coba Lagi
        </Button>
        <Link href="/admin">
          <Button variant="outline" size="lg">
            Kembali ke Dashboard
          </Button>
        </Link>
        <Link href="/admin/login">
          <Button variant="outline" size="lg">
            Login Ulang
          </Button>
        </Link>
      </div>
    </div>
  );
}
