import { StrapiImage } from "@/components/general/StrapiImage";
import ReactMarkdown from "react-markdown";

import { CertificateSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";

export function CertificateSection({
  subheading,
  certificates,
  backgroundColor,
}: Readonly<CertificateSectionProps>) {
  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center flex-col gap-4 scroll-mt-[4.75rem] sm:scroll-mt-[6.25rem] `}
    >
      <h3 className="subheading">{subheading}</h3>
      <div className="carrier grid grid-cols-2 md:flex md:items-center md:justify-center gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="w-full flex flex-col justify-around items-center"
          >
            <StrapiImage
              src={certificate.image.url}
              alt={
                certificate.image.alternativeText ||
                "No alternative text provided"
              }
              height={100}
              width={100}
              className="w-full object-cover object-center rounded-[1.875rem] max-w-[9.375rem]"
            />
            <div className="text-center text-slate-50 mt-4">
              <ReactMarkdown>{certificate.logoText}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
