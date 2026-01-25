import Link from "next/link";

export function AccessDenied() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-black text-neutral-900">Akses Ditolak</h1>
      <p className="max-w-md text-sm text-neutral-500">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link
        href="/admin"
        className="rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-neutral-900"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
