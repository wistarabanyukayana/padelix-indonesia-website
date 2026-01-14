import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Certifications } from "@/components/sections/Certifications";
import { Portfolio } from "@/components/sections/Portfolio";
import { Contact } from "@/components/sections/Contact";
import { getFeaturedProducts, getFeaturedPortfolios } from "@/data/public";
import { siteConfig } from "@/config/site";
import { Mail } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook } from "@icons-pack/react-simple-icons";

export const dynamic = "force-dynamic";

// Content Configuration
const HERO_CONTENT = {
  heading: "Selamat datang di Padelix Indonesia!",
  subHeading: "Padelix Indonesia menawarkan solusi terbaik untuk lapangan dan peralatan padel berkualitas tinggi. Bergabunglah dengan kami dan tingkatkan pengalaman bermain Anda.",
  backgroundImage: "/assets/hero-image.jpg",
  primaryCta: { text: "Lihat Produk", href: "/products" },
  secondaryCta: { text: "Hubungi Kami", href: "/#contact" }
};

const ABOUT_CONTENT = {
  subheading: "Tentang Kami",
  heading: "Padelix Indonesia",
  description: [
    "Padelix Indonesia adalah perusahaan yang menyediakan lapangan dan juga peralatan padel berkualitas tinggi. Kami berkomitmen untuk memberikan pengalaman bermain yang terbaik bagi para penggemar olahraga ini di seluruh Indonesia.",
    "Mulai dari perencanaan hingga instalasi, kami memastikan standar tertinggi dalam setiap proyek yang kami tangani."
  ],
  image: "/assets/about-image.png"
};

const CERTIFICATES_CONTENT = {
  subheading: "Kualitas Terjamin",
  heading: "Sertifikasi Kami",
  certificates: [
    { id: 1, name: "Standar Eropa", src: "/assets/certificates/european-standards.png" },
    { id: 2, name: "Standar Tiongkok", src: "/assets/certificates/chinese-standards.png" },
    { id: 3, name: "Standar Spanyol", src: "/assets/certificates/spanish-standards.png" },
    { id: 4, name: "Standar Internasional", src: "/assets/certificates/international-standards.png" },
  ]
};

const CONTACT_CONTENT = {
  subheading: "Informasi",
  heading: "Kontak Bisnis",
  contactLinks: [
    { id: 1, label: "Email", text: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}`, icon: Mail, color: "bg-brand-red" },
    { id: 2, label: "Whatsapp", text: siteConfig.contact.whatsappDisplay, href: siteConfig.links.whatsapp, icon: SiWhatsapp, color: "bg-brand-green" },
    { id: 3, label: "Instagram", text: `@${siteConfig.contact.instagram}`, href: siteConfig.contact.instagramUrl, icon: SiInstagram, color: "bg-brand-red" },
    { id: 4, label: "Facebook", text: `${siteConfig.contact.facebook}`, href: siteConfig.contact.facebookUrl, icon: SiFacebook, color: "bg-brand-green" },
  ]
};

export default async function Home() {
  const [featuredProducts, featuredPortfolios] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedPortfolios()
  ]);

  return (
    <main className="flex flex-col w-full">
      <Hero 
        heading={HERO_CONTENT.heading}
        subHeading={HERO_CONTENT.subHeading}
        backgroundImage={HERO_CONTENT.backgroundImage}
        primaryCta={HERO_CONTENT.primaryCta}
        secondaryCta={HERO_CONTENT.secondaryCta}
      />
      
      <About 
        subheading={ABOUT_CONTENT.subheading}
        heading={ABOUT_CONTENT.heading}
        description={ABOUT_CONTENT.description}
        image={ABOUT_CONTENT.image}
      />
      
      <FeaturedProducts products={featuredProducts} />
      
      <Certifications 
        heading={CERTIFICATES_CONTENT.heading} 
        subheading={CERTIFICATES_CONTENT.subheading}
        certificates={CERTIFICATES_CONTENT.certificates}
      />
      
      <Portfolio items={featuredPortfolios} />
      
      <Contact 
        subheading={CONTACT_CONTENT.subheading}
        heading={CONTACT_CONTENT.heading}
        contactLinks={CONTACT_CONTENT.contactLinks}
      />
    </main>
  );
}
