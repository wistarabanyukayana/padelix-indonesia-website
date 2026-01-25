import { AppImage } from "@/components/general/AppImage";
import { cn } from "@/lib/utils";
import { ContactProps } from "@/types";
import Link from "next/link";
import { ContactForm } from "./ContactForm";

export function Contact({ subheading, heading, contactLinks }: ContactProps) {
  return (
    <section id="contact" className="section bg-white text-neutral-900">
      <div className="wrapper gap-12 lg:gap-20">
        <div className="flex w-full flex-col gap-12 lg:flex-row">
          {/* Form */}
          <div className="flex w-full flex-col gap-8 lg:w-1/2">
            <div className="flex flex-col gap-2">
              <span className="subheading">{subheading}</span>
              <h2 className="h2">Ada Pertanyaan?</h2>
            </div>

            <ContactForm />
          </div>

          {/* Info */}
          <div className="flex w-full flex-col gap-8 lg:w-1/2">
            <div className="flex flex-col gap-2">
              <span className="subheading">Informasi</span>
              <h2 className="h2">{heading}</h2>
            </div>

            <div className="flex flex-col gap-6">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    className="group flex items-center gap-4"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full p-2.5 transition-transform group-hover:scale-110",
                        link.color,
                      )}
                    >
                      {typeof link.icon === "string" ? (
                        <AppImage
                          src={link.icon}
                          alt={link.label}
                          width={30}
                          height={30}
                          className="h-full w-full object-contain brightness-0 invert"
                        />
                      ) : (
                        <Icon size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-tight text-neutral-400 uppercase">
                        {link.label}
                      </span>
                      <span className="text-lg font-bold text-neutral-900 transition-colors group-hover:text-brand-green">
                        {link.text}
                      </span>
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
