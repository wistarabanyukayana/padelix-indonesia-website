"use client";

import { AppImage } from "@/components/general/AppImage";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { id: 1, text: "Beranda", href: "/" },
  { id: 2, text: "Produk", href: "/products" },
  { id: 4, text: "Aktivitas", href: "/#activities" },
  { id: 5, text: "Sertifikat", href: "/#certifications" },
  { id: 6, text: "Kontak", href: "/#contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("mobileMenuToggle", { detail: { isOpen } }),
    );
    document.body.style.overflow = isOpen ? "hidden" : "";
    document.body.style.touchAction = isOpen ? "none" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (target && mobileNavRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("wheel", handleScrollOutside, { passive: true });
    document.addEventListener("touchmove", handleScrollOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("wheel", handleScrollOutside);
      document.removeEventListener("touchmove", handleScrollOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateHeight = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${height}px`,
      );
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

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const revealAdmin = () => {
    setShowAdmin(true);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setShowAdmin(false);
    }, 10000);
  };

  const handleLogoPressStart = () => {
    longPressTriggered.current = false;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      revealAdmin();
    }, 3000);
  };

  const handleLogoPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white pt-[env(safe-area-inset-top)]"
    >
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setIsOpen(false)}
          className="fixed right-0 bottom-0 left-0 z-40 bg-black/40 md:hidden"
          style={{ top: "var(--app-header-height)" }}
        />
      )}
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo Container - 1.5x larger visual size with vertical overflow */}
        <div className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center"
            onClick={(event) => {
              if (longPressTriggered.current) {
                event.preventDefault();
                longPressTriggered.current = false;
              }
            }}
            onPointerDown={handleLogoPressStart}
            onPointerUp={handleLogoPressEnd}
            onPointerLeave={handleLogoPressEnd}
          >
            <AppImage
              src="/assets/padelix-wordmark-v2.webp"
              alt="Padelix Indonesia"
              width={144}
              height={36}
              disableLoadingAnimation
              className="h-3 w-12 object-contain object-left sm:h-6 sm:w-24 md:h-9 md:w-36"
            />
          </Link>
        </div>
        {showAdmin && (
          <Link
            href="/admin/login"
            className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase hover:text-brand-green"
          >
            Admin
          </Link>
        )}

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-12 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="nav-link text-sm tracking-widest uppercase"
            >
              {link.text}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={isOpen}
          className="p-2 text-neutral-900 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <div
        ref={mobileNavRef}
        className={cn(
          "absolute top-full left-0 z-50 flex w-full origin-top flex-col items-center overflow-hidden bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden",
          isOpen
            ? "max-h-75 border-b border-neutral-200 py-4 opacity-100"
            : "max-h-0 py-0 opacity-0",
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="py-2 text-lg font-bold text-neutral-900 transition-colors hover:text-brand-green"
            onClick={() => setIsOpen(false)}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </header>
  );
}
