import { AppImage } from "@/components/general/AppImage";
import { CertificationsProps } from "@/types";

export function Certifications({ heading, subheading, certificates }: CertificationsProps) {
  return (
    <section id="certifications" className="section bg-brand-red text-white">
      <div className="wrapper gap-12">
        <div className="text-center flex flex-col gap-2">
          <span className="subheading text-red-200">{subheading}</span>
          <h2 className="h2 text-white text-center w-full">{heading}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {certificates.map((cert) => (
            <div key={cert.id} className="flex flex-col items-center gap-4 group">
              <div className="bg-white p-6 rounded-brand shadow-lg transition-transform group-hover:-translate-y-2">
                <AppImage
                  src={cert.src}
                  alt={cert.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <p className="font-bold text-center text-sm uppercase tracking-wide">{cert.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
