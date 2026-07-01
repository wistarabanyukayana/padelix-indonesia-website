"use client";

import { AppImage } from "@/components/general/AppImage";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { id: 1, text: "Beranda", href: "/" },
  { id: 2, text: "Produk", href: "/products" },
  { id: 3, text: "Proyek", href: "/#activities" },
  { id: 4, text: "Sertifikasi", href: "/#certifications" },
  { id: 5, text: "Kontak", href: "/#contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  // Top progress bar: fills toward 90% while a click-triggered navigation is
  // in flight, then snaps to 100% and fades once the pathname actually
  // changes. See AdminHeader.tsx for the identical mechanism.
  const [lastPathname, setLastPathname] = useState(pathname);
  const [navPhase, setNavPhase] = useState<"idle" | "pending" | "done">(
    "idle",
  );
  const [navProgress, setNavProgress] = useState(0);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (navPhase === "pending") {
      setNavPhase("done");
      setNavProgress(100);
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest("a");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.origin !== window.location.origin ||
        link.pathname === window.location.pathname
      ) {
        return;
      }
      setNavPhase("pending");
      setNavProgress(15);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (navPhase !== "pending") return;
    const interval = setInterval(() => {
      setNavProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15));
    }, 200);
    return () => clearInterval(interval);
  }, [navPhase]);

  useEffect(() => {
    if (navPhase !== "done") return;
    const timeout = setTimeout(() => {
      setNavPhase("idle");
      setNavProgress(0);
    }, 250);
    return () => clearTimeout(timeout);
  }, [navPhase]);

  useEffect(() => {
    if (navPhase !== "pending") return;
    const timeout = setTimeout(() => {
      setNavPhase("idle");
      setNavProgress(0);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [navPhase]);

  // globals.css sets `scroll-behavior: smooth` on <html> for in-page anchor
  // nav (e.g. "/#activities"). That also makes Next's own scroll-to-top on
  // page navigation animate instead of jump — and the animation gets cut
  // short by the page swap, leaving the new page scrolled to wherever the
  // old page was. Force an instant jump for real route changes only; a
  // hash in the URL means this navigation is targeting an anchor, so leave
  // that to the browser's native (smooth) hash scroll.
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

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
      className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1"
      >
        <div
          className={`h-full bg-brand-green shadow-[0_0_8px_rgba(163,230,53,0.8)] transition-all ease-out ${
            navPhase === "done"
              ? "duration-300 opacity-0"
              : "duration-200 opacity-100"
          }`}
          style={{ width: `${navProgress}%` }}
        />
      </div>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setIsOpen(false)}
          className="fixed right-0 bottom-0 left-0 z-40 bg-black/40 md:hidden"
          style={{ top: "var(--app-header-height)" }}
        />
      )}
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between px-6 md:h-20">
        {/* Logo */}
        <div className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="Padelix Indonesia — Beranda"
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
              className="h-7 w-28 object-contain object-left md:h-9 md:w-36"
            />
          </Link>
        </div>
        {showAdmin && (
          <Link
            href="/admin/login"
            className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase hover:text-lime-600"
          >
            Admin
          </Link>
        )}

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "group relative text-sm font-bold tracking-widest uppercase transition-colors hover:text-lime-600",
                isActive(link.href) ? "text-neutral-900" : "text-neutral-500",
              )}
            >
              {link.text}
              <span
                className={cn(
                  "absolute -bottom-1.5 left-0 h-0.5 bg-brand-green transition-all duration-300 group-hover:w-full",
                  isActive(link.href) ? "w-full" : "w-0",
                )}
              />
            </Link>
          ))}
          <Link
            href={siteConfig.links.whatsapp}
            target="_blank"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-all duration-300 hover:bg-brand-green hover:text-neutral-900"
          >
            <SiWhatsapp size={14} />
            Konsultasi
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={isOpen}
          className="p-2 text-neutral-900 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <div
        ref={mobileNavRef}
        className={cn(
          "absolute top-full left-0 z-50 flex w-full origin-top flex-col overflow-hidden bg-white shadow-xl transition-all duration-300 ease-in-out md:hidden",
          isOpen
            ? "max-h-120 border-b border-neutral-200 py-4 opacity-100"
            : "max-h-0 py-0 opacity-0",
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={cn(
              "px-8 py-3 text-lg font-bold tracking-wide uppercase transition-colors hover:text-lime-600",
              isActive(link.href) ? "text-lime-600" : "text-neutral-900",
            )}
            onClick={() => setIsOpen(false)}
          >
            {link.text}
          </Link>
        ))}
        <div className="px-8 pt-4 pb-2">
          <Link
            href={siteConfig.links.whatsapp}
            target="_blank"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3.5 text-sm font-bold tracking-widest text-white uppercase transition-colors hover:bg-brand-green hover:text-neutral-900"
          >
            <SiWhatsapp size={16} />
            Konsultasi via WhatsApp
          </Link>
        </div>
      </div>
    </header>
  );
}
