// src/app/page.tsx
import { HeroSection } from "@/components/sections/HeroSection";
import { InfoSection } from "@/components/sections/InfoSection";
import { ProductSection } from "@/components/sections/ProductSection";
import { CertificateSection } from "@/components/sections/CertificateSection";
import { PortofolioSection } from "@/components/sections/PortofolioSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HOME_PAGE_CONTENT } from "@/data/static-content";

export default function Home() {
  const { hero, info, certificates, portfolio, contact } = HOME_PAGE_CONTENT;

  // Simple transformation from static content to expected component props
  const common = { id: 0, documentId: "static", backgroundColor: "white" as const };

  return (
    <main className="w-full">
      <HeroSection 
        {...common}
        heading={hero.heading}
        content={hero.content}
        image={{ id: 0, documentId: "hero", url: hero.image.src, alternativeText: hero.image.alt }}
      />

      <div id="about">
        <InfoSection 
          {...common}
          backgroundColor="black"
          heading={info.heading}
          subheading={info.subheading}
          content={info.content}
          image={{ id: 0, documentId: "about", url: info.image.src, alternativeText: info.image.alt }}
          reversed={info.reversed}
        />
      </div>

      <ProductSection 
        {...common}
        backgroundColor="green"
        subheading="Produk"
      />

      <CertificateSection 
        {...common}
        backgroundColor="red"
        subheading={certificates.subheading}
        certificates={certificates.items.map(c => ({
          id: c.id,
          logoText: c.name,
          backgroundColor: "white",
          image: { id: 0, documentId: `cert-${c.id}`, url: c.image, alternativeText: c.name }
        }))}
      />

      <PortofolioSection 
        {...common}
        backgroundColor="black"
        subheading={portfolio.subheading}
        portofoliosMedia={portfolio.items.map(p => ({
          id: p.id,
          mediaText: p.title,
          media: p.images.map((img, i) => ({ id: i, documentId: `port-${p.id}-${i}`, url: img, alternativeText: p.title })),
          muxVideo: undefined
        }))}
      />

      <div id="contact">
        <ContactSection 
          {...common}
          subheading={contact.subheading}
          contactForm={{ heading: contact.formHeading }}
          contactInfo={{
            heading: contact.infoHeading,
            logoLink: contact.links.map(l => ({
              id: l.id,
              logo: { id: l.id, logoText: l.label, backgroundColor: "white", image: { id: 0, documentId: `link-${l.id}`, url: l.icon, alternativeText: l.label } },
              link: { id: l.id, text: l.text, href: l.href, isExternal: true }
            }))
          }}
        />
      </div>
    </main>
  );
}