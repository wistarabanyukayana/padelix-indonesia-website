import { AppImage } from "@/components/general/AppImage";
import { Reveal } from "@/components/general/Reveal";
import { CertificationsProps } from "@/types";

export function Certifications({
  heading,
  subheading,
  certificates,
}: CertificationsProps) {
  return (
    <section id="certifications" className="section bg-white">
      <div className="wrapper gap-12">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="kicker justify-center text-brand-red">
              {subheading}
            </span>
            <h2 className="display-2 text-neutral-900">{heading}</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {certificates.map((cert, index) => (
            <Reveal key={cert.id} delay={index * 100} className="h-full">
              <div className="group flex h-full flex-col items-center gap-5 rounded-brand border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-red/40 hover:shadow-xl sm:p-8">
                <AppImage
                  src={cert.src}
                  alt={cert.name}
                  width={96}
                  height={96}
                  disableLoadingAnimation
                  className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24"
                />
                <p className="mt-auto text-center text-xs font-bold tracking-widest text-neutral-500 uppercase transition-colors group-hover:text-neutral-900">
                  {cert.name}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
