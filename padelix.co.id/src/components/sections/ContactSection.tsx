import { StrapiImage } from "@/components/general/StrapiImage";
import ReactMarkdown from "react-markdown";

import { ContactSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";

export function ContactSection({
  subheading,
  backgroundColor,
  contactForm,
  contactInfo,
}: Readonly<ContactSectionProps>) {
  return (
    <section
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center flex-col gap-4`}
    ></section>
  );
}
