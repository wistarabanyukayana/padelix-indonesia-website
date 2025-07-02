export interface LinkProps {
  id: number;
  text: string;
  href: string;
  isExternal: boolean;
}

export interface ImageProps {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string;
}

export interface LogoProps {
  logoText: string;
  image: ImageProps;
}

type ComponentType = "sections.hero-section" | "sections.info-section";

interface Base<
  T extends ComponentType,
  D extends object = Record<string, unknown>
> {
  id: number;
  __component?: T;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  data?: D;
}

export type Section = HeroSectionProps | InfoSectionProps;

export interface HeroSectionProps extends Base<"sections.hero-section"> {
  heading: string;
  content: string;
  image: ImageProps;
}

export interface InfoSectionProps extends Base<"sections.info-section"> {
  reversed?: boolean;
  title: string;
  headline: string;
  content: string;
  image: ImageProps;
}
