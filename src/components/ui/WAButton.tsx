import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";

export function WAButton() {
  return (
    <Link 
      href={siteConfig.links.whatsapp} 
      target="_blank" 
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center justify-center"
    >
      <SiWhatsapp size={32} />
      <span className="hidden lg:block absolute right-full mr-4 bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Tanya Kami di WhatsApp
      </span>
    </Link>
  );
}
