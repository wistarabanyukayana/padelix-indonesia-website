import { LogoProps, PortofolioSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { PortofolioCarousel } from "../special/portofolio/PortofolioCarousel";

export function PortofolioSection({
  subheading,
  portofolios,
  backgroundColor,
}: Readonly<PortofolioSectionProps>) {
  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section gap-4 ${getBackgroundColor(backgroundColor)}`}
    >
      <h3 className="subheading text-slate-50">{subheading}</h3>
      <PortofolioCarousel portofolios={portofolios as LogoProps[]} />
    </section>
  );
}
