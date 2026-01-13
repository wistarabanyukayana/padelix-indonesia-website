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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  // Reset menus on route change
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setMobileExpandedGroups([]);
  }

  const toggleMobileGroup = (label: string) => {
    setMobileExpandedGroups((prev) => 
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { isOpen: isMobileMenuOpen } }));
  }, [isMobileMenuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="bg-white border-b border-neutral-200 z-50 flex-none relative pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xl font-black text-brand-green tracking-tighter">
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
          <nav className="hidden md:flex space-x-2" ref={dropdownRef}>
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
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-neutral-900">{user.username}</span>
                <span className="text-[10px] text-neutral-400 uppercase font-black tracking-tighter leading-none">
                    {(user.permissions ?? []).includes('manage_users') ? 'Super Admin' : 'Editor'}
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

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 absolute top-16 left-0 right-0 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:bg-gray-50 hover:text-brand-green"
                >
                Lihat Website <ExternalLink size={14} className="inline ml-1" />
                </Link>
            </div>
          </div>
          
          <div className="pt-4 pb-4 border-t border-neutral-200 bg-gray-50">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-bold text-gray-800">{user.username}</div>
                <div className="text-xs font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                type="button"
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
