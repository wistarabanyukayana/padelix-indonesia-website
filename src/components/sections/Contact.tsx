import { AppImage } from "@/components/general/AppImage";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContactProps } from "@/types";
import { ContactForm } from "./ContactForm";

export function Contact({ subheading, heading, contactLinks }: ContactProps) {
  return (
    <section id="contact" className="section bg-white text-neutral-900">
      <div className="wrapper gap-12 lg:gap-20">
        <div className="flex flex-col lg:flex-row gap-12 w-full">
          {/* Form */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="subheading">{subheading}</span>
              <h2 className="h2">Ada Pertanyaan?</h2>
            </div>
            
            <ContactForm />
          </div>

          {/* Info */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="subheading">Informasi</span>
              <h2 className="h2">{heading}</h2>
            </div>

            <div className="flex flex-col gap-6">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.id} href={link.href} target="_blank" className="flex items-center gap-4 group">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center p-2.5 transition-transform group-hover:scale-110", link.color)}>
                      {typeof link.icon === 'string' ? (
                        <AppImage src={link.icon} alt={link.label} width={30} height={30} className="w-full h-full object-contain brightness-0 invert" />
                      ) : (
                        <Icon size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-tight">{link.label}</span>
                      <span className="text-lg font-bold text-neutral-900 group-hover:text-brand-green transition-colors">{link.text}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
