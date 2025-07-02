import type { Section } from "@/types";

import { HeroSection } from "@/components/sections/HeroSection";
import { InfoSection } from "@/components/sections/InfoSection";

function sectionRenderer(section: Section, index: number) {
  switch (section.__component) {
    case "sections.hero-section":
      return <HeroSection key={index} {...section} />;
    case "sections.info-section":
      return <InfoSection key={index} {...section} />;
    default:
      return null;
  }
}

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return sections.map((section, index) => sectionRenderer(section, index));
}
