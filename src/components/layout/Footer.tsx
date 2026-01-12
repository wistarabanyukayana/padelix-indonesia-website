import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-brand-dark text-white py-12 px-6 pb-[calc(3rem+env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold italic tracking-tighter">Padelix</h2>
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Padel Starts Here.</p>
        </div>

        <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
          <Link href="/products" className="hover:text-brand-green transition-colors">Produk</Link>
          <Link href="/#about" className="hover:text-brand-green transition-colors">Tentang</Link>
          <Link href="/#contact" className="hover:text-brand-green transition-colors">Kontak</Link>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 opacity-50 text-[10px] uppercase tracking-[0.2em]">
          <span>© 2025 Padelix Indonesia. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
