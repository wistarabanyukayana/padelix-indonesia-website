import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export function EmptyState({ message = "Data belum tersedia", className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 w-full h-full min-h-[300px] bg-slate-50/50 rounded-[1.875rem] border border-dashed border-neutral-300", className)}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-neutral-700 text-center">{message}</h3>
      <p className="text-neutral-500 text-center mt-2 max-w-sm">
        Kami sedang menyiapkan konten terbaik untuk Anda. Silakan kembali lagi nanti.
      </p>
    </div>
  );
}
