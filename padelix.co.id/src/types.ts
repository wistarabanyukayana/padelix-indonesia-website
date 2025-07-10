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
  id: number;
  logoText: string;
  image: ImageProps;
}

export interface LogoLinkProps {
  id: number;
  logo: LogoProps;
  link: LinkProps;
}

export interface ProductProps {
  id: number;
  documentId: string;
  name: string;
  code: string;
  description: string;
  image: ImageProps;
  slug: string;
  featured: boolean;
  createdAt: string;
  basePath: string;
}

type ComponentType =
  | "sections.hero-section"
  | "sections.info-section"
  | "sections.product-section"
  | "sections.certificate-section"
  | "sections.contact-section";

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

export type Section =
  | HeroSectionProps
  | InfoSectionProps
  | ProductSectionProps
  | CertificateSectionProps
  | ContactSectionProps;

export interface HeroSectionProps extends Base<"sections.hero-section"> {
  backgroundColor: "white" | "black" | "green" | "red";
  heading: string;
  content: string;
  image: ImageProps;
}

export interface InfoSectionProps extends Base<"sections.info-section"> {
  backgroundColor: "white" | "black" | "green" | "red";
  reversed?: boolean;
  subheading?: string;
  heading: string;
  content: string;
  image: ImageProps;
}

export interface ProductSectionProps extends Base<"sections.product-section"> {
  backgroundColor: "white" | "black" | "green" | "red";
  subheading: string;
}

export interface CertificateSectionProps
  extends Base<"sections.certificate-section"> {
  backgroundColor: "white" | "black" | "green" | "red";
  subheading: string;
  certificates: LogoProps[];
}

export interface ContactSectionProps extends Base<"sections.contact-section"> {
  backgroundColor: "white" | "black" | "green" | "red";
  subheading: string;
  contactForm: {
    heading: string;
  };
  contactInfo: {
    heading: string;
    logoLink: LogoLinkProps[];
  };
}
