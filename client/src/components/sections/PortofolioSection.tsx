import { MediaPlayerProps, PortofolioSectionProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { PortofolioCarousel } from "../special/portofolio/PortofolioCarousel";

export function PortofolioSection({
  subheading,
  portofoliosMedia,
  backgroundColor,
}: Readonly<PortofolioSectionProps>) {
  const id = subheading.toLocaleLowerCase().replace(" ", "-");

  return (
    <section
      id={id}
      className={`section gap-4 ${getBackgroundColor(backgroundColor)}`}
    >
      <h3 className="subheading text-slate-50">{subheading}</h3>
      <PortofolioCarousel portofoliosMedia={portofoliosMedia as MediaPlayerProps[]} />
    </section>
  );
}
