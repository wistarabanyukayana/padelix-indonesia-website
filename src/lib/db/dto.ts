export interface ImageDTO {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface LinkDTO {
  id: number;
  url: string;
  label: string;
  isExternal: boolean;
}

// Components
export interface HeaderDTO {
  logoText?: string;
  ctaButton?: LinkDTO;
  navLinks: LinkDTO[];
}

export interface FooterDTO {
  logoText?: string;
  text?: string;
  socialLinks: LinkDTO[];
}

// Dynamic Zone Sections
export type SectionDTO = 
  | { __component: 'sections.hero-section'; heading: string; subHeading: string; image: ImageDTO; link?: LinkDTO }
  | { __component: 'sections.info-section'; title: string; content: string; image?: ImageDTO; reversed?: boolean }
  | { __component: 'sections.product-section'; title: string; products: string[] } // Array of product IDs/Slugs
  | { __component: 'sections.certificate-section'; title: string; images: ImageDTO[] }
  | { __component: 'sections.contact-section'; title: string; email: string; phone: string }
  | { __component: 'sections.portofolio-section'; title: string; images: ImageDTO[] };


// Content Types
export interface ProductDTO {
  id: string;
  name: string;
  code: string;
  slug: string;
  featured: boolean;
  price?: string;
  image: ImageDTO;
  description: string;
  specification?: string; // Rich text/HTML
  sections?: SectionDTO[];
}

export interface HomePageDTO {
  id: string;
  title: string;
  description?: string;
  sections: SectionDTO[];
}

export interface GlobalDTO {
  id: string;
  title: string;
  description?: string;
  header: HeaderDTO;
  footer: FooterDTO;
}

export interface ContactSignupDTO {
  name: string;
  contact: string; // Email or Phone
  message: string;
  createdAt: Date;
}
