"use client";

import Link from "next/link";
import { AppImage } from "@/components/general/AppImage";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: 1, text: "Beranda", href: "/" },
  { id: 2, text: "Produk", href: "/products" },
  { id: 3, text: "Sertifikat", href: "/#certifications" },
  { id: 4, text: "Kontak", href: "/#contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { isOpen } }));
  }, [isOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateHeight = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--app-header-height", `${height}px`);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 pt-[env(safe-area-inset-top)]"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        {/* Logo Container - 1.5x larger visual size with vertical overflow */}
        <div className="w-48 h-10 flex-shrink-0 relative">
          <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] md:w-[450px] h-[100px] md:h-[150px]">
            <div className="relative w-full h-full">
              <AppImage
                src="/assets/padelix-word-with-transparent-background.svg"
                alt="Padelix Indonesia"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12">
          {NAV_LINKS.map((link) => (
            <Link key={link.id} href={link.href} className="nav-link text-sm uppercase tracking-widest">
              {link.text}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-neutral-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <div className={cn(
        "absolute top-full left-0 w-full bg-white z-40 md:hidden flex flex-col items-center overflow-hidden transition-all duration-300 ease-in-out shadow-xl origin-top",
        isOpen ? "max-h-75 py-4 border-b border-neutral-200 opacity-100" : "max-h-0 py-0 opacity-0"
      )}>
        {NAV_LINKS.map((link) => (
          <Link 
            key={link.id} 
            href={link.href} 
            className="text-lg font-bold text-neutral-900 py-2 hover:text-brand-green transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </header>
  );
}
