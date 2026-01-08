import { AppImage } from "@/components/general/AppImage";
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
      className={`section gap-4 ${getBackgroundColor(backgroundColor)}`}
    >
      <h3 className="subheading">{subheading}</h3>
      <div className="wrapper grid grid-cols-2 md:flex md:items-center md:justify-center gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="w-full flex flex-col justify-around items-center bg-gray-100 sm:bg-transparent p-2 sm:p-0 rounded-[1.875rem] sm:rounded-none"
          >
            <AppImage
              src={certificate.image.url}
              alt={
                certificate.image.alternativeText ||
                "No alternative text provided"
              }
              height={100}
              width={100}
              className="w-full object-cover object-center rounded-[1.875rem] max-w-[9.375rem]"
            />
            <div className="text-center sm:text-slate-50 mt-4">
              <ReactMarkdown>{certificate.logoText}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
