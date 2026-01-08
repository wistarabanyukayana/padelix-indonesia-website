/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import * as PageRepo from "@/lib/db/repositories/pages";
import * as ProductRepo from "@/lib/db/repositories/products";
import { ProductDTO, SectionDTO, ImageDTO } from "@/lib/db/dto";
import { Section } from "@/types";

// --- Mappers ---

function mapImage(img?: ImageDTO) {
  if (!img) return null;
  return {
    ...img,
    id: 0,
    documentId: "img-doc-id",
    alternativeText: img.alt || "",
  };
}

function mapSection(section: SectionDTO): Section {
  // Common mapping for all sections
  const base = {
    id: 0, // Fake ID
    ...section,
    backgroundColor: "white" as const, // Default for all sections
  };

  // Specific mappings if properties need adjustment
  if (section.__component === "sections.hero-section") {
    return {
      ...base,
      content: section.subHeading, // Map subHeading to content
      image: mapImage(section.image)!,
    } as any;
  }
  if (section.__component === "sections.info-section") {
    return {
      ...base,
      image: mapImage(section.image)!,
      content: section.content, 
    } as any;
  }
  if (section.__component === "sections.certificate-section") {
    return {
      ...base,
      subheading: "",
      certificates: section.images.map((img) => ({
        id: 0,
        logoText: "",
        backgroundColor: "white",
        image: mapImage(img)!,
      })),
    } as any;
  }
  if (section.__component === "sections.portofolio-section") {
    return {
      ...base,
      subheading: "",
      portofoliosMedia: section.images.map((img) => ({
        id: 0,
        mediaText: "",
        media: [mapImage(img)!],
        muxVideo: undefined, 
      })),
    } as any;
  }
  if (section.__component === "sections.contact-section") {
      // Need to construct nested structure expected by ContactSectionProps
      return {
          ...base,
          subheading: "",
          contactForm: { heading: section.title },
          contactInfo: {
              heading: "Contact Us",
              logoLink: [] // TODO: Populate if needed from global or specific data
          }
      } as any;
  }

  // Product section?
  if (section.__component === "sections.product-section") {
      return {
          ...base,
          subheading: "",
      } as any;
  }

  return base as any;
}

function mapProduct(p: ProductDTO) {
  return {
    ...p,
    id: 0,
    documentId: p.id,
    image: mapImage(p.image) || { id: 0, documentId: "", url: "", alternativeText: "" },
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

export async function getGlobalSettings() {
  let data = await PageRepo.getGlobalSettings();
  
  // If data is missing (e.g. mock mode), use dummy data
  if (!data) {
      data = {
          id: "dummy-global",
          title: "Padelix Indonesia",
          description: "Padel Starts Here",
          header: {
              logoText: "Padelix",
              navLinks: [],
          },
          footer: {
              logoText: "Padelix",
              text: "Padel Starts Here",
              socialLinks: [],
          }
      };
  }

  const dummyImage = { id: 0, documentId: "dummy", url: "", alternativeText: "" };
  const dummyLogo = { id: 0, logoText: "Padelix", backgroundColor: "white" as const, image: dummyImage };

  return {
    data: {
      ...data,
      id: 0,
      header: {
        backgroundColor: "white" as const,
        logo: dummyLogo,
        navigation: data.header.navLinks?.map(l => ({
            id: l.id,
            text: l.label,
            href: l.url,
            isExternal: l.isExternal
        })) || [],
        moreOptionIcon: dummyLogo,
      },
      footer: {
        logoText: data.footer.logoText || "Padelix",
        text: data.footer.text || "",
        copy: "© 2025 Padelix Indonesia. All rights reserved.",
        backgroundColor: "white" as const,
        socialLinks: data.footer.socialLinks?.map(l => ({
            id: l.id,
            text: l.label,
            href: l.url,
            isExternal: l.isExternal
        })) || [],
      },
    },
  };
}
export async function getHomePage() {
  const data = await PageRepo.getHomePage();
  if (!data) return { data: null };

  return {
    data: {
      ...data,
      id: 0,
      sections: data.sections.map(mapSection),
    },
  };
}

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

  // 1. Filter
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

  // 2. Pagination
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

// For dynamic sitemap
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getProductList(path?: string) {
  const products = await ProductRepo.getProducts();
  return {
    data: products.map(mapProduct),
  };
}