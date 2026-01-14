export const siteConfig = {
  name: "Padelix Indonesia",
  shortName: "Padelix",
  description: "Penyedia lapangan padel profesional dan peralatan padel kualitas dunia di Indonesia. Solusi lengkap dari perencanaan hingga instalasi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://padelix.co.id",
  ogImage: "/assets/hero-image.jpg",
  keywords: ["padel indonesia", "lapangan padel", "raket padel", "padel court builder", "padelix"],
  contact: {
    whatsapp: "6282122122250",
    whatsappDisplay: "+62 821-2212-2250",
    email: "business@padelix.co.id",
    instagram: "padelixindonesia",
    instagramUrl: "https://www.instagram.com/padelixindonesia/",
    facebook: "Padelix Indonesia",
    facebookUrl: "https://www.facebook.com/padelixindonesia"
  },
  links: {
    whatsapp: `https://wa.me/6282122122250`,
  }
};

export type SiteConfig = typeof siteConfig;
