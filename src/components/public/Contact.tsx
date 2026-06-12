import { AppImage } from "@/components/general/AppImage";
import { Reveal } from "@/components/general/Reveal";
import { CourtLines } from "@/components/public/CourtLines";
import { cn } from "@/lib/utils";
import { ContactProps } from "@/types";
import Link from "next/link";
import { ContactForm } from "./ContactForm";

export function Contact({ subheading, heading, contactLinks }: ContactProps) {
  return (
    <section
      id="contact"
      className="section relative overflow-hidden bg-court-900 text-white"
    >
      <div className="bg-mesh absolute inset-0" aria-hidden />
      <CourtLines className="opacity-60" />

      <div className="wrapper relative gap-12 lg:flex-row lg:items-start lg:gap-20">
        {/* Info */}
        <div className="flex w-full flex-col gap-8 lg:w-1/2">
          <Reveal>
            <div className="flex flex-col items-start gap-3">
              <span className="kicker text-brand-green">{subheading}</span>
              <h2 className="display-2 text-white">{heading}</h2>
              <p className="mt-2 max-w-md text-lg leading-relaxed text-neutral-400">
                Konsultasikan kebutuhan lapangan atau peralatan padel Anda — tim
                kami siap membantu dari perencanaan hingga instalasi.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-5">
            {contactLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Reveal key={link.id} delay={100 + index * 80}>
                  <Link
                    href={link.href}
                    target="_blank"
                    className="group flex items-center gap-4"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl p-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
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
                      <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                        {link.label}
                      </span>
                      <span className="text-lg font-bold text-white transition-colors group-hover:text-brand-green">
                        {link.text}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <Reveal delay={150} className="w-full lg:w-1/2">
          <div className="rounded-brand bg-white p-6 text-neutral-900 shadow-2xl sm:p-10">
            <div className="mb-8 flex flex-col gap-2">
              <span className="kicker text-lime-600">Kirim Pesan</span>
              <h3 className="display-3 text-neutral-900">Ada Pertanyaan?</h3>
            </div>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
