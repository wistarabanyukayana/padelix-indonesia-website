"use client";

import { siteConfig } from "@/config/site";
import {
  SiFacebook,
  SiInstagram,
  SiWhatsapp,
} from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FOOTER_LINKS = [
  { text: "Beranda", href: "/" },
  { text: "Produk", href: "/products" },
  { text: "Proyek", href: "/#activities" },
  { text: "Tentang", href: "/#about" },
  { text: "Kontak", href: "/#contact" },
];

const SOCIAL_LINKS = [
  {
    label: "WhatsApp",
    href: siteConfig.links.whatsapp,
    icon: SiWhatsapp,
  },
  {
    label: "Instagram",
    href: siteConfig.contact.instagramUrl,
    icon: SiInstagram,
  },
  {
    label: "Facebook",
    href: siteConfig.contact.facebookUrl,
    icon: SiFacebook,
  },
  {
    label: "Email",
    href: `mailto:${siteConfig.contact.email}`,
    icon: Mail,
  },
];

export function Footer() {
  const [showAdmin, setShowAdmin] = useState(false);
  // Static fallback for prerender; updated client-side (new Date() is not
  // allowed during prerender with Cache Components)
  const [year, setYear] = useState(2026);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
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
    <footer className="relative w-full overflow-hidden bg-court-950 px-6 pt-16 pb-[calc(2rem+env(safe-area-inset-bottom))] text-white sm:px-12">
      <div className="bg-mesh absolute inset-0" aria-hidden />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <button
              type="button"
              onClick={(event) => {
                if (longPressTriggered.current) {
                  event.preventDefault();
                  longPressTriggered.current = false;
                }
              }}
              onPointerDown={handleLogoPressStart}
              onPointerUp={handleLogoPressEnd}
              onPointerLeave={handleLogoPressEnd}
              className="flex flex-col items-start gap-1 text-left"
              aria-label="Padelix Indonesia"
            >
              <span className="font-display text-4xl tracking-wide uppercase">
                Padelix
              </span>
              <span className="text-xs font-bold tracking-[0.3em] text-brand-green uppercase">
                Padel Starts Here.
              </span>
            </button>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
              Konstruksi lapangan dan peralatan padel berkualitas tinggi — dari
              perencanaan hingga instalasi, di seluruh Indonesia.
            </p>
            <div className="mt-2 flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-400 transition-all duration-300 hover:border-brand-green hover:bg-brand-green hover:text-neutral-900"
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">
              Navigasi
            </span>
            <nav className="flex flex-col items-start gap-2.5">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  className="text-sm font-bold tracking-wide uppercase transition-colors hover:text-brand-green"
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">
              Kontak
            </span>
            <div className="flex flex-col items-start gap-2.5 text-sm text-neutral-300">
              <Link
                href={`mailto:${siteConfig.contact.email}`}
                className="transition-colors hover:text-brand-green"
              >
                {siteConfig.contact.email}
              </Link>
              <Link
                href={siteConfig.links.whatsapp}
                target="_blank"
                className="transition-colors hover:text-brand-green"
              >
                {siteConfig.contact.whatsappDisplay}
              </Link>
              <Link
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                className="transition-colors hover:text-brand-green"
              >
                @{siteConfig.contact.instagram}
              </Link>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex w-full flex-col items-center justify-between gap-4 text-[10px] tracking-[0.2em] text-neutral-500 uppercase md:flex-row">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            {showAdmin && (
              <Link href="/admin/login" className="hover:text-white">
                Admin
              </Link>
            )}
          </div>
          <span className="text-center">
            © {year} Padelix Indonesia. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
