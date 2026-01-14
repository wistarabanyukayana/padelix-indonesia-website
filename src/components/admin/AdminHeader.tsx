"use client";

import Link from "next/link";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { useState, useEffect, useRef, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ExternalLink, ChevronDown } from "lucide-react";
import { SessionPayload, NavSection, NavItem } from "@/types";

interface AdminHeaderProps {
  user: SessionPayload["user"];
  navStructure: NavSection[];
}

export function AdminHeader({ user, navStructure }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();
  const [now, setNow] = useState(() => new Date());

  // Reset menus on route change
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setMobileExpandedGroups([]);
    setIsMobileUserMenuOpen(false);
  }

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroups((prev) => 
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { isOpen: isMobileMenuOpen } }));
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpenDropdown(null);
      }
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(target)) {
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
    document.addEventListener("touchmove", handleScrollOutside, { passive: true });
    return () => {
      document.removeEventListener("wheel", handleScrollOutside);
      document.removeEventListener("touchmove", handleScrollOutside);
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    return pathname === path || (path !== "/admin" && pathname.startsWith(path));
  };

  const isGroupActive = (items: NavItem[]) => {
    return items.some(item => isActive(item.href));
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
      className="bg-white border-b border-neutral-200 z-50 flex-none relative pt-[env(safe-area-inset-top)] sticky top-0"
    >
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => {
            setIsMobileMenuOpen(false);
          }}
          className="fixed left-0 right-0 bottom-0 bg-black/40 lg:hidden z-40"
          style={{ top: "var(--app-header-height)" }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between h-16 items-center">
          {/* Mobile Menu Button (Left) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green"
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
              className="text-xl font-black text-brand-green tracking-tighter absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
            >
              PADELIX<span className="text-neutral-900">ADMIN</span>
            </Link>
            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
            <Link 
              href="/" 
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-brand-green transition-colors uppercase tracking-widest"
            >
              Lihat Website <ExternalLink size={14} />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-2" ref={dropdownRef}>
            {navStructure.map((section) => {
              if (section.type === "link") {
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
                      className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none ${
                        active || isOpen
                          ? "bg-brand-light text-brand-green"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {section.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                        {section.items.map((item: NavItem) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                              isActive(item.href) ? "bg-gray-50 text-brand-green font-medium" : ""
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
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-neutral-900">{user.username}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-black tracking-tighter leading-none">
                    {(user.permissions ?? []).includes('manage_users') ? 'Super Admin' : 'Editor'}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase font-black tracking-tighter leading-none mt-1">
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(now)}
                </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              Logout
            </Button>
          </div>

          {/* Mobile User Menu (Right) */}
          <div className="flex items-center lg:hidden gap-2">
            <div className="relative" ref={mobileUserMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                className="h-9 w-9 rounded-full bg-brand-green text-white text-sm font-black flex items-center justify-center"
                aria-label="Buka menu pengguna"
              >
                {user.username.charAt(0).toUpperCase()}
              </button>
              {isMobileUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <div className="text-sm font-bold text-neutral-900">{user.username}</div>
                    <div className="text-xs text-neutral-500">{user.email}</div>
                    <div className="text-[10px] text-neutral-400 uppercase font-black tracking-tighter leading-none mt-2">
                      {(user.permissions ?? []).includes('manage_users') ? 'Super Admin' : 'Editor'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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
          className="lg:hidden bg-white border-b border-neutral-200 absolute top-16 left-0 right-0 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <div className="pt-2 pb-3 space-y-1 px-2">
            {navStructure.map((section) => {
              if (section.type === "link") {
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-3 rounded-md text-base font-medium ${
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
                  <div key={section.label} className="border-t border-gray-100 first:border-t-0">
                    <button 
                        onClick={() => toggleMobileGroup(section.label)}
                        className={`w-full flex items-center justify-between px-3 py-3 text-base font-medium rounded-md transition-colors ${
                          active && !isExpanded ? "text-brand-green bg-brand-light/30" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        {section.label}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                        <div className="space-y-1 pb-2 bg-gray-50/50 rounded-b-md">
                            {section.items.map((item: NavItem) => (
                                <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block pl-6 pr-3 py-2 text-sm font-medium ${
                                    isActive(item.href)
                                    ? "text-brand-green bg-brand-light/50 border-r-2 border-brand-green"
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
            
            <div className="pt-4 mt-2 border-t border-gray-100">
                <Link
                href="/"
                target="_blank"
                className="block sm:hidden px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:bg-gray-50 hover:text-brand-green"
                >
                Lihat Website <ExternalLink size={14} className="inline ml-1" />
                </Link>
            </div>
          </div>
          
          <div className="pt-4 pb-4 border-t border-neutral-200 bg-gray-50">
            <div className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-widest">
              Navigasi Admin
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
