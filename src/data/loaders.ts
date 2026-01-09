/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import * as ProductRepo from "@/lib/db/repositories/products";
import { ProductDTO, SectionDTO, ImageDTO } from "@/lib/db/dto";
import { Section, ImageProps, HeroSectionProps, InfoSectionProps, ProductSectionProps, CertificateSectionProps, PortofolioSectionProps, ContactSectionProps } from "@/types";

// --- Mappers ---

function mapImage(img?: ImageDTO): ImageProps {
  if (!img) return { id: 0, documentId: "", url: "", alternativeText: "" };
  
  return {
    id: 0,
    documentId: "img-doc-id",
    url: img.url,
    alternativeText: img.alt || "",
  };
}

function mapSection(section: SectionDTO): Section {
  const common = {
    id: 0,
    documentId: `section-${Math.random()}`,
    backgroundColor: "white" as const,
  };

  if (section.__component === "sections.hero-section") {
    const result: HeroSectionProps = {
      ...common,
      __component: "sections.hero-section",
      heading: section.heading,
      content: section.subHeading,
      image: mapImage(section.image),
    };
    return result;
  }

  if (section.__component === "sections.info-section") {
    const result: InfoSectionProps = {
      ...common,
      __component: "sections.info-section",
      heading: section.title,
      content: section.content,
      image: mapImage(section.image),
      reversed: section.reversed,
    };
    return result;
  }

  if (section.__component === "sections.product-section") {
    const result: ProductSectionProps = {
      ...common,
      __component: "sections.product-section",
      subheading: section.title,
    };
    return result;
  }

  if (section.__component === "sections.certificate-section") {
    const result: CertificateSectionProps = {
      ...common,
      __component: "sections.certificate-section",
      subheading: section.title,
      certificates: section.images.map((img, index) => ({
        id: index,
        logoText: "",
        backgroundColor: "white",
        image: mapImage(img),
      })),
    };
    return result;
  }

  if (section.__component === "sections.portofolio-section") {
    const result: PortofolioSectionProps = {
      ...common,
      __component: "sections.portofolio-section",
      subheading: section.title,
      portofoliosMedia: section.images.map((img, index) => ({
        id: index,
        mediaText: "",
        media: [mapImage(img)],
        muxVideo: undefined,
      })),
    };
    return result;
  }

  if (section.__component === "sections.contact-section") {
    const result: ContactSectionProps = {
      ...common,
      __component: "sections.contact-section",
      subheading: "",
      contactForm: {
        heading: section.title,
      },
      contactInfo: {
        heading: "Hubungi Kami",
        logoLink: [
             { id: 1, logo: { id: 1, logoText: "Email", backgroundColor: "white", image: { id:0, documentId:"", url:"", alternativeText:""} }, link: { id: 1, text: section.email, href: `mailto:${section.email}`, isExternal: true } },
             { id: 2, logo: { id: 2, logoText: "Phone", backgroundColor: "white", image: { id:0, documentId:"", url:"", alternativeText:""} }, link: { id: 2, text: section.phone, href: `tel:${section.phone}`, isExternal: true } },
        ],
      },
    };
    return result;
  }

  throw new Error(`Unknown section component: ${JSON.stringify(section)}`);
}

function mapProduct(p: ProductDTO) {
  return {
    ...p,
    id: 0,
    documentId: p.id,
    image: mapImage(p.image),
    sections: p.sections?.map(mapSection) || [],
    specification: p.specification || "",
    price: p.price || "0",
    description: p.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    basePath: "/products",
  };
}

// --- Loaders ---

export async function getContentCarousel(path: string, featured?: boolean) {
  let products: ProductDTO[] = [];
  if (featured) {
    products = await ProductRepo.getFeaturedProducts();
  } else {
    products = await ProductRepo.getProducts();
  }

  return {
    data: products.map(mapProduct),
  };
}

export async function getContentList(
  path: string,
  featured?: boolean,
  query?: string,
  page?: string
) {
  let products = await ProductRepo.getProducts();

  if (featured) {
    products = products.filter((p) => p.featured);
  }

  if (query) {
    const lowerQ = query.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQ) ||
        p.code.toLowerCase().includes(lowerQ) ||
        p.description.toLowerCase().includes(lowerQ)
    );
  }

  const pageSize = 6;
  const pageNum = parseInt(page || "1", 10);
  const total = products.length;
  const pageCount = Math.ceil(total / pageSize);
  
  const start = (pageNum - 1) * pageSize;
  const paginatedProducts = products.slice(start, start + pageSize);

  return {
    data: paginatedProducts.map(mapProduct),
    meta: {
      pagination: {
        page: pageNum,
        pageSize,
        pageCount,
        total,
      },
    },
  };
}

export async function getSlugProduct(slug: string) {
  const product = await ProductRepo.getProductBySlug(slug);
  if (!product) return { data: [] };

  return {
    data: [mapProduct(product)], 
  };
}

export async function getProductList(path?: string) {
  const products = await ProductRepo.getProducts();
  return {
    data: products.map(mapProduct),
  };
}
