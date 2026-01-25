"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Footer() {
  const [showAdmin, setShowAdmin] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

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
    <footer className="w-full bg-brand-dark px-6 py-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8">
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
          className="flex flex-col items-center gap-2"
          aria-label="Padelix Indonesia"
        >
          <h2 className="text-3xl font-bold tracking-tighter italic">
            Padelix
          </h2>
          <p className="text-sm tracking-widest text-neutral-400 uppercase">
            Padel Starts Here.
          </p>
        </button>

        <div className="flex gap-8 text-sm font-bold tracking-widest uppercase">
          <Link
            href="/products"
            className="transition-colors hover:text-brand-green"
          >
            Produk
          </Link>
          <Link
            href="/#about"
            className="transition-colors hover:text-brand-green"
          >
            Tentang
          </Link>
          <Link
            href="/#contact"
            className="transition-colors hover:text-brand-green"
          >
            Kontak
          </Link>
        </div>

        <div className="h-px w-full bg-neutral-800" />

        <div className="flex w-full flex-col items-center justify-between gap-4 text-[10px] tracking-[0.2em] uppercase opacity-50 md:flex-row">
          <div className="flex items-center gap-4">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            {showAdmin && (
              <Link href="/admin/login" className="hover:text-white">
                Admin
              </Link>
            )}
          </div>
          <span className="text-center">
            © 2025 Padelix Indonesia. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
