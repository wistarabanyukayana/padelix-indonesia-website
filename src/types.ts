import { 
  products, 
  portfolios, 
  categories, 
  brands, 
  users, 
  roles, 
  permissions,
  productMedias,
  productSpecifications,
  productVariants,
  portfolioMedias,
  medias,
  auditLogs
} from "@/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import type React from "react";

// ==========================================
// 1. Database Model Types (Direct from Drizzle)
// ==========================================
export type DBProduct = InferSelectModel<typeof products>;
export type DBPortfolio = InferSelectModel<typeof portfolios>;
export type DBCategory = InferSelectModel<typeof categories>;
export type DBBrand = InferSelectModel<typeof brands>;
export type DBUser = InferSelectModel<typeof users>;
export type DBRole = InferSelectModel<typeof roles>;
export type DBPermission = InferSelectModel<typeof permissions>;
export type DBMedia = InferSelectModel<typeof medias>;
export type DBProductMedia = InferSelectModel<typeof productMedias>;
export type DBPortfolioMedia = InferSelectModel<typeof portfolioMedias>;
export type DBProductSpec = InferSelectModel<typeof productSpecifications>;
export type DBProductVariant = InferSelectModel<typeof productVariants>;
export type DBAuditLog = InferSelectModel<typeof auditLogs>;

export interface MediaMetadata {
  folder?: string | null;
  assetId?: string;
  playbackId?: string;
  status?: string;
  duration?: number;
  aspectRatio?: string;
  error?: string;
  [key: string]: unknown;
}

// ==========================================
// 2. UI & Component Specific Types
// ==========================================

// --- Shared ---
export interface ActionState {
  success?: boolean;
  message?: string;
  error?: Record<string, string[]>;
}

export type FormAction = (state: ActionState, payload: FormData) => Promise<ActionState>;

export interface UploadResult {
  url?: string;
  id?: number;
  error?: string;
}

export interface NavLink {
  id: number;
  text: string;
  href: string;
}

// --- Media Library ---

export interface MediaUI {
  id: number;
  url: string;
  type: "image" | "video" | "document" | "audio" | "other";
  metadata?: MediaMetadata | null;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface MediaPayload {
  id: number;
  isPrimary: boolean;
  sortOrder: number;
  altText: string | null;
}

// --- Products ---
export interface FeaturedProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  showPrice: boolean;
  image: string; // URL of primary image
}

export interface ProductVariantUI {
  id?: number;
  name: string;
  priceAdjustment: string | number;
  sku: string | null;
  stock: string | number;
  isUnlimited: boolean;
}

export interface ProductSpecUI {
  key: string;
  value: string | null;
}

export interface DetailedProduct extends DBProduct {
  categoryName?: string | null;
  parentCategoryName?: string | null;
  brandName?: string | null;
  brandLogo?: string | null;
  medias: MediaUI[];
  specs: ProductSpecUI[];
  variants: ProductVariantUI[];
}

// --- Portfolios ---
export interface FeaturedPortfolio {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  description: string | null;
  image: string; // Primary image URL
  medias: MediaUI[]; // All assets
}

// --- Navigation ---
export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  type: "group";
  label: string;
  items: NavItem[];
}

export interface NavLinkSection {
  type: "link";
  label: string;
  href: string;
}

export type NavSection = NavGroup | NavLinkSection;

// ==========================================
// 3. Component Props
// ==========================================

export interface ProductCardProps {
  product: FeaturedProduct;
}

export interface ProductInfoProps {
  product: DetailedProduct;
}

export interface ProductMediaGalleryProps {
  medias: MediaUI[];
  productName: string;
}

export interface PortfolioProps {
  items: FeaturedPortfolio[];
}

export interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export interface CategoriesProps {
  categories: DBCategory[];
}

export interface CategoryFormProps {
  action: FormAction;
  initialData?: DBCategory;
  categories: DBCategory[];
  allMedias: DBMedia[];
}

export interface CategoryTreeNode extends DBCategory {
  level: number;
  children?: CategoryTreeNode[];
}

export interface BrandFormProps {
  action: FormAction;
  initialData?: DBBrand;
  allMedias: DBMedia[];
}

export interface PortfolioFormProps {
  action: FormAction;
  initialData?: DetailedPortfolio;
  allMedias: DBMedia[];
  currentFolder?: string | null;
}

export interface DetailedPortfolio extends DBPortfolio {
  medias: MediaUI[];
}

export interface DetailedUser extends DBUser {
  roles: number[]; // Array of role IDs
}

export interface ProductFormProps {
  action: FormAction;
  initialData?: DetailedProduct;
  categories: DBCategory[];
  brands: DBBrand[];
  allMedias: DBMedia[];
  currentFolder?: string | null;
}

export interface ContactLink {
  id: number;
  label: string;
  text: string;
  href: string;
  icon: string | React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

export interface ContactProps {
  subheading: string;
  heading: string;
  contactLinks: ContactLink[];
}

export interface Certificate {
  id: number;
  name: string;
  src: string;
}

export interface CertificationsProps {
  heading: string;
  subheading: string;
  certificates: Certificate[];
}

export interface HeroProps {
  heading: string;
  subHeading: string;
  backgroundImage: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export interface AboutProps {
  subheading: string;
  heading: string;
  description: string[];
  image: string;
}

// ==========================================
// 4. Auth Types
// ==========================================

export interface SessionPayload {
  user: {
    id: number;
    username: string;
    email: string;
    permissions: string[];
  };
  expires: string | Date;
}
