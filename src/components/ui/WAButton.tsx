"use client";

import { siteConfig } from "@/config/site";
import { trackMetaEvent } from "@/lib/metaPixel";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export function WAButton() {
  return (
    <Link
      href={siteConfig.links.whatsapp}
      target="_blank"
      onClick={() => trackMetaEvent("Contact")}
      aria-label="Hubungi kami di WhatsApp"
      className="wa-fab group fixed right-6 bottom-6 z-50 flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
    >
      <SiWhatsapp size={32} />
      <span className="pointer-events-none absolute right-full mr-4 hidden rounded-lg bg-white px-4 py-2 text-sm font-bold whitespace-nowrap text-neutral-900 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 lg:block">
        Tanya Kami di WhatsApp
      </span>
    </Link>
  );
}
