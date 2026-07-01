"use client";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { NavItem, NavSection, SessionPayload } from "@/types";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface AdminHeaderProps {
  user: SessionPayload["user"];
  navStructure: NavSection[];
}

export function AdminHeader({ user, navStructure }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<string[]>(
    [],
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();
  const [now, setNow] = useState(() => new Date());

  // Reset menus on route change
  const [lastPathname, setLastPathname] = useState(pathname);
  const [navPhase, setNavPhase] = useState<"idle" | "pending" | "done">(
    "idle",
  );
  const [navProgress, setNavProgress] = useState(0);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setMobileExpandedGroups([]);
    setIsMobileUserMenuOpen(false);
    if (navPhase === "pending") {
      setNavPhase("done");
      setNavProgress(100);
    }
  }

  // Clicking a nav link only starts showing feedback once the target route's
  // data streams in (loading.tsx). On a cold, not-yet-prefetched navigation
  // that can take a while, so flag "navigating" the instant the click fires
  // and drive a determinate top progress bar (NProgress-style trickle) until
  // the pathname actually changes.
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

  // Trickle toward 90% while waiting — never reaches 100% on its own, so it
  // always visibly "completes" once the route actually finishes loading.
  useEffect(() => {
    if (navPhase !== "pending") return;
    const interval = setInterval(() => {
      setNavProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15));
    }, 200);
    return () => clearInterval(interval);
  }, [navPhase]);

  // Hold the completed bar briefly, then fade it out and reset.
  useEffect(() => {
    if (navPhase !== "done") return;
    const timeout = setTimeout(() => {
      setNavPhase("idle");
      setNavProgress(0);
    }, 250);
    return () => clearTimeout(timeout);
  }, [navPhase]);

  // ponytail: safety-net ceiling in case a navigation errors out and the
  // pathname never changes to clear the bar naturally.
  useEffect(() => {
    if (navPhase !== "pending") return;
    const timeout = setTimeout(() => {
      setNavPhase("idle");
      setNavProgress(0);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [navPhase]);

  // globals.css sets `scroll-behavior: smooth` on <html>, which also makes
  // Next's scroll-to-top on route change animate — and the page swap cuts
  // that animation short, leaving the new page scrolled wherever the old
  // one was. Force an instant jump on real navigations (skip if the target
  // has a hash, letting the browser's native smooth anchor-scroll handle it).
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("mobileMenuToggle", {
        detail: { isOpen: isMobileMenuOpen },
      }),
    );
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    document.body.style.touchAction = isMobileMenuOpen ? "none" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener("resize", updateHeight);
      viewport.addEventListener("scroll", updateHeight);
    }
    const handleFocus = () => updateHeight();
    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleFocus);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
      if (viewport) {
        viewport.removeEventListener("resize", updateHeight);
        viewport.removeEventListener("scroll", updateHeight);
      }
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleFocus);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpenDropdown(null);
      }
      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(target)
      ) {
        setIsMobileUserMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleScrollOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (target && mobileNavRef.current?.contains(target)) return;
      setIsMobileMenuOpen(false);
    };
    document.addEventListener("wheel", handleScrollOutside, { passive: true });
    document.addEventListener("touchmove", handleScrollOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("wheel", handleScrollOutside);
      document.removeEventListener("touchmove", handleScrollOutside);
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    return (
      pathname === path || (path !== "/admin" && pathname.startsWith(path))
    );
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href));
  };

  const handleLogout = () => {
    startLogout(async () => {
      const result = await logout();
      if (result?.redirectTo) {
        window.location.assign(result.redirectTo);
      }
    });
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white pt-[env(safe-area-inset-top)]"
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
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => {
            setIsMobileMenuOpen(false);
          }}
          className="fixed right-0 bottom-0 left-0 z-40 bg-black/40 lg:hidden"
          style={{ top: "var(--app-header-height)" }}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile Menu Button (Left) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-brand-green focus:outline-none focus:ring-inset"
            >
              <span className="sr-only">Buka menu utama</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-tighter text-brand-green lg:static lg:translate-x-0"
            >
              PADELIX<span className="text-neutral-900">ADMIN</span>
            </Link>
            <div className="hidden h-6 w-px bg-neutral-200 sm:block" />
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 text-xs font-bold tracking-widest text-neutral-400 uppercase transition-colors hover:text-brand-green md:flex"
            >
              Lihat Website <ExternalLink size={14} />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden space-x-2 lg:flex" ref={dropdownRef}>
            {navStructure.map((section) => {
              if (section.type === "link") {
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(section.href)
                        ? "bg-brand-light text-brand-green"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {section.label}
                  </Link>
                );
              }

              if (section.type === "group") {
                const active = isGroupActive(section.items);
                const isOpen = openDropdown === section.label;

                return (
                  <div key={section.label} className="relative">
                    <button
                      onClick={() => toggleDropdown(section.label)}
                      className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${
                        active || isOpen
                          ? "bg-brand-light text-brand-green"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {section.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="ring-opacity-5 animate-in fade-in zoom-in-95 absolute left-0 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black duration-100 focus:outline-none">
                        {section.items.map((item: NavItem) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                              isActive(item.href)
                                ? "bg-gray-50 font-medium text-brand-green"
                                : ""
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </nav>

          {/* User / Logout */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-neutral-900">
                {user.username}
              </span>
              <span className="text-[10px] leading-none font-black tracking-tighter text-neutral-400 uppercase">
                {(user.permissions ?? []).includes("manage_users")
                  ? "Super Admin"
                  : "Editor"}
              </span>
              <span className="mt-1 text-[10px] leading-none font-black tracking-tighter text-neutral-400 uppercase">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(now)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              Logout
            </Button>
          </div>

          {/* Mobile User Menu (Right) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative" ref={mobileUserMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-black text-white"
                aria-label="Buka menu pengguna"
              >
                {user.username.charAt(0).toUpperCase()}
              </button>
              {isMobileUserMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <div className="text-sm font-bold text-neutral-900">
                      {user.username}
                    </div>
                    <div className="text-xs text-neutral-500">{user.email}</div>
                    <div className="mt-2 text-[10px] leading-none font-black tracking-tighter text-neutral-400 uppercase">
                      {(user.permissions ?? []).includes("manage_users")
                        ? "Super Admin"
                        : "Editor"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileNavRef}
          className="absolute top-16 right-0 left-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-neutral-200 bg-white shadow-lg lg:hidden"
        >
          <div className="space-y-1 px-2 pt-2 pb-3">
            {navStructure.map((section) => {
              if (section.type === "link") {
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-md px-3 py-3 text-base font-medium ${
                      isActive(section.href)
                        ? "bg-brand-light text-brand-green"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {section.label}
                  </Link>
                );
              }

              if (section.type === "group") {
                const isExpanded = mobileExpandedGroups.includes(section.label);
                const active = isGroupActive(section.items);

                return (
                  <div
                    key={section.label}
                    className="border-t border-gray-100 first:border-t-0"
                  >
                    <button
                      onClick={() => toggleMobileGroup(section.label)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors ${
                        active && !isExpanded
                          ? "bg-brand-light/30 text-brand-green"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {section.label}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="space-y-1 rounded-b-md bg-gray-50/50 pb-2">
                        {section.items.map((item: NavItem) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block py-2 pr-3 pl-6 text-sm font-medium ${
                              isActive(item.href)
                                ? "border-r-2 border-brand-green bg-brand-light/50 text-brand-green"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}

            <div className="mt-2 border-t border-gray-100 pt-4">
              <Link
                href="/"
                target="_blank"
                className="block rounded-md px-3 py-2 text-base font-medium text-neutral-500 hover:bg-gray-50 hover:text-brand-green md:hidden"
              >
                Lihat Website <ExternalLink size={14} className="ml-1 inline" />
              </Link>
            </div>
          </div>

          <div className="border-t border-neutral-200 bg-gray-50 pt-4 pb-4">
            <div className="px-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Navigasi Admin
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
