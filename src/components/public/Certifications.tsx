import { AppImage } from "@/components/general/AppImage";
import { CertificationsProps } from "@/types";

export function Certifications({
  heading,
  subheading,
  certificates,
}: CertificationsProps) {
  return (
    <section id="certifications" className="section bg-brand-red text-white">
      <div className="wrapper gap-12">
        <div className="flex flex-col gap-2 text-center">
          <span className="subheading text-red-200">{subheading}</span>
          <h2 className="h2 w-full text-center text-white">{heading}</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group flex flex-col items-center gap-4"
            >
              <div className="rounded-brand bg-white p-6 shadow-lg transition-transform group-hover:-translate-y-2">
                <AppImage
                  src={cert.src}
                  alt={cert.name}
                  width={120}
                  height={120}
                  className="h-24 w-24 object-contain"
                />
              </div>
              <p className="text-center text-sm font-bold tracking-wide uppercase">
                {cert.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
