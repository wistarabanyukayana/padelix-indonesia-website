import { About } from "@/components/public/About";
import { Certifications } from "@/components/public/Certifications";
import { Contact } from "@/components/public/Contact";
import { FeaturedProducts } from "@/components/public/FeaturedProducts";
import { Hero } from "@/components/public/Hero";
import { Marquee } from "@/components/public/Marquee";
import { Portfolio } from "@/components/public/Portfolio";
import { siteConfig } from "@/config/site";
import {
  getFeaturedPortfolios,
  getFeaturedProducts,
  getPublicStats,
} from "@/data/public";
import type { HeroStat } from "@/types";
import {
  SiFacebook,
  SiInstagram,
  SiWhatsapp,
} from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Content Configuration
const HERO_CONTENT = {
  kicker: "Padel Starts Here",
  heading: "Lapangan padel standar dunia,",
  headingAccent: "dibangun di Indonesia.",
  subHeading:
    "Dari perencanaan hingga instalasi — Padelix menyediakan konstruksi lapangan dan peralatan padel berkualitas tinggi untuk klub, komunitas, dan bisnis Anda.",
  backgroundImage: "/assets/hero-image.jpg",
  primaryCta: {
    text: "Bangun Lapangan",
    href: `${siteConfig.links.whatsapp}?text=${encodeURIComponent(
      "Halo Padelix, saya tertarik untuk membangun lapangan padel. Bisakah saya berkonsultasi lebih lanjut?",
    )}`,
  },
  secondaryCta: { text: "Lihat Peralatan", href: "/products" },
};

const MARQUEE_ITEMS = [
  "Padel Starts Here",
  "Lapangan",
  "Peralatan",
  "Konstruksi",
  "Instalasi",
  "Padelix Indonesia",
];

const ABOUT_CONTENT = {
  subheading: "Tentang Kami",
  heading: "Padelix Indonesia",
  description: [
    "Padelix Indonesia adalah perusahaan yang menyediakan lapangan dan juga peralatan padel berkualitas tinggi. Kami berkomitmen untuk memberikan pengalaman bermain yang terbaik bagi para penggemar olahraga ini di seluruh Indonesia.",
    "Mulai dari perencanaan hingga instalasi, kami memastikan standar tertinggi dalam setiap proyek yang kami tangani.",
  ],
  image: "/assets/about-image.png",
  steps: [
    {
      title: "Perencanaan",
      description:
        "Konsultasi kebutuhan, desain, dan spesifikasi lapangan bersama tim kami.",
    },
    {
      title: "Konstruksi",
      description:
        "Pembangunan lapangan dengan material berkualitas dan standar internasional.",
    },
    {
      title: "Instalasi",
      description: "Pemasangan hingga serah terima — lapangan siap digunakan.",
    },
  ],
};

const CERTIFICATES_CONTENT = {
  subheading: "Kualitas Terjamin",
  heading: "Sertifikasi Kami",
  certificates: [
    {
      id: 1,
      name: "Standar Eropa",
      src: "/assets/certificates/european-standards.png",
    },
    {
      id: 2,
      name: "Standar Tiongkok",
      src: "/assets/certificates/chinese-standards.png",
    },
    {
      id: 3,
      name: "Standar Spanyol",
      src: "/assets/certificates/spanish-standards.png",
    },
    {
      id: 4,
      name: "Standar Internasional",
      src: "/assets/certificates/international-standards.png",
    },
  ],
};

const CONTACT_CONTENT = {
  subheading: "Informasi",
  heading: "Kontak Bisnis",
  contactLinks: [
    {
      id: 1,
      label: "Email",
      text: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      icon: Mail,
      color: "bg-brand-red",
    },
    {
      id: 2,
      label: "Whatsapp",
      text: siteConfig.contact.whatsappDisplay,
      href: siteConfig.links.whatsapp,
      icon: SiWhatsapp,
      color: "bg-brand-green",
    },
    {
      id: 3,
      label: "Instagram",
      text: `@${siteConfig.contact.instagram}`,
      href: siteConfig.contact.instagramUrl,
      icon: SiInstagram,
      color: "bg-brand-red",
    },
    {
      id: 4,
      label: "Facebook",
      text: `${siteConfig.contact.facebook}`,
      href: siteConfig.contact.facebookUrl,
      icon: SiFacebook,
      color: "bg-brand-green",
    },
  ],
};

export default async function Home() {
  const [featuredProducts, featuredPortfolios, publicStats] = await Promise.all(
    [getFeaturedProducts(), getFeaturedPortfolios(), getPublicStats()],
  );

  // Real counts only — entries with zero are dropped
  const heroStats: HeroStat[] = [
    { value: `${publicStats.projects}`, label: "Proyek & Aktivitas" },
    { value: `${publicStats.products}`, label: "Produk Katalog" },
    { value: `${publicStats.brands}`, label: "Brand Dunia" },
    {
      value: `${CERTIFICATES_CONTENT.certificates.length}`,
      label: "Sertifikasi Standar",
    },
  ].filter((stat) => stat.value !== "0");

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    sameAs: [siteConfig.contact.instagramUrl, siteConfig.contact.facebookUrl],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: siteConfig.contact.email,
        telephone: siteConfig.contact.whatsappDisplay,
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };

  return (
    <main className="flex w-full flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([orgJsonLd, websiteJsonLd]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <Hero
        kicker={HERO_CONTENT.kicker}
        heading={HERO_CONTENT.heading}
        headingAccent={HERO_CONTENT.headingAccent}
        subHeading={HERO_CONTENT.subHeading}
        backgroundImage={HERO_CONTENT.backgroundImage}
        primaryCta={HERO_CONTENT.primaryCta}
        secondaryCta={HERO_CONTENT.secondaryCta}
        stats={heroStats}
      />

      <Marquee items={MARQUEE_ITEMS} />

      <About
        subheading={ABOUT_CONTENT.subheading}
        heading={ABOUT_CONTENT.heading}
        description={ABOUT_CONTENT.description}
        image={ABOUT_CONTENT.image}
        steps={ABOUT_CONTENT.steps}
      />

      <FeaturedProducts products={featuredProducts} />

      <Portfolio items={featuredPortfolios} />

      <Certifications
        heading={CERTIFICATES_CONTENT.heading}
        subheading={CERTIFICATES_CONTENT.subheading}
        certificates={CERTIFICATES_CONTENT.certificates}
      />

      <Contact
        subheading={CONTACT_CONTENT.subheading}
        heading={CONTACT_CONTENT.heading}
        contactLinks={CONTACT_CONTENT.contactLinks}
      />
    </main>
  );
}
